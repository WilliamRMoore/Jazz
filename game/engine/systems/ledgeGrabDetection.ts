import {
  STATE_IDS,
  GAME_EVENT_IDS,
} from '../finite-state-machine/stateConfigurations/shared';
import { NumberToRaw, DivideRaw } from '../math/fixedPoint';

import { CreateConvexHull, IntersectsPolygons } from '../physics/collisions';
import {
  PlayerOnStageOrPlats,
  SetPlayerPositionRaw,
} from '../entity/playerOrchestrator';
import { PlayerData, StageData, Pools, World } from '../world/world';
import { FlatVec } from '../physics/vector';

const TWO = NumberToRaw(2);

const combinedVerts = new Array<FlatVec>();
export function LedgeGrabDetection(world: World): void {
  combinedVerts.length = 0;
  const playerData: PlayerData = world.PlayerData;
  const stageData: StageData = world.StageData;
  const pools: Pools = world.Pools;
  const stage = stageData.Stage;
  const ledges = stage.Ledges;
  const leftLedge = ledges.GetLeftLedge();
  const rightLedge = ledges.GetRightLedge();
  const playerCount = playerData.PlayerCount;
  const playerHist = world.HistoryData.PlayerComponentHistories;

  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);

    if (p.Flags.IsInHitPause) {
      continue;
    }

    const ledgeDetector = p.LedgeDetector;

    if (ledgeDetector.CanGrabLedge === false) {
      continue;
    }

    const sm = playerData.StateMachine(playerIndex);
    const flags = p.Flags;
    const ecb = p.ECB;

    if (
      p.Velocity.Y.Raw < 0 ||
      p.FSMInfo.CurrentStatetId === STATE_IDS.JUMP_S
    ) {
      continue;
    }

    if (PlayerOnStageOrPlats(stage, p)) {
      continue;
    }

    const isFacingRight = flags.IsFacingRight;

    const curFront =
      isFacingRight === true ? ledgeDetector.RightSide : ledgeDetector.LeftSide;

    const lastLd =
      playerHist[playerIndex].LedgeDetectorHistory[world.PreviousFrame];

    let lastFront: Array<FlatVec>;
    const lastMiddleXRaw = NumberToRaw(lastLd.middleX);
    const lastMiddleYRaw = NumberToRaw(lastLd.middleY);
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
        pools.VecPool.Rent().SetXYRaw(bottomLeftX, bottomLeftY),
      );
      combinedVerts.push(pools.VecPool.Rent().SetXYRaw(topLeftX, topLeftY));
      combinedVerts.push(pools.VecPool.Rent().SetXYRaw(topRightX, topRightY));
      combinedVerts.push(
        pools.VecPool.Rent().SetXYRaw(bottomRightX, bottomRightY),
      );

      lastFront = CreateConvexHull(combinedVerts);
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
        pools.VecPool.Rent().SetXYRaw(bottomLeftX, bottomLeftY),
      );
      combinedVerts.push(pools.VecPool.Rent().SetXYRaw(topLeftX, topLeftY));
      combinedVerts.push(pools.VecPool.Rent().SetXYRaw(topRightX, topRightY));
      combinedVerts.push(
        pools.VecPool.Rent().SetXYRaw(bottomRightX, bottomRightY),
      );
    }

    const hull = CreateConvexHull(combinedVerts);

    if (isFacingRight) {
      const intersectsLeftLedge = IntersectsPolygons(
        leftLedge,
        hull,
        pools.VecPool,
        pools.ColResPool,
        pools.ProjResPool,
      );

      if (intersectsLeftLedge.Collision) {
        sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
        SetPlayerPositionRaw(
          p,
          leftLedge[0].X.Raw - DivideRaw(ecb.Width.Raw, TWO),
          p.Position.Y.Raw,
        );
      }
      continue;
    }

    const intersectsRightLedge = IntersectsPolygons(
      rightLedge,
      hull,
      pools.VecPool,
      pools.ColResPool,
      pools.ProjResPool,
    );

    if (intersectsRightLedge.Collision) {
      sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
      SetPlayerPositionRaw(
        p,
        rightLedge[0].X.Raw + DivideRaw(ecb.Width.Raw, TWO),
        p.Position.Y.Raw,
      );
    }
  }
}
