import { Player } from '../../entity/playerOrchestrator';
import { GameEventId } from '../../finiteStateMachines/player/states/shared';
import { World } from '../../world/world';

export type SwitchPlayerStateCommand = {
  commandName: string;
  payload: GameEventId;
};

export function SwitchPlayerState(
  w: World,
  p: Player,
  c: SwitchPlayerStateCommand
) {
  const sm = w.PlayerData.StateMachine(p.ID);
  sm.UpdateFromWorld(c.payload);
}
