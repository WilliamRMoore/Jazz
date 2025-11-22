import { GameEventId } from '../../finite-state-machine/PlayerStates';
import { Player } from '../../player/playerOrchestrator';
import { World } from '../../world/world';

export type SwitchPlayerStateCommand = {
  commandName: string;
  payload: GameEventId;
};

export function SwicthPlayerState(
  w: World,
  p: Player,
  c: SwitchPlayerStateCommand
) {
  const sm = w.PlayerData.StateMachine(p.ID);
  sm.UpdateFromWorld(c.payload);
}
