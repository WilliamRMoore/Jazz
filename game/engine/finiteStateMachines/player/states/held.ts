import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const Held: FSMState = {
  StateName: 'Held',
  StateId: STATE_IDS.GRAB_HELD_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    const grabMeter = p.GrabMeter;
    grabMeter.Meter.Zero();
    const holdingPlayer = w.PlayerData.Player(grabMeter.HoldingPlayerId!);
    holdingPlayer.Hold.heldPlayerId = undefined;
    grabMeter.ZeroHoldingPlayerId();
  }
};

export const HeldNode: FSMNode = {
  State: Held,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.GRAB_ESCAPE_GE, sId: STATE_IDS.GRAB_ESCAPE_S },
    { geId: GAME_EVENT_IDS.LAUNCH_GE, sId: STATE_IDS.LAUNCH_S }
  ],
  Conditions: [],
  DefaultConditions: []
};
