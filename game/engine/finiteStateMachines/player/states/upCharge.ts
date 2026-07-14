import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

export const UpCharge: FSMState = {
  StateName: 'UpCharge',
  StateId: STATE_IDS.UP_CHARGE_S,
  OnEnter: (p, w) => {
    const geId = GAME_EVENT_IDS.UP_CHARGE_GE;
    const stateId = STATE_IDS.UP_CHARGE_S;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const UpChargeNode: FSMNode = {
  State: UpCharge,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [Conditions.UpChargeToEx],
  DefaultConditions: [Conditions.defaultUpChargeEx]
};
