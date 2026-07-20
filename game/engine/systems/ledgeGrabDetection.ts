import {
  GAME_EVENT_IDS,
  STATE_IDS
} from '../finiteStateMachines/player/states/shared';
import { DivideRaw } from '../math/fixedPoint';

import {
  PlayerOnStageOrPlats,
  SetPlayerPositionRaw
} from '../entity/playerOrchestrator';
import { TWO } from '../math/numberConstants';
import {
  AABBIntersect,
  CreateConvexHull,
  IntersectsPolygons
} from '../physics/collisions';
import { FlatVec } from '../physics/vector';
import { PlayerData, Pools, StageData } from '../world/stateModules';
import { World } from '../world/world';

const combinedVerts = new Array<FlatVec>();
export function LedgeGrabDetection(world: World): void {
  const playerData: PlayerData = world.PlayerData;
  const stageData: StageData = world.StageData;
  const pools: Pools = world.Pools;
  const stages = stageData.Stages;
  const stageLength = stages.length;
  const playerCount = playerData.PlayerCount;
  const playerHist = world.HistoryData.PlayerHistoryDB;

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const currentStateId = p.FSMInfo.CurrentStateId;
    if (
      p.Flags.IsInHitPause ||
      p.Flags.IsLedgeDetectDisabled ||
      currentStateId === STATE_IDS.LEDGE_GRAB_S ||
      currentStateId === STATE_IDS.JUMP_S ||
      p.Velocity.Y.Raw < 0
    ) {
      continue;
    }

    const ledgeDetector = p.LedgeDetector;

    if (ledgeDetector.CanGrabLedge === false) {
      continue;
    }

    combinedVerts.length = 0;

    const flags = p.Flags;
    const isFacingRight = flags.IsFacingRight;
    const curFront = isFacingRight
      ? ledgeDetector.RightSide
      : ledgeDetector.LeftSide;
    const prevState = playerHist[playerIndex].get(world.PreviousFrame);
    const lastPosXRaw = prevState.posXRaw;
    const lastPosYRaw = prevState.posYRaw;
    const lastMiddleXRaw = lastPosXRaw;
    const lastMiddleYRaw = lastPosYRaw + ledgeDetector.YOffset.Raw;
    const widthRaw = ledgeDetector.Width.Raw;
    const heightRaw = ledgeDetector.Height.Raw;
    const lastWidthRightRaw = lastMiddleXRaw + widthRaw;
    const lastWidthLeftRaw = lastMiddleXRaw - widthRaw;
    const lastBottomHeightRaw = lastMiddleYRaw + heightRaw;

    for (let i = 0; i < curFront.length; i++) {
      combinedVerts.push(curFront[i]);
    }

    if (isFacingRight) {
      const bottomLeftX = lastMiddleXRaw;
      const bottomLeftY = lastBottomHeightRaw;
      const topLeftX = bottomLeftX;
      const topLeftY = lastMiddleYRaw;
      const topRightX = lastWidthRightRaw;
      const topRightY = lastMiddleYRaw;
      const bottomRightX = lastWidthLeftRaw;
      const bottomRightY = lastBottomHeightRaw;

      combinedVerts.push(
        pools.VecPool.Rent().SetXYRaw(bottomLeftX, bottomLeftY)
      );
      combinedVerts.push(pools.VecPool.Rent().SetXYRaw(topLeftX, topLeftY));
      combinedVerts.push(pools.VecPool.Rent().SetXYRaw(topRightX, topRightY));
      combinedVerts.push(
        pools.VecPool.Rent().SetXYRaw(bottomRightX, bottomRightY)
      );
    } else {
      const bottomLeftX = lastMiddleXRaw - widthRaw;
      const bottomLeftY = lastBottomHeightRaw;
      const topLeftX = bottomLeftX;
      const topLeftY = lastMiddleYRaw;
      const topRightX = lastMiddleXRaw;
      const topRightY = lastMiddleYRaw;
      const bottomRightX = topRightX;
      const bottomRightY = bottomLeftY;

      combinedVerts.push(
        pools.VecPool.Rent().SetXYRaw(bottomLeftX, bottomLeftY)
      );
      combinedVerts.push(pools.VecPool.Rent().SetXYRaw(topLeftX, topLeftY));
      combinedVerts.push(pools.VecPool.Rent().SetXYRaw(topRightX, topRightY));
      combinedVerts.push(
        pools.VecPool.Rent().SetXYRaw(bottomRightX, bottomRightY)
      );
    }

    const hull = CreateConvexHull(combinedVerts);

    let minX = combinedVerts[0].X.Raw;
    let maxX = combinedVerts[0].X.Raw;
    let minY = combinedVerts[0].Y.Raw;
    let maxY = combinedVerts[0].Y.Raw;
    
    for (let i = 1; i < combinedVerts.length; i++) {
      const v = combinedVerts[i];
      if (v.X.Raw < minX) minX = v.X.Raw;
      if (v.X.Raw > maxX) maxX = v.X.Raw;
      if (v.Y.Raw < minY) minY = v.Y.Raw;
      if (v.Y.Raw > maxY) maxY = v.Y.Raw;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    const sm = playerData.StateMachine(playerIndex);
    const ecb = p.ECB;

    for (let stageIndex = 0; stageIndex < stageLength; stageIndex++) {
      const stage = stages[stageIndex];
      const sMinX = stage.AabbMinXRaw;
      const sMinY = stage.AabbMinYRaw;
      const sWidth = stage.AabbMaxXRaw - stage.AabbMinXRaw;
      const sHeight = stage.AabbMaxYRaw - stage.AabbMinYRaw;

      if (
        !AABBIntersect(sMinX, sMinY, sWidth, sHeight, minX, minY, width, height)
      ) {
        continue;
      }

      const ledges = stage.Ledges;
      const leftLedge = ledges.GetLeftLedge();
      const rightLedge = ledges.GetRightLedge();

      if (PlayerOnStageOrPlats(stage, p)) {
        continue;
      }

      if (isFacingRight) {
        if (LedgeOccupied(leftLedge, playerData)) {
          continue;
        }

        const intersectsLeftLedge = IntersectsPolygons(
          leftLedge,
          hull,
          pools.VecPool,
          pools.ColResPool,
          pools.ProjResPool
        );

        if (intersectsLeftLedge.Collision) {
          sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
          p.LedgeDetector.GrabLedge(leftLedge);
          SetPlayerPositionRaw(
            p,
            leftLedge[0].X.Raw - DivideRaw(ecb.Width.Raw, TWO),
            p.Position.Y.Raw
          );
          break;
        }
      } else {
        if (LedgeOccupied(rightLedge, playerData)) {
          continue;
        }

        const intersectsRightLedge = IntersectsPolygons(
          rightLedge,
          hull,
          pools.VecPool,
          pools.ColResPool,
          pools.ProjResPool
        );

        if (intersectsRightLedge.Collision) {
          sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
          p.LedgeDetector.GrabLedge(rightLedge);
          SetPlayerPositionRaw(
            p,
            rightLedge[0].X.Raw + DivideRaw(ecb.Width.Raw, TWO),
            p.Position.Y.Raw
          );
          break;
        }
      }
    }
  }
}

function LedgeOccupied(ledge: FlatVec[], pd: PlayerData): boolean {
  const pc = pd.PlayerCount;

  for (let i = 0; i < pc; i++) {
    const p = pd.Player(i);
    const ld = p.LedgeDetector;
    if (ld.GrabbedLedge === ledge) {
      return true;
    }
  }
  return false;
}
