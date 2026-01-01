import {
  CanStateWalkOffLedge,
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../finite-state-machine/stateConfigurations/shared';
import { NumberToRaw } from '../math/fixedPoint';
import { CreateConvexHull, IntersectsPolygons } from '../physics/collisions';
import {
  PlayerOnPlats,
  AddToPlayerPositionVec,
  PlayerOnStage,
  SetPlayerInitialPositionRaw,
  CanOnlyFallOffLedgeWhenFacingAwayFromIt,
  SetPlayerPositionRaw,
  AddToPlayerYPositionRaw,
} from '../entity/playerOrchestrator';
import { PlayerData, Pools, StageData, World } from '../world/world';
import { CORRECTION_DEPTH_RAW, ShouldSoftlandRaw } from './shared';
import {
  CreateDiamondFromHistory,
  ECBComponent,
  EcbHistoryDTO,
} from '../entity/components/ecb';
import { FlatVec } from '../physics/vector';

const CORNER_JITTER_CORRECTION_RAW = NumberToRaw(2);

export function StageCollisionDetection(world: World): void {
  const playerData: PlayerData = world.PlayerData;
  const componentHistories = world.HistoryData.PlayerComponentHistories;
  const stageData: StageData = world.StageData;
  const pools: Pools = world.Pools;
  const playerCount = playerData.PlayerCount;
  const stage = stageData.Stage;
  const stageGround = stage.StageVerticies.GetGround();
  const leftMostPiece = stageGround[0];
  const rightMostPiece = stageGround[stageGround.length - 1];
  const leftStagePoint = pools.VecPool.Rent().SetXY(
    leftMostPiece.X1,
    leftMostPiece.Y1
  );
  const rightStagePoint = pools.VecPool.Rent().SetXY(
    rightMostPiece.X2,
    rightMostPiece.Y2
  );

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const ecb = p.ECB;
    const prevEcbSnapShot =
      componentHistories[playerIndex].EcbHistory[world.PreviousFrame];
    const preEcb = CreateDiamondFromHistory(prevEcbSnapShot, pools.DiamondPool);
    const playerOnPlats = PlayerOnPlats(stage, ecb.Bottom, ecb.SensorDepth);

    if (playerOnPlats) {
      continue;
    }

    const sm = playerData.StateMachine(playerIndex);
    const playerVerts = getHull(preEcb, ecb);
    const fsmInfo = p.FSMInfo;
    const preResolutionStateId = fsmInfo.CurrentStatetId;
    const preResolutionYOffsetRaw = ecb.YOffset.Raw;
    const stageVerts = stage.StageVerticies.GetVerts();

    // --- 1. Always resolve collision first ---
    const collisionResult = IntersectsPolygons(
      playerVerts,
      stageVerts,
      pools.VecPool,
      pools.ColResPool,
      pools.ProjResPool
    );

    if (collisionResult.Collision) {
      const normalXRaw = collisionResult.NormX.Raw;
      const normalYRaw = collisionResult.NormY.Raw;
      const move = pools.VecPool.Rent()
        .SetXYRaw(normalXRaw, normalYRaw)
        .Negate()
        .Multiply(collisionResult.Depth);

      // Ground correction
      if (normalXRaw === 0 && normalYRaw > 0) {
        move.AddToYRaw(CORRECTION_DEPTH_RAW);
      }
      // Left wall correction
      else if (normalXRaw > 0 && normalYRaw === 0) {
        move.AddToXRaw(CORRECTION_DEPTH_RAW);
      }
      // Right wall correction
      else if (normalXRaw < 0 && normalYRaw === 0) {
        move.AddToXRaw(-CORRECTION_DEPTH_RAW);
      }
      // Ceiling
      else if (normalXRaw === 0 && normalYRaw < 0) {
        move.AddToYRaw(-CORRECTION_DEPTH_RAW);
      }
      // Corner case (top corners, normalY < 0)
      else if (Math.abs(normalXRaw) > 0 && normalYRaw > 0) {
        move.AddToXRaw(move.X.Raw <= 0 ? move.Y.Raw : -move.Y.Raw);
      }

      AddToPlayerPositionVec(p, move);
    }

    // --- 2. Jitter correction after collision resolution ---
    const onStage = PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth);
    const standingOnLeftLedge =
      Math.abs(p.Position.X.Raw - leftStagePoint.X.Raw) <=
      CORNER_JITTER_CORRECTION_RAW;
    const standingOnRightLedge =
      Math.abs(p.Position.X.Raw - rightStagePoint.X.Raw) <=
      CORNER_JITTER_CORRECTION_RAW;

    if (standingOnLeftLedge && onStage) {
      SetPlayerInitialPositionRaw(
        p,
        leftStagePoint.X.Raw + CORNER_JITTER_CORRECTION_RAW,
        p.Position.Y.Raw
      );
    } else if (standingOnRightLedge && onStage) {
      SetPlayerInitialPositionRaw(
        p,
        rightStagePoint.X.Raw - CORNER_JITTER_CORRECTION_RAW,
        p.Position.Y.Raw
      );
    }

    // --- 3. Grounded check and state update ---
    const grnd = PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth);
    const prvGrnd = PlayerOnStage(stage, preEcb.Bottom, p.ECB.SensorDepth);

    if (prvGrnd && !grnd) {
      // Player has just walked off the stage. Check if they should be snapped back.
      let shouldSnapBack = false;

      if (CanOnlyFallOffLedgeWhenFacingAwayFromIt(p)) {
        // This is the high-priority rule for specific attacks.
        const fellOffLeftLedge = p.Position.X < leftStagePoint.X;
        const fellOffRightLedge = p.Position.X > rightStagePoint.X;
        const isFacingRight = p.Flags.IsFacingRight;

        // Snap back ONLY if facing TOWARDS the stage after falling off.
        if (
          (fellOffLeftLedge && isFacingRight) ||
          (fellOffRightLedge && !isFacingRight)
        ) {
          shouldSnapBack = true;
        }
      } else if (CanStateWalkOffLedge(p.FSMInfo.CurrentStatetId) === false) {
        // This is the general rule for states like 'walk'.
        shouldSnapBack = true;
      }

      if (shouldSnapBack) {
        // Player was not allowed to fall. Snap them to the nearest ledge.
        const position = p.Position;
        if (
          Math.abs(position.X.Raw - leftStagePoint.X.Raw) <
          Math.abs(position.X.Raw - rightStagePoint.X.Raw)
        ) {
          SetPlayerPositionRaw(
            p,
            leftStagePoint.X.Raw + CORNER_JITTER_CORRECTION_RAW,
            leftStagePoint.Y.Raw
          );
        } else {
          SetPlayerPositionRaw(
            p,
            rightStagePoint.X.Raw - CORNER_JITTER_CORRECTION_RAW,
            rightStagePoint.Y.Raw
          );
        }
        sm.UpdateFromWorld(GAME_EVENT_IDS.LAND_GE);
        continue;
      }
    }

    // If not grounded and not grabbing ledge, set to falling
    if (grnd === false && p.FSMInfo.CurrentStatetId != STATE_IDS.LEDGE_GRAB_S) {
      sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
      continue;
    }

    // If grounded and had a collision, set landing state (soft/hard)
    if (grnd === true && collisionResult.Collision) {
      const ecbBottomYRaw = ecb.Bottom.Y.Raw;
      sm.UpdateFromWorld(
        ShouldSoftlandRaw(p.Velocity.Y.Raw)
          ? GAME_EVENT_IDS.SOFT_LAND_GE
          : GAME_EVENT_IDS.LAND_GE
      );
    }

    if (
      preResolutionStateId !== STATE_IDS.LAND_S &&
      preResolutionStateId !== STATE_IDS.SOFT_LAND_S &&
      (fsmInfo.CurrentStatetId === STATE_IDS.LAND_S ||
        fsmInfo.CurrentStatetId === STATE_IDS.SOFT_LAND_S)
    ) {
      AddToPlayerYPositionRaw(p, preResolutionYOffsetRaw);
    }
  }
}

const combinedEcbVerts = new Array<FlatVec>();
function getHull(prevEcb: EcbHistoryDTO, curEcb: ECBComponent) {
  combinedEcbVerts.length = 0;
  for (let i = 0; i < 4; i++) {
    combinedEcbVerts.push(prevEcb.shape[i]);
  }
  for (let i = 0; i < 4; i++) {
    combinedEcbVerts.push(curEcb.GetActiveVerts()[i]);
  }
  const hull = CreateConvexHull(combinedEcbVerts);
  return hull;
}
