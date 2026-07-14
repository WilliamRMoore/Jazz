import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';
import {
  aerialInputOnUpdate,
  attackOnEnter,
  attackOnExit,
  attackOnUpdate
} from '../stateHelpers';

export const NAerialAttack: FSMState = {
  StateName: 'AerialAttack',
  StateId: STATE_IDS.N_AIR_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.N_AIR_GE;
    const stateId = STATE_IDS.N_AIR_S;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: (p: Player, w: World) => {
    aerialInputOnUpdate(p, w);
    attackOnUpdate(p, w);
  },
  OnExit: attackOnExit
};

export const NAerialAttackNode: FSMNode = {
  State: NAerialAttack,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultNFall]
};
