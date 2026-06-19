import {
  CanStateWalkOffLedge,
  GAME_EVENT_IDS,
  STATE_IDS
} from '../finite-state-machine/stateConfigurations/shared';
import { DivideRaw } from '../math/fixedPoint';
import { CreateConvexHull, IntersectsPolygons } from '../physics/collisions';
import {
  PlayerOnPlats,
  AddToPlayerPositionVec,
  PlayerOnStage,
  CanOnlyFallOffLedgeWhenFacingAwayFromIt,
  SetPlayerPositionRaw,
  AddToPlayerXPostionRaw,
  AddToPlayerYPositionRaw,
  Player
} from '../entity/playerOrchestrator';
import { isPlayerOnAnyStage, ShouldSoftlandRaw } from './shared';
import {
  CreateDiamondFromHistory,
  ECBComponent,
  EcbHistoryDTO
} from '../entity/components/ecb';
import { FlatVec } from '../physics/vector';
import {
  CORRECTION_DEPTH_RAW,
  POINT_SEVEN,
  POINT_TWO,
  TEN,
  TWO
} from '../math/numberConstants';
import { Stage } from '../stage/stageMain';
import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { ICollisionResult } from '../pools/CollisionResult';
import { Pool } from '../pools/Pool';
import { PooledVector } from '../pools/PooledVector';
import { PlayerData, StageData, Pools } from '../world/stateModules';
import { World } from '../world/world';

const CORNER_JITTER_CORRECTION_RAW = TWO;

