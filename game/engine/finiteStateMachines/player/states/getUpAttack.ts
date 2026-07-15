import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

export const GetUpAttack: FSMState = {
  StateName: 'GetUpAttack',
  StateId: STATE_IDS.GETUP_ATTACK_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.GETUP_ATTACK_GE;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const GetUpAttackNode: FSMNode = {
  State: GetUpAttack,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
