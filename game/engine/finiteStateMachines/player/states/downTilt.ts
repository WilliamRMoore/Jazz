import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

export const DownTilt: FSMState = {
  StateName: 'DownTilt',
  StateId: STATE_IDS.DOWN_TILT_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.D_TILT_GE;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const DownTiltNode: FSMNode = {
  State: DownTilt,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
  ],
  Conditions: [],
  DefaultConditions: [
    Conditions.DefaultDownTiltToCrouch,
    Conditions.defaultIdle
  ]
};
