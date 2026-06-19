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
  Player,
  PlayerOnStageOrPlats
} from '../entity/playerOrchestrator';
import { ShouldSoftlandRaw } from './shared';
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
    
    const oldEcbHeightRaw = ecb.Height.Raw;
    const oldEcbWidthRaw = ecb.Width.Raw;
    const oldEcbYOffsetRaw = ecb.YOffset.Raw;

    const playerMinXRaw = Math.min(preEcb.Left.X.Raw, p.ECB.Left.X.Raw);
    const playerMaxXRaw = Math.max(preEcb.Right.X.Raw, p.ECB.Right.X.Raw);
    const playerMinYRaw = Math.min(preEcb.Top.Y.Raw, p.ECB.Top.Y.Raw);
    const playerMaxYRaw = Math.max(preEcb.Bottom.Y.Raw, p.ECB.Bottom.Y.Raw);
    const playerWidthRaw = playerMaxXRaw - playerMinXRaw;
    const playerHeightRaw = playerMaxYRaw - playerMinYRaw;

    // ==========================================
    // PHASE 1: PHYSICS RESOLUTION
    // ==========================================
    let overallCollision = false;
    let firstCollisionResult: ICollisionResult | undefined;
    
    const playerVerts = getECBHull(preEcb, p.ECB);

    for (let i = 0; i < stagesLength; i++) {
      const stage = stages[i];
      if (!stage.AABBInterSectCheck(playerMinXRaw, playerMinYRaw, playerWidthRaw, playerHeightRaw)) {
        continue;
      }
      
      const stageVerts = stage.StageVerticies.GetVerts();
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

    // ==========================================
    // PHASE 2: SENSOR EVALUATION
    // ==========================================
    let isGrounded = false;
    let isTeetering = false;
    
    const sensorXRaw = p.ECB.Bottom.X.Raw;
    const sensorMinYRaw = Math.min(p.ECB.Bottom.Y.Raw, p.ECB.Bottom.Y.Raw - p.ECB.SensorDepth.Raw);
    const sensorHeightRaw = p.ECB.SensorDepth.Raw;

    for (let i = 0; i < stagesLength; i++) {
      const stage = stages[i];
      if (!stage.AABBInterSectCheck(sensorXRaw, sensorMinYRaw, 0, sensorHeightRaw)) {
        continue;
      }

      if (PlayerOnStageOrPlats(stage, p)) {
        isGrounded = true;
        break;
      }
      if (CheckLedgeMargin(p, stage)) {
        isGrounded = true;
        isTeetering = true;
        break;
      }
    }

    // Determine Previous Groundedness
    let prvGrnd = false;
    let previousStage: Stage | undefined;
    
    const preSensorXRaw = preEcb.Bottom.X.Raw;
    const preSensorMinYRaw = Math.min(preEcb.Bottom.Y.Raw, preEcb.Bottom.Y.Raw - p.ECB.SensorDepth.Raw);
    const preSensorHeightRaw = p.ECB.SensorDepth.Raw;

    for (let i = 0; i < stagesLength; i++) {
      const stage = stages[i];
      if (!stage.AABBInterSectCheck(preSensorXRaw, preSensorMinYRaw, 0, preSensorHeightRaw)) {
        continue;
      }

      if (PlayerOnStage(stage, preEcb.Bottom, p.ECB.SensorDepth) || 
         (!p.Flags.IsPlatDetectDisabled && PlayerOnPlats(stage, preEcb.Bottom, p.ECB.SensorDepth))) {
        prvGrnd = true;
        previousStage = stage;
        break;
      }
    }

    if (prvGrnd && !isGrounded && previousStage) {
      if (handleWalkOff(p, previousStage)) {
        isGrounded = true;
        isTeetering = true;
      }
    }

    // ==========================================
    // PHASE 3: STATE REACTIONS & SHAPE MUTATIONS
    // ==========================================
    let handledLaunchOverride = false;
    
    if (overallCollision && preResolutionStateId === STATE_IDS.LAUNCH_S) {
      const normYRaw = firstCollisionResult!.NormY.Raw;
      const normXRaw = firstCollisionResult!.NormX.Raw;
      const ltf = p.Flags.LastTechFrame;
      const teched = ltf > 0 && ltf > world.LocalFrame - 20;
      const is = playerData.InputStore(p.ID);
      const ia = is.GetInputForFrame(world.LocalFrame);
      const rollRight = ia.LXAxisRaw >= POINT_TWO;
      const rollLeft = ia.LXAxisRaw <= -POINT_TWO;

      if (normYRaw > POINT_SEVEN && p.Velocity.Y.Raw > 0) {
        handledLaunchOverride = true;
        if (teched) {
          if (rollRight) {
            p.Flags.FaceLeft();
            sm.UpdateFromWorld(GAME_EVENT_IDS.ROLL_TECH_GE);
          } else if (rollLeft) {
            p.Flags.FaceRight();
            sm.UpdateFromWorld(GAME_EVENT_IDS.ROLL_TECH_GE);
          } else {
            sm.UpdateFromWorld(GAME_EVENT_IDS.TECH_IN_PLACE_GE);
          }
        } else {
          sm.UpdateFromWorld(GAME_EVENT_IDS.GRND_SLAM_GE);
        }
        p.Velocity.Y.SetFromRaw(-10);
      } else if (Math.abs(normXRaw) > POINT_SEVEN) {
        handledLaunchOverride = true;
        sm.UpdateFromWorld(GAME_EVENT_IDS.WALL_SLAM_GE);
        if (normXRaw > 0) {
          p.Flags.FaceLeft();
          p.Velocity.X.SetFromRaw(-TEN);
        } else if (normXRaw < 0) {
          p.Flags.FaceRight();
          p.Velocity.X.SetFromRaw(TEN);
        }
      }
    }

    if (!handledLaunchOverride) {
      if (
        !isGrounded &&
        preResolutionStateId !== STATE_IDS.LEDGE_GRAB_S &&
        preResolutionStateId !== STATE_IDS.LEDGE_GETUP_S &&
        preResolutionStateId !== STATE_IDS.LEDGE_ROLL_S
      ) {
        sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
      } else if (isGrounded) {
        if (isTeetering && !CanStateWalkOffLedge(p.FSMInfo.CurrentStateId)) {
          sm.UpdateFromWorld(GAME_EVENT_IDS.TEETER_GE);
        } else if (
          overallCollision &&
          preResolutionStateId !== STATE_IDS.LEDGE_GETUP_S &&
          preResolutionStateId !== STATE_IDS.LEDGE_ROLL_S
        ) {
          sm.UpdateFromWorld(
            ShouldSoftlandRaw(p.Velocity.Y.Raw)
              ? GAME_EVENT_IDS.SOFT_LAND_GE
              : GAME_EVENT_IDS.LAND_GE
          );
        }
      }
    }

    const postResolutionStateId = fsmInfo.CurrentStateId;

    if (overallCollision && preResolutionStateId !== postResolutionStateId && firstCollisionResult) {
      const newEcbHeightRaw = ecb.Height.Raw;
      const newEcbWidthRaw = ecb.Width.Raw;
      const newEcbYOffsetRaw = ecb.YOffset.Raw;

      const normXRaw = firstCollisionResult.NormX.Raw;
      const normYRaw = firstCollisionResult.NormY.Raw;

      if (Math.abs(normYRaw) > POINT_SEVEN) {
        let yCorrectionRaw = oldEcbYOffsetRaw - newEcbYOffsetRaw;
        if (normYRaw < 0) {
          yCorrectionRaw -= oldEcbHeightRaw - newEcbHeightRaw;
        }
        AddToPlayerYPositionRaw(p, yCorrectionRaw);
      }

      if (Math.abs(normXRaw) > POINT_SEVEN) {
        const xCorrectionRaw = DivideRaw(oldEcbWidthRaw - newEcbWidthRaw, TWO);
        if (normXRaw > 0) {
          AddToPlayerXPostionRaw(p, -xCorrectionRaw);
        } else {
          AddToPlayerXPostionRaw(p, xCorrectionRaw);
        }
      }
    }
  }
}

