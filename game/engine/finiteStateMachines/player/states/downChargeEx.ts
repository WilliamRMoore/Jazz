import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

export const DownChargeEx: FSMState = {
  StateName: 'DownChargeExt',
  StateId: STATE_IDS.DOWN_CHARGE_EX_S,
  OnEnter: (p, w) => {
    const geId = GAME_EVENT_IDS.DOWN_CHARGE_EX_GE;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const DownChargeExNode: FSMNode = {
  State: DownChargeEx,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