export function StageCollisionDetection(world: World): void {
  const playerData: PlayerData = world.PlayerData;
  const playerHistories = world.HistoryData.PlayerHistoryDB;
  const stageData: StageData = world.StageData;
  const pools: Pools = world.Pools;
  const playerCount = playerData.PlayerCount;
  const stages = stageData.Stages;
  const stagesLength = stages.length;

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const ecb = p.ECB;

    let isPlayerOnAnyPlatform = false;
    for (let i = 0; i < stagesLength; i++) {
      const stage = stages[i];
      if (PlayerOnPlats(stage, ecb.Bottom, ecb.SensorDepth)) {
        isPlayerOnAnyPlatform = true;
        break;
      }
    }
    if (isPlayerOnAnyPlatform) {
      continue;
    }

    const pDb = playerHistories[playerIndex];
    const prevState = pDb.get(world.PreviousFrame);
    const prevEcbShape =
      ecb.ecbStateShapes.get(prevState.stateId) ?? ecb.OriginalShape;
    const preXRaw = prevState.posXRaw;
    const preYRaw = prevState.posYRaw;
    const preEcb = CreateDiamondFromHistory(
      prevEcbShape,
      preXRaw,
      preYRaw,
      pools.DiamondPool
    );
    const sm = playerData.StateMachine(playerIndex);
    const fsmInfo = p.FSMInfo;
    const preResolutionStateId = fsmInfo.CurrentStateId;
    // Store properties of the ECB before any changes
    const oldEcbHeightRaw = ecb.Height.Raw;
    const oldEcbWidthRaw = ecb.Width.Raw;
    const oldEcbYOffsetRaw = ecb.YOffset.Raw;

    let overallCollision = false;
    let firstCollisionResult: ICollisionResult | undefined;
    for (let i = 0; i < stagesLength; i++) {
      const stageVerts = stages[i].StageVerticies.GetVerts();
      const playerVerts = getECBHull(preEcb, p.ECB);
      const collisionResult = IntersectsPolygons(
        playerVerts,
        stageVerts,
        pools.VecPool,
        pools.ColResPool,
        pools.ProjResPool
      );

      if (collisionResult.Collision) {
        if (!overallCollision) {
          firstCollisionResult = collisionResult;
        }
        overallCollision = true;
        if (
          preResolutionStateId !== STATE_IDS.LEDGE_GETUP_S &&
          preResolutionStateId !== STATE_IDS.LEDGE_ROLL_S &&
          preResolutionStateId !== STATE_IDS.LEDGE_GRAB_S
        ) {
          resolveCollision(p, collisionResult, pools.VecPool);
        }
      }
    }

    if (overallCollision && preResolutionStateId === STATE_IDS.LAUNCH_S) {
      // Transition state to tech if teched.
      const normY = firstCollisionResult!.NormY;
      const normX = firstCollisionResult!.NormX;
      const ltf = p.Flags.LastTechFrame;
      const teched = ltf > 0 && ltf > world.LocalFrame - 20;
      const is = playerData.InputStore(p.ID);
      const ia = is.GetInputForFrame(world.LocalFrame);
      const rollRight = ia.LXAxisRaw >= POINT_TWO;
      const rolllLeft = ia.LXAxisRaw <= -POINT_TWO;
      // Using 0.7 as a threshold to distinguish vertical from horizontal collisions
      if (normY.Raw > POINT_SEVEN && p.Velocity.Y.Raw > 0) {
        if (teched) {
          if (rollRight) {
            p.Flags.FaceLeft();
            sm.UpdateFromWorld(GAME_EVENT_IDS.ROLL_TECH_GE);
          } else if (rolllLeft) {
            p.Flags.FaceRight();
            sm.UpdateFromWorld(GAME_EVENT_IDS.ROLL_TECH_GE);
          } else {
            sm.UpdateFromWorld(GAME_EVENT_IDS.TECH_IN_PLACE_GE);
          }
        } else {
          sm.UpdateFromWorld(GAME_EVENT_IDS.GRND_SLAM_GE);
        }
        p.Velocity.Y.SetFromRaw(-10);
      } else if (Math.abs(normX.Raw) > POINT_SEVEN) {
        sm.UpdateFromWorld(GAME_EVENT_IDS.WALL_SLAM_GE);
        if (normX.Raw > 0) {
          p.Flags.FaceLeft();
          p.Velocity.X.SetFromRaw(-TEN);
        } else if (normX.Raw < 0) {
          p.Flags.FaceRight();
          p.Velocity.X.SetFromRaw(TEN);
        }
      }
      continue;
    }

    const sensorDepth = p.ECB.SensorDepth;
    const grnd = isPlayerOnAnyStage(p.ECB.Bottom, stages, sensorDepth);
    const prvGrnd = isPlayerOnAnyStage(preEcb.Bottom, stages, sensorDepth);
    let stillGrounded = grnd;

    if (prvGrnd && !grnd) {
      let previousStage: Stage | undefined;
      for (let i = 0; i < stagesLength; i++) {
        const stage = stages[i];
        if (PlayerOnStage(stage, preEcb.Bottom, p.ECB.SensorDepth)) {
          previousStage = stage;
          break;
        }
      }

      if (previousStage) {
        handleWalkOff(p, previousStage, sm, pools);
        if (p.FSMInfo.CurrentStateId === STATE_IDS.LAND_S) {
          continue;
        }
      }
    }

    for (let i = 0; i < stagesLength; i++) {
      const stage = stages[i];
      if (PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth)) {
        stillGrounded = true;
        if (handleJitter(p, stage, pools)) {
          break;
        }
      }
    }

    const isGroundedAfterJitter = stillGrounded;

    if (
      isGroundedAfterJitter === false &&
      p.FSMInfo.CurrentStateId !== STATE_IDS.LEDGE_GRAB_S &&
      p.FSMInfo.CurrentStateId !== STATE_IDS.LEDGE_GETUP_S &&
      p.FSMInfo.CurrentStateId !== STATE_IDS.LEDGE_ROLL_S
    ) {
      sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
      continue;
    }

    if (
      isGroundedAfterJitter === true &&
      overallCollision &&
      p.FSMInfo.CurrentStateId !== STATE_IDS.LEDGE_GETUP_S &&
      p.FSMInfo.CurrentStateId !== STATE_IDS.LEDGE_ROLL_S
    ) {
      sm.UpdateFromWorld(
        ShouldSoftlandRaw(p.Velocity.Y.Raw)
          ? GAME_EVENT_IDS.SOFT_LAND_GE
          : GAME_EVENT_IDS.LAND_GE
      );
    }

    const postResolutionStateId = fsmInfo.CurrentStateId;

    if (overallCollision && preResolutionStateId !== postResolutionStateId) {
      // ECB shape has been updated by the state change's OnEnter method.
      const newEcbHeightRaw = ecb.Height.Raw;
      const newEcbWidthRaw = ecb.Width.Raw;
      const newEcbYOffsetRaw = ecb.YOffset.Raw;

      const normXRaw = firstCollisionResult!.NormX.Raw;
      const normYRaw = firstCollisionResult!.NormY.Raw;

      // Y-axis correction for ground/ceiling collisions
      if (Math.abs(normYRaw) > POINT_SEVEN) {
        // Correct for change in vertical offset/size
        let yCorrectionRaw = oldEcbYOffsetRaw - newEcbYOffsetRaw;
        if (normYRaw < 0) {
          // Ceiling collision, normal points down. Account for height change.
          yCorrectionRaw -= oldEcbHeightRaw - newEcbHeightRaw;
        }
        AddToPlayerYPositionRaw(p, yCorrectionRaw);
      }

      // X-axis correction for wall collisions
      if (Math.abs(normXRaw) > POINT_SEVEN) {
        // Correct for change in horizontal size
        const xCorrectionRaw = DivideRaw(oldEcbWidthRaw - newEcbWidthRaw, TWO);

        if (normXRaw > 0) {
          // Hit a wall on player's left (e.g. stage's right wall), normal points right.
          // Player was pushed right. We need to adjust for width change.
          AddToPlayerXPostionRaw(p, -xCorrectionRaw);
        } else {
          // Hit a wall on player's right (e.g. stage's left wall), normal points left.
          // Player was pushed left.
          AddToPlayerXPostionRaw(p, xCorrectionRaw);
        }
      }
    }
  }
}

