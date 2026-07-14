import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const ShieldDrop: FSMState = {
  StateName: 'ShieldDrop',
  StateId: STATE_IDS.SHIELD_DROP_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p, w) => {}
};

export const ShieldDropNode: FSMNode = {
  State: ShieldDrop,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
