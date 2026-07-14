import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const Idle: FSMState = {
  StateName: 'IDLE',
  StateId: STATE_IDS.IDLE_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const IdleNode: FSMNode = {
  State: Idle,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.MOVE_GE, sId: STATE_IDS.WALK_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
    { geId: GAME_EVENT_IDS.GUARD_GE, sId: STATE_IDS.SHIELD_RAISE_S },
    { geId: GAME_EVENT_IDS.GRAB_GE, sId: STATE_IDS.GRAB_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [
    Conditions.IdleToDash,
    Conditions.IdleToDashTurn,
    Conditions.IdleToTurn,
    Conditions.IdleToAttack,
    Conditions.ToSideCharge,
    Conditions.ToUpCharge,
    Conditions.IdleToUpTilt,
    Conditions.ToDownCharge,
    Conditions.ToNSpecial,
    Conditions.ToSideSpecial,
    Conditions.ToDownSpecial,
    Conditions.ToUpSpecial,
    Conditions.ToStickJumpSquat
  ],
  DefaultConditions: []
};
