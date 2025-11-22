import { NumberToRaw, DivideRaw } from '../../math/fixedPoint';
import {
  STATE_IDS,
  GAME_EVENT_IDS,
} from '../finite-state-machine/PlayerStates';
import { IntersectsPolygons } from '../physics/collisions';
import {
  PlayerOnStageOrPlats,
  SetPlayerPositionRaw,
} from '../player/playerOrchestrator';
import { PlayerData, StageData, Pools } from '../world/world';

export function LedgeGrabDetection(
  playerData: PlayerData,
  stageData: StageData,
  pools: Pools
): void {
  const stage = stageData.Stage;
  const ledges = stage.Ledges;
  const leftLedge = ledges.GetLeftLedge();
  const rightLedge = ledges.GetRightLedge();
  const playerCount = playerData.PlayerCount;

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

    if (PlayerOnStageOrPlats(stage, ecb.Bottom, ecb.SensorDepth)) {
      continue;
    }

    const isFacingRight = flags.IsFacingRight;

    const front =
      isFacingRight === true ? ledgeDetector.RightSide : ledgeDetector.LeftSide;

    const twoRaw = NumberToRaw(2);

    if (isFacingRight) {
      const intersectsLeftLedge = IntersectsPolygons(
        leftLedge,
        front,
        pools.VecPool,
        pools.ColResPool,
        pools.ProjResPool
      );

      if (intersectsLeftLedge.Collision) {
        sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
        SetPlayerPositionRaw(
          p,
          DivideRaw(leftLedge[0].X.Raw - ecb.Width.Raw, twoRaw),
          p.Position.Y.Raw
        );
      }

      continue;
    }

    const intersectsRightLedge = IntersectsPolygons(
      rightLedge,
      front,
      pools.VecPool,
      pools.ColResPool,
      pools.ProjResPool
    );

    if (intersectsRightLedge.Collision) {
      sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
      SetPlayerPositionRaw(
        p,
        DivideRaw(rightLedge[0].X.Raw + ecb.Width.Raw, twoRaw),
        p.Position.Y.Raw
      );
    }
  }
}
