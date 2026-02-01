import {
  CanStateWalkOffLedge,
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../finite-state-machine/stateConfigurations/shared';
import { FixedPoint } from '../math/fixedPoint';
import { CreateConvexHull, IntersectsPolygons } from '../physics/collisions';
import {
  PlayerOnPlats,
  AddToPlayerPositionVec,
  PlayerOnStage,
  CanOnlyFallOffLedgeWhenFacingAwayFromIt,
  SetPlayerPositionRaw,
  AddToPlayerYPositionRaw,
  Player,
} from '../entity/playerOrchestrator';
import { PlayerData, Pools, StageData, World } from '../world/world';
import { ShouldSoftlandRaw } from './shared';
import {
  CreateDiamondFromHistory,
  ECBComponent,
  EcbHistoryDTO,
} from '../entity/components/ecb';
import { FlatVec } from '../physics/vector';
import { CORRECTION_DEPTH_RAW, TWO } from '../math/numberConstants';
import { Stage } from '../stage/stageMain';
import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { ICollisionResult } from '../pools/CollisionResult';
import { Pool } from '../pools/Pool';
import { PooledVector } from '../pools/PooledVector';

const CORNER_JITTER_CORRECTION_RAW = TWO;

function isPlayerOnAnyStage(
  ecbBottom: FlatVec,
  stages: Stage[],
  sensorDepth: FixedPoint,
): boolean {
  for (const stage of stages) {
    if (PlayerOnStage(stage, ecbBottom, sensorDepth)) {
      return true;
    }
  }
  return false;
}

export function StageCollisionDetection(world: World): void {
  const playerData: PlayerData = world.PlayerData;
  const componentHistories = world.HistoryData.PlayerComponentHistories;
  const stageData: StageData = world.StageData;
  const pools: Pools = world.Pools;
  const playerCount = playerData.PlayerCount;
  const stages = stageData.Stages;

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const ecb = p.ECB;
    const prevEcbSnapShot =
      componentHistories[playerIndex].EcbHistory[world.PreviousFrame];
    const preEcb = CreateDiamondFromHistory(prevEcbSnapShot, pools.DiamondPool);

    let isPlayerOnAnyPlatform = false;
    for (const stage of stages) {
      if (PlayerOnPlats(stage, ecb.Bottom, ecb.SensorDepth)) {
        isPlayerOnAnyPlatform = true;
        break;
      }
    }
    if (isPlayerOnAnyPlatform) {
      continue;
    }

    const sm = playerData.StateMachine(playerIndex);
    const fsmInfo = p.FSMInfo;
    const preResolutionStateId = fsmInfo.CurrentStatetId;
    const preResolutionYOffsetRaw = ecb.YOffset.Raw;

    let overallCollision = false;
    for (const stage of stages) {
      const playerVerts = getECBHull(preEcb, p.ECB);
      const stageVerts = stage.StageVerticies.GetVerts();
      const collisionResult = IntersectsPolygons(
        playerVerts,
        stageVerts,
        pools.VecPool,
        pools.ColResPool,
        pools.ProjResPool,
      );

      if (collisionResult.Collision) {
        overallCollision = true;
        resolveCollision(p, collisionResult, pools.VecPool);
      }
    }

    const sensorDepth = p.ECB.SensorDepth;
    const grnd = isPlayerOnAnyStage(p.ECB.Bottom, stages, sensorDepth);
    const prvGrnd = isPlayerOnAnyStage(preEcb.Bottom, stages, sensorDepth);

    if (prvGrnd && !grnd) {
      let previousStage: Stage | undefined;
      for (const stage of stages) {
        if (PlayerOnStage(stage, preEcb.Bottom, p.ECB.SensorDepth)) {
          previousStage = stage;
          break;
        }
      }

      if (previousStage) {
        handleWalkOff(p, previousStage, sm, pools);
        if (p.FSMInfo.CurrentStatetId === STATE_IDS.LAND_S) {
          continue;
        }
      }
    }

    const finalGrounded = isPlayerOnAnyStage(p.ECB.Bottom, stages, sensorDepth);
    if (finalGrounded) {
      for (const stage of stages) {
        if (PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth)) {
          if (handleJitter(p, stage, pools)) {
            break;
          }
        }
      }
    }

    const isGroundedAfterJitter = isPlayerOnAnyStage(
      p.ECB.Bottom,
      stages,
      sensorDepth,
    );

    if (
      isGroundedAfterJitter === false &&
      p.FSMInfo.CurrentStatetId !== STATE_IDS.LEDGE_GRAB_S &&
      p.FSMInfo.CurrentStatetId !== STATE_IDS.WALL_SLIDE_S
    ) {
      sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
      continue;
    }

    if (isGroundedAfterJitter === true && overallCollision) {
      sm.UpdateFromWorld(
        ShouldSoftlandRaw(p.Velocity.Y.Raw)
          ? GAME_EVENT_IDS.SOFT_LAND_GE
          : GAME_EVENT_IDS.LAND_GE,
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

function handleWalkOff(
  p: Player,
  previousStage: Stage,
  sm: StateMachine,
  pools: Pools,
) {
  const stageGround = previousStage.StageVerticies.GetGround();
  if (stageGround.length > 0) {
    const leftMostPiece = stageGround[0];
    const rightMostPiece = stageGround[stageGround.length - 1];
    const leftStagePoint = pools.VecPool.Rent().SetXY(
      leftMostPiece.X1,
      leftMostPiece.Y1,
    );
    const rightStagePoint = pools.VecPool.Rent().SetXY(
      rightMostPiece.X2,
      rightMostPiece.Y2,
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
    } else if (CanStateWalkOffLedge(p.FSMInfo.CurrentStatetId) === false) {
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
          leftStagePoint.Y.Raw - yPosRaw,
        );
      } else {
        SetPlayerPositionRaw(
          p,
          rightStagePoint.X.Raw - CORRECTION_DEPTH_RAW,
          rightStagePoint.Y.Raw - yPosRaw,
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
    leftMostPiece.Y1,
  );
  const rightStagePoint = pools.VecPool.Rent().SetXY(
    rightMostPiece.X2,
    rightMostPiece.Y2,
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
      p.Position.Y.Raw,
    );
    return true;
  }
  if (standingOnRightLedge) {
    SetPlayerPositionRaw(
      p,
      rightStagePoint.X.Raw - CORNER_JITTER_CORRECTION_RAW,
      p.Position.Y.Raw,
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
  vecPool: Pool<PooledVector>,
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
