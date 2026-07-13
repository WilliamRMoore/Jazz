import { StateId } from '../../finiteStateMachines/player/shared';
import { JazzDebugger } from '../jazzDebugWrapper';

export function SetPlayerToStateId(
  jazz: JazzDebugger,
  playerId: number,
  stateId: StateId
) {
  const sm = jazz.World.PlayerData.StateMachine(playerId);
  sm.ForceState(stateId);
}
