import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

export const UpTilt: FSMState = {
  StateName: 'UpTilt',
  StateId: STATE_IDS.UP_TILT_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.U_TILT_GE;
    const stateId = STATE_IDS.UP_TILT_S;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const UpTiltNode: FSMNode = {
  State: UpTilt,
  DirectTransitions: [
    {
      geId: GAME_EVENT_IDS.HIT_STOP_GE,
      sId: STATE_IDS.HIT_STOP_S
    }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
