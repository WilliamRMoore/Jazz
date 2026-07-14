import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const Hold: FSMState = {
  StateName: 'hold',
  StateId: STATE_IDS.GRAB_HOLD_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const HoldNode: FSMNode = {
  State: Hold,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_RELEASE_GE, sId: STATE_IDS.GRAB_RELEASE_S },
    { geId: GAME_EVENT_IDS.ATTACK_GE, sId: STATE_IDS.PUMMEL_S }
  ],
  Conditions: [
    Conditions.ToForwardThrow,
    Conditions.ToBackThrow,
    Conditions.ToUpThrow,
    Conditions.ToDownThrow
  ],
  DefaultConditions: []
};
