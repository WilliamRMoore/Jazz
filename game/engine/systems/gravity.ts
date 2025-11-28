import { STATE_IDS } from '../finite-state-machine/stateConfigurations/shared';
import { NumberToRaw, MultiplyRaw } from '../math/fixedPoint';
import { Player, PlayerOnStageOrPlats } from '../entity/playerOrchestrator';
import { Stage } from '../stage/stageMain';
import { PlayerData, StageData } from '../world/world';

export function Gravity(playerData: PlayerData, stageData: StageData): void {
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const stage = stageData.Stage;

    if (playerHasGravity(p, stage) === false) {
      continue;
    }
    debugger;
    const speeds = p.Speeds;
    const grav = speeds.GravityRaw;
    const isFF = p.Flags.IsFastFalling;
    const fallSpeed = isFF ? speeds.FastFallSpeedRaw : speeds.FallSpeedRaw;
    const gravMutliplier = NumberToRaw(isFF ? 2 : 1);
    p.Velocity.AddClampedYImpulseRaw(
      fallSpeed,
      MultiplyRaw(grav, gravMutliplier)
    );
  }
}

function playerHasGravity(p: Player, stage: Stage): boolean {
  switch (p.FSMInfo.CurrentStatetId) {
    case STATE_IDS.AIR_DODGE_S:
    case STATE_IDS.LEDGE_GRAB_S:
    case STATE_IDS.HIT_STOP_S:
      return false;
    default:
      break;
  }
  if (p.Flags.IsInHitPause) {
    return false;
  }
  const ecb = p.ECB;
  const attack = p.Attacks.GetAttack();
  if (attack === undefined) {
    return !PlayerOnStageOrPlats(stage, ecb.Bottom, ecb.SensorDepth);
  }
  // attack is defined, and has gravity set to active
  if (attack.GravityActive === false) {
    return false;
  }
  // just need to check if player is on stage
  // if player on stage, no gravity, if off stage, gravity
  return !PlayerOnStageOrPlats(stage, ecb.Bottom, ecb.SensorDepth);
}
