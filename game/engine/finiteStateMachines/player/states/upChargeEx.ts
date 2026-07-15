import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

export const UpChargeEx: FSMState = {
  StateName: 'UpChargeExt',
  StateId: STATE_IDS.UP_CHARGE_EX_S,
  OnEnter: (p, w) => {
    const geId = GAME_EVENT_IDS.UP_CHARGE_EX_GE;
    const stateId = STATE_IDS.UP_CHARGE_EX_S;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const UpChargeExNode: FSMNode = {
  State: UpChargeEx,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
