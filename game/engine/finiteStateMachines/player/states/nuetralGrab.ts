import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';
import { grabOnEnter, grabOnExit, grabOnUpdate } from '../stateHelpers';

export const NuetralGrab: FSMState = {
  StateName: 'Grab',
  StateId: STATE_IDS.GRAB_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.GRAB_GE;
    const stateId = STATE_IDS.GRAB_S;
    grabOnEnter(p, geId, stateId);
  },
  OnUpdate: grabOnUpdate,
  OnExit: grabOnExit
};

export const NuetralGrabNode: FSMNode = {
  State: NuetralGrab,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HOLD_GE, sId: STATE_IDS.GRAB_HOLD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