function handleWalkOff(
  p: Player,
  previousStage: Stage,
  sm: StateMachine,
  pools: Pools
) {
  const stageGround = previousStage.StageVerticies.GetGround();
  if (stageGround.length > 0) {
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

    let shouldSnapBack = false;

    if (CanOnlyFallOffLedgeWhenFacingAwayFromIt(p)) {
      const fellOffLeftLedge = p.Position.X.Raw < leftStagePoint.X.Raw;
      const fellOffRightLedge = p.Position.X.Raw > rightStagePoint.X.Raw;
      const isFacingRight = p.Flags.IsFacingRight;

      if (
        (fellOffLeftLedge && isFacingRight) ||
        (fellOffRightLedge && !isFacingRight)
      ) {
        shouldSnapBack = true;
      }
    } else if (CanStateWalkOffLedge(p.FSMInfo.CurrentStateId) === false) {
      shouldSnapBack = true;
    }

    if (shouldSnapBack) {
      const position = p.Position;
      const yPosRaw = p.ECB.YOffset.Raw - CORRECTION_DEPTH_RAW;
      if (
        Math.abs(position.X.Raw - leftStagePoint.X.Raw) <
        Math.abs(position.X.Raw - rightStagePoint.X.Raw)
      ) {
        SetPlayerPositionRaw(
          p,
          leftStagePoint.X.Raw + CORRECTION_DEPTH_RAW,
          leftStagePoint.Y.Raw - yPosRaw
        );
      } else {
        SetPlayerPositionRaw(
          p,
          rightStagePoint.X.Raw - CORRECTION_DEPTH_RAW,
          rightStagePoint.Y.Raw - yPosRaw
        );
      }
      sm.UpdateFromWorld(GAME_EVENT_IDS.LAND_GE);
    }
  }
}

function handleJitter(p: Player, stage: Stage, pools: Pools): boolean {
  const stageGround = stage.StageVerticies.GetGround();
  if (stageGround.length === 0) return false;

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

  const standingOnLeftLedge =
    Math.abs(p.Position.X.Raw - leftStagePoint.X.Raw) <=
    CORNER_JITTER_CORRECTION_RAW;
  const standingOnRightLedge =
    Math.abs(p.Position.X.Raw - rightStagePoint.X.Raw) <=
    CORNER_JITTER_CORRECTION_RAW;

  if (standingOnLeftLedge) {
    SetPlayerPositionRaw(
      p,
      leftStagePoint.X.Raw + CORNER_JITTER_CORRECTION_RAW,
      p.Position.Y.Raw
    );
    return true;
  }
  if (standingOnRightLedge) {
    SetPlayerPositionRaw(
      p,
      rightStagePoint.X.Raw - CORNER_JITTER_CORRECTION_RAW,
      p.Position.Y.Raw
    );
    return true;
  }
  return false;
}

const combinedEcbVerts = new Array<FlatVec>();
function getECBHull(prevEcb: EcbHistoryDTO, curEcb: ECBComponent) {
  combinedEcbVerts.length = 0;
  combinedEcbVerts.push(prevEcb.Bottom);
  combinedEcbVerts.push(prevEcb.Left);
  combinedEcbVerts.push(prevEcb.Top);
  combinedEcbVerts.push(prevEcb.Right);
  for (let i = 0; i < 4; i++) {
    combinedEcbVerts.push(curEcb.GetActiveVerts()[i]);
  }
  const hull = CreateConvexHull(combinedEcbVerts);
  return hull;
}

function resolveCollision(
  p: Player,
  collisionResult: ICollisionResult,
  vecPool: Pool<PooledVector>
) {
  const normalXRaw = collisionResult.NormX.Raw;
  const normalYRaw = collisionResult.NormY.Raw;
  const move = vecPool
    .Rent()
    .SetXYRaw(normalXRaw, normalYRaw)
    .Negate()
    .Multiply(collisionResult.Depth);

  if (normalXRaw === 0 && normalYRaw > 0) {
    move.AddToYRaw(CORRECTION_DEPTH_RAW);
  } else if (normalXRaw > 0 && normalYRaw === 0) {
    move.AddToXRaw(CORRECTION_DEPTH_RAW);
  } else if (normalXRaw < 0 && normalYRaw === 0) {
    move.AddToXRaw(-CORRECTION_DEPTH_RAW);
  } else if (normalXRaw === 0 && normalYRaw < 0) {
    move.AddToYRaw(-CORRECTION_DEPTH_RAW);
  } else if (Math.abs(normalXRaw) > 0 && normalYRaw > 0) {
    move.AddToXRaw(move.X.Raw <= 0 ? move.Y.Raw : -move.Y.Raw);
  }

  AddToPlayerPositionVec(p, move);
}
