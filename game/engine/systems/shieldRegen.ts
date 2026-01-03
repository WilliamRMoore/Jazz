import { GAME_EVENT_IDS } from '../finite-state-machine/stateConfigurations/shared';
import { World } from '../world/world';

export function ShieldRegen(w: World) {
  const pd = w.PlayerData;
  const playerCount = pd.PlayerCount;
  for (let i = 0; i < playerCount; i++) {
    const p = pd.Player(i);
    const shield = p.Shield;
    if (!shield.Active) {
      shield.Grow();
      continue;
    }
    if (shield.IsBroken) {
      const sm = pd.StateMachine(i);
      sm.UpdateFromWorld(GAME_EVENT_IDS.SHIELD_BREAK_GE);
    }
  }
}
