import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

export const SideSpecialExtension: FSMState = {
  StateName: 'SideSpecialExtension',
  StateId: STATE_IDS.SIDE_SPCL_EX_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.SIDE_SPCL_EX_GE;
    const stateId = STATE_IDS.SIDE_SPCL_EX_S;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const SideSpecialExtensionNode: FSMNode = {
  State: SideSpecialExtension,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
