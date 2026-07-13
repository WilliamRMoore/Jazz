import { PlayerThrow } from '../entity/components/throw';
import { Player } from '../entity/playerOrchestrator';
import {
  GAME_EVENT_IDS,
  STATE_IDS
} from '../finiteStateMachines/player/shared';
import { World } from '../world/world';
import {
  CalculateHitStun,
  CalculateKnockbackRaw,
  CalculateLaunchVector
} from './attack';

export function PlayerThrows(w: World) {
  // throw player
  const pd = w.PlayerData;
  const playerCount = pd.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const player = pd.Player(playerIndex);
    const currentStateId = player.FSMInfo.CurrentStateId;
    if (
      (currentStateId !== STATE_IDS.UP_THROW_S &&
        currentStateId !== STATE_IDS.DOWN_THROW_S &&
        currentStateId !== STATE_IDS.BACK_THROW_S &&
        currentStateId !== STATE_IDS.FORWARD_THROW_S) ||
      player.Flags.IsInHitPause
    ) {
      continue;
    }
    const stateFrame = player.FSMInfo.CurrentStateFrame;
    const pThrow = player.Throw.GetThrowForState(currentStateId)!;
    const releaseFrame = pThrow.ReleaseFrame;
    if (stateFrame === releaseFrame) {
      handleRelease(player, pThrow, w);
      continue;
    }
    if (stateFrame > releaseFrame) {
      continue;
    }
    const moveOp = pThrow.GetMoveOpForFrame(stateFrame);
    if (moveOp === undefined) {
      continue;
    }
    const thrownPlayer = pd.Player(player.Hold.heldPlayerId!);
    if (thrownPlayer === undefined) {
      continue;
    }
    const isThrowerFacingRight = player.Flags.IsFacingRight;
    const throwerX = player.Position.X.Raw;
    const throwerY = player.Position.Y.Raw;
    const moveToX = isThrowerFacingRight
      ? throwerX + moveOp.X.Raw
      : throwerX - moveOp.X.Raw;
    const moveToY = throwerY + moveOp.Y.Raw;
    thrownPlayer.Position.X.SetFromRaw(moveToX);
    thrownPlayer.Position.Y.SetFromRaw(moveToY);
  }
}

function handleRelease(thrower: Player, pThrow: PlayerThrow, w: World) {
  const throwee = w.PlayerData.Player(thrower.Hold.heldPlayerId!);
  const tDam = pThrow.Damage;
  const tAngle = pThrow.LaucnhAngle;
  const bkb = pThrow.baseKnockBack;
  const kbs = pThrow.knockBackScaling;
  const throweeWight = throwee.Weight.Value.Raw;
  const throweeDamage = throwee.Damage.Damage.Raw;
  const kbRaw = CalculateKnockbackRaw(
    throweeDamage,
    tDam,
    throweeWight,
    kbs,
    bkb
  );
  const histStunFrames = CalculateHitStun(kbRaw);
  const throweeSm = w.PlayerData.StateMachine(throwee.ID);
  const vecPool = w.Pools.VecPool;
  const throwerFacingRight = thrower.Flags.IsFacingRight;
  if (throwerFacingRight) {
    throwee.Flags.FaceLeft();
  } else {
    throwee.Flags.FaceRight();
  }
  const lv = CalculateLaunchVector(vecPool, tAngle, throwerFacingRight, kbRaw);
  lv.Y.Negate();
  throwee.HitStun.SetHitStun(histStunFrames, lv.X, lv.Y);
  throwee.Damage.AddDamageRaw(tDam);
  throweeSm.UpdateFromWorld(GAME_EVENT_IDS.LAUNCH_GE);
}