function CheckLedgeMargin(p: Player, stage: Stage): boolean {
  const stageGround = stage.StageVerticies.GetGround();
  if (stageGround.length === 0) return false;

  const leftMostPiece = stageGround[0];
  const rightMostPiece = stageGround[stageGround.length - 1];
  
  const bottomXRaw = p.ECB.Bottom.X.Raw;
  const bottomYRaw = p.ECB.Bottom.Y.Raw;
  const sensorDepthRaw = p.ECB.SensorDepth.Raw;

  if (bottomXRaw < leftMostPiece.X1.Raw && Math.abs(bottomXRaw - leftMostPiece.X1.Raw) <= CORNER_JITTER_CORRECTION_RAW) {
    if (bottomYRaw >= leftMostPiece.Y1.Raw && (bottomYRaw - sensorDepthRaw) <= leftMostPiece.Y1.Raw) {
      return true;
    }
  }

  if (bottomXRaw > rightMostPiece.X2.Raw && Math.abs(bottomXRaw - rightMostPiece.X2.Raw) <= CORNER_JITTER_CORRECTION_RAW) {
    if (bottomYRaw >= rightMostPiece.Y2.Raw && (bottomYRaw - sensorDepthRaw) <= rightMostPiece.Y2.Raw) {
      return true;
    }
  }

  return false;
}

function handleWalkOff(p: Player, previousStage: Stage): boolean {
  const stageGround = previousStage.StageVerticies.GetGround();
  if (stageGround.length === 0) return false;

  const leftMostPiece = stageGround[0];
  const rightMostPiece = stageGround[stageGround.length - 1];

  let shouldSnapBack = false;

  if (CanOnlyFallOffLedgeWhenFacingAwayFromIt(p)) {
    const fellOffLeftLedge = p.Position.X.Raw < leftMostPiece.X1.Raw;
    const fellOffRightLedge = p.Position.X.Raw > rightMostPiece.X2.Raw;
    const isFacingRight = p.Flags.IsFacingRight;

    if ((fellOffLeftLedge && isFacingRight) || (fellOffRightLedge && !isFacingRight)) {
      shouldSnapBack = true;
    }
  } else if (CanStateWalkOffLedge(p.FSMInfo.CurrentStateId) === false) {
    shouldSnapBack = true;
  }

  if (shouldSnapBack) {
    const yPosRaw = p.ECB.YOffset.Raw;
    if (Math.abs(p.Position.X.Raw - leftMostPiece.X1.Raw) < Math.abs(p.Position.X.Raw - rightMostPiece.X2.Raw)) {
      SetPlayerPositionRaw(
        p,
        leftMostPiece.X1.Raw,
        leftMostPiece.Y1.Raw - yPosRaw
      );
    } else {
      SetPlayerPositionRaw(
        p,
        rightMostPiece.X2.Raw,
        rightMostPiece.Y2.Raw - yPosRaw
      );
    }
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
  return CreateConvexHull(combinedEcbVerts);
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
