import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { STATE_IDS } from '../finite-state-machine/stateConfigurations/shared';
import { NumberToRaw } from '../math/fixedPoint';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from '../entity/playerOrchestrator';
import { PlayerData, StageData } from '../world/world';

export function OutOfBoundsCheck(
  playerData: PlayerData,
  stageData: StageData
): void {
  const playerCount = playerData.PlayerCount;
  const stage = stageData.Stage;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const sm = playerData.StateMachine(playerIndex);

    const pPos = p.Position;
    const pY = pPos.Y;
    const pX = pPos.X;
    const deathBoundry = stage.DeathBoundry!;

    if (pY.Raw < deathBoundry.topBoundry.Raw) {
      // kill player if in hit stun.
      KillPlayer(p, sm);
      return;
    }

    if (pY.Raw > deathBoundry.bottomBoundry.Raw) {
      // kill player?
      KillPlayer(p, sm);
      return;
    }

    if (pX.Raw < deathBoundry.leftBoundry.Raw) {
      // kill Player?
      KillPlayer(p, sm);
      return;
    }

    if (pX.Raw > deathBoundry.rightBoundry.Raw) {
      // kill player?
      KillPlayer(p, sm);
      return;
    }
  }
}

function KillPlayer(p: Player, sm: StateMachine): void {
  // reset player to spawn point
  SetPlayerInitialPositionRaw(p, NumberToRaw(610), NumberToRaw(300));
  // reset any stats
  p.Jump.ResetJumps();
  p.Jump.IncrementJumps();
  p.Velocity.X.Zero();
  p.Velocity.Y.Zero();
  p.Damage.ResetDamagePoints();
  p.Flags.FastFallOff();
  p.Flags.ZeroIntangabilityFrames();
  p.Flags.ZeroHitPauseFrames();
  p.Shield.Reset();
  sm.ForceState(STATE_IDS.N_FALL_S);
  // reduce stock count
}
