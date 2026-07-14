import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const Crouch: FSMState = {
  StateName: 'Crouch',
  StateId: STATE_IDS.CROUCH_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const CrouchNode: FSMNode = {
  State: Crouch,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.IDLE_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.MOVE_GE, sId: STATE_IDS.WALK_S },
    { geId: GAME_EVENT_IDS.MOVE_FAST_GE, sId: STATE_IDS.DASH_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [Conditions.ToDownSpecial, Conditions.ToDownTilt],
  DefaultConditions: []
};
