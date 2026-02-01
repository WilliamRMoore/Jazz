import {
  STATE_IDS,
  StateId,
} from '../finite-state-machine/stateConfigurations/shared';
import { World } from '../world/world';

export function Flags(world: World): void {
  const playerData = world.PlayerData;
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const flags = p.Flags;
    if (flags.IsInHitPause) {
      flags.DecrementHitPause();
    }
    if (flags.IsIntangible) {
      flags.DecrementIntangabilityFrames();
    }
    if (flags.IsPlatDetectDisabled) {
      flags.DecrementDisablePlatDetection();
    }
    if (flags.JumpedFromShield) {
      const curFrame = world.LocalFrame;
      const is = playerData.InputStore(playerIndex);
      const ia = is.GetInputForFrame(curFrame);
      const stateId = p.FSMInfo.CurrentStatetId;
      if (
        (ia.LTValRaw === 0 && ia.RTValRaw === 0) ||
        stateShouldResetJumpFromShield(stateId)
      ) {
        p.Flags.ResetJumpFromShield();
      }
    }
  }
}

function stateShouldResetJumpFromShield(stateId: StateId) {
  switch (stateId) {
    case STATE_IDS.JUMP_SQUAT_S:
    case STATE_IDS.JUMP_S:
    case STATE_IDS.N_FALL_S:
      return false;
    default:
      return true;
  }
}
