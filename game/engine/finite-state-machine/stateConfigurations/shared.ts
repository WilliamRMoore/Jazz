import { Sequencer } from '../../utils';

// Aliases =========================================================================

export type GameEventId = number;
export type StateId = number;
export type AttackId = number;
export type GrabId = number;

// Constants =======================================================================

const seq = new Sequencer();

seq.SeqStart = 0;

//Postfixed with _GE for game event. So you know you are looking at game event Ids.
class GAME_EVENTS {
  public readonly UP_SPCL_GE = seq.Next as GameEventId;
  public readonly DOWN_SPCL_GE = seq.Next as GameEventId;
  public readonly SIDE_SPCL_GE = seq.Next as GameEventId;
  public readonly SIDE_SPCL_EX_GE = seq.Next as GameEventId;
  public readonly SPCL_GE = seq.Next as GameEventId;
  public readonly UP_ATTACK_GE = seq.Next as GameEventId;
  public readonly DOWN_ATTACK_GE = seq.Next as GameEventId;
  public readonly SIDE_ATTACK_GE = seq.Next as GameEventId;
  public readonly SIDE_CHARGE_GE = seq.Next as GameEventId;
  public readonly SIDE_CHARGE_EX_GE = seq.Next as GameEventId;
  public readonly UP_CHARGE_GE = seq.Next as GameEventId;
  public readonly UP_CHARGE_EX_GE = seq.Next as GameEventId;
  public readonly DOWN_CHARGE_GE = seq.Next as GameEventId;
  public readonly DOWN_CHARGE_EX_GE = seq.Next as GameEventId;
  public readonly ATTACK_GE = seq.Next as GameEventId;
  public readonly DASH_ATTACK_GE = seq.Next as GameEventId;
  public readonly D_TILT_GE = seq.Next as GameEventId;
  public readonly S_TILT_GE = seq.Next as GameEventId;
  public readonly S_TILT_U_GE = seq.Next as GameEventId;
  public readonly S_TILT_D_GE = seq.Next as GameEventId;
  public readonly U_TILT_GE = seq.Next as GameEventId;
  public readonly N_AIR_GE = seq.Next as GameEventId;
  public readonly F_AIR_GE = seq.Next as GameEventId;
  public readonly B_AIR_GE = seq.Next as GameEventId;
  public readonly U_AIR_GE = seq.Next as GameEventId;
  public readonly D_AIR_GE = seq.Next as GameEventId;
  public readonly S_SPCL_AIR_GE = seq.Next as GameEventId;
  public readonly S_SPCL_EX_AIR_GE = seq.Next as GameEventId;
  public readonly U_SPCL_AIR_GE = seq.Next as GameEventId;
  public readonly D_SPCL_AIR_GE = seq.Next as GameEventId;
  public readonly IDLE_GE = seq.Next as GameEventId;
  public readonly MOVE_GE = seq.Next as GameEventId;
  public readonly MOVE_FAST_GE = seq.Next as GameEventId;
  public readonly JUMP_GE = seq.Next as GameEventId;
  public readonly GRAB_GE = seq.Next as GameEventId;
  public readonly RUN_GRAB_GE = seq.Next as GameEventId;
  public readonly SPCL_GRAB_GE = seq.Next as GameEventId;
  public readonly GUARD_GE = seq.Next as GameEventId;
  public readonly UP_GE = seq.Next as GameEventId;
  public readonly DOWN_GE = seq.Next as GameEventId;
  public readonly WALL_KICK_GE = seq.Next as GameEventId;
  // End of GameEvents that can be sourced from player input
  public readonly LAND_GE = seq.Next as GameEventId;
  public readonly SOFT_LAND_GE = seq.Next as GameEventId;
  public readonly FALL_GE = seq.Next as GameEventId;
  public readonly LEDGE_GRAB_GE = seq.Next as GameEventId;
  public readonly HIT_STOP_GE = seq.Next as GameEventId;
  public readonly GRAB_HELD_GE = seq.Next as GameEventId;
  public readonly GRAB_HOLD_GE = seq.Next as GameEventId;
  public readonly GRAB_RELEASE_GE = seq.Next as GameEventId;
  public readonly GRAB_ESCAPE_GE = seq.Next as GameEventId;
  public readonly LAUNCH_GE = seq.Next as GameEventId;
  public readonly TUBMLE_GE = seq.Next as GameEventId;
  public readonly SHIELD_BREAK_GE = seq.Next as GameEventId;
}

export const GAME_EVENT_IDS = new GAME_EVENTS();

seq.SeqStart = 0;

//Postfixed _S for state, so you know you are looking at state Ids.
class STATES {
  public readonly IDLE_S = seq.Next as StateId;
  public readonly TURN_S = seq.Next as StateId;
  public readonly WALK_S = seq.Next as StateId;
  public readonly DASH_S = seq.Next as StateId;
  public readonly DASH_TURN_S = seq.Next as StateId;
  public readonly STOP_RUN_S = seq.Next as StateId;
  public readonly RUN_TURN_S = seq.Next as StateId;
  public readonly STOP_RUN_TURN_S = seq.Next as StateId;
  public readonly RUN_S = seq.Next as StateId;
  public readonly JUMP_SQUAT_S = seq.Next as StateId;
  public readonly JUMP_S = seq.Next as StateId;
  public readonly N_FALL_S = seq.Next as StateId;
  public readonly LAND_S = seq.Next as StateId;
  public readonly SOFT_LAND_S = seq.Next as StateId;
  public readonly LEDGE_GRAB_S = seq.Next as StateId;
  public readonly AIR_DODGE_S = seq.Next as StateId;
  public readonly HELPLESS_S = seq.Next as StateId;
  public readonly ATTACK_S = seq.Next as StateId;
  public readonly SIDE_CHARGE_S = seq.Next as StateId;
  public readonly SIDE_CHARGE_EX_S = seq.Next as StateId;
  public readonly DOWN_CHARGE_S = seq.Next as StateId;
  public readonly DOWN_CHARGE_EX_S = seq.Next as StateId;
  public readonly UP_CHARGE_S = seq.Next as StateId;
  public readonly UP_CHARGE_EX_S = seq.Next as StateId;
  public readonly DASH_ATTACK_S = seq.Next as StateId;
  public readonly DOWN_TILT_S = seq.Next as StateId;
  public readonly SIDE_TILT_S = seq.Next as StateId;
  public readonly UP_TILT_S = seq.Next as StateId;
  public readonly N_AIR_S = seq.Next as StateId;
  public readonly F_AIR_S = seq.Next as StateId;
  public readonly B_AIR_S = seq.Next as StateId;
  public readonly U_AIR_S = seq.Next as StateId;
  public readonly D_AIR_S = seq.Next as StateId;
  public readonly SPCL_S = seq.Next as StateId;
  public readonly SIDE_SPCL_S = seq.Next as StateId;
  public readonly SIDE_SPCL_EX_S = seq.Next as StateId;
  public readonly SIDE_SPCL_AIR_S = seq.Next as StateId;
  public readonly SIDE_SPCL_EX_AIR_S = seq.Next as StateId;
  public readonly DOWN_SPCL_S = seq.Next as StateId;
  public readonly DOWN_SPCL_AIR_S = seq.Next as StateId;
  public readonly UP_SPCL_S = seq.Next as StateId;
  public readonly HIT_STOP_S = seq.Next as StateId;
  public readonly LAUNCH_S = seq.Next as StateId;
  public readonly TUMBLE_S = seq.Next as StateId;
  public readonly CROUCH_S = seq.Next as StateId;
  public readonly SHIELD_RAISE_S = seq.Next as StateId;
  public readonly SHIELD_S = seq.Next as StateId;
  public readonly SHIELD_DROP_S = seq.Next as StateId;
  public readonly SHIELD_BREAK_S = seq.Next as StateId;
  public readonly SHIELD_BREAK_TUMBLE_S = seq.Next as StateId;
  public readonly SHIELD_BREAK_LAND_S = seq.Next as StateId;
  public readonly DIZZY_S = seq.Next as StateId;
  public readonly SPOT_DODGE_S = seq.Next as StateId;
  public readonly ROLL_DODGE_S = seq.Next as StateId;
  public readonly GRAB_S = seq.Next as StateId;
  public readonly RUN_GRAB_S = seq.Next as StateId;
  public readonly SPCL_GRAB_S = seq.Next as StateId;
  public readonly GRAB_HOLD_S = seq.Next as StateId;
  public readonly GRAB_HELD_S = seq.Next as StateId;
  public readonly GRAB_RELEASE_S = seq.Next as StateId;
  public readonly GRAB_ESCAPE_S = seq.Next as StateId;
  public readonly LEDGE_RECOVER_S = seq.Next as StateId;
  public readonly LEDGE_GUA_S = seq.Next as StateId;
  public readonly WALL_KICK_S = seq.Next as StateId;
}

export const STATE_IDS = new STATES();

seq.SeqStart = 0;

class ATTACKS {
  public readonly N_GRND_ATK = seq.Next as AttackId;
  public readonly S_GRND_ATK = seq.Next as AttackId;
  public readonly U_GRND_ATK = seq.Next as AttackId;
  public readonly D_GRND_ATK = seq.Next as AttackId;
  public readonly S_CHARGE_ATK = seq.Next as AttackId;
  public readonly S_CHARGE_EX_ATK = seq.Next as AttackId;
  public readonly U_CHARGE_ATK = seq.Next as AttackId;
  public readonly U_CHARGE_EX_ATK = seq.Next as AttackId;
  public readonly D_CHARGE_ATK = seq.Next as AttackId;
  public readonly D_CHARGE_EX_ATK = seq.Next as AttackId;
  public readonly S_TILT_ATK = seq.Next as AttackId;
  public readonly S_TILT_U_ATK = seq.Next as AttackId;
  public readonly S_TITL_D_ATK = seq.Next as AttackId;
  public readonly U_TILT_ATK = seq.Next as AttackId;
  public readonly D_TILT_ATK = seq.Next as AttackId;
  public readonly DASH_ATK = seq.Next as AttackId;
  public readonly N_AIR_ATK = seq.Next as AttackId;
  public readonly F_AIR_ATK = seq.Next as AttackId;
  public readonly B_AIR_ATK = seq.Next as AttackId;
  public readonly U_AIR_ATK = seq.Next as AttackId;
  public readonly D_AIR_ATK = seq.Next as AttackId;
  public readonly N_SPCL_ATK = seq.Next as AttackId;
  public readonly S_SPCL_ATK = seq.Next as AttackId;
  public readonly S_SPCL_EX_ATK = seq.Next as AttackId;
  public readonly S_SPCL_AIR_ATK = seq.Next as AttackId;
  public readonly S_SPCL_EX_AIR_ATK = seq.Next as AttackId;
  public readonly U_SPCL_ATK = seq.Next as AttackId;
  public readonly D_SPCL_ATK = seq.Next as AttackId;
  public readonly D_SPCL_AIR_ATK = seq.Next as AttackId;
  public readonly LEDGE_GU_ATK = seq.Next as AttackId;
  public readonly LEDGE_ATK = seq.Next as AttackId;
}

export const ATTACK_IDS = new ATTACKS();

seq.SeqStart = 0;

class GRABS {
  public readonly GRAB_G = seq.Next as GrabId;
  public readonly RUN_GRAB_G = seq.Next as GrabId;
  public readonly SPCL_GRAB_G = seq.Next as GrabId;
}

export const GRAB_IDS = new GRABS();

export const StateIdToNameMap = new Map<StateId, string>();
Object.entries(STATE_IDS).forEach(([key, value]) => {
  StateIdToNameMap.set(value, key);
});

export const GameEventNameMap = new Map<GrabId, string>();
Object.entries(GAME_EVENT_IDS).forEach(([key, value]) => {
  GameEventNameMap.set(value, key);
});

export const AttackIdToNameMap = new Map<AttackId, string>();
export const AttackIdValues = new Set<AttackId>();
Object.entries(ATTACK_IDS).forEach(([key, value]) => {
  AttackIdToNameMap.set(value, key);
  AttackIdValues.add(value);
});

export const GrabIdToNameMap = new Map<GrabId, string>();
Object.entries(GRAB_IDS).forEach(([key, value]) => {
  GrabIdToNameMap.set(value, key);
});

export function CanStateWalkOffLedge(stateId: StateId): boolean {
  switch (stateId) {
    case STATE_IDS.IDLE_S:
    case STATE_IDS.WALK_S:
    case STATE_IDS.RUN_TURN_S:
    case STATE_IDS.STOP_RUN_S:
    case STATE_IDS.DASH_ATTACK_S:
    case STATE_IDS.ATTACK_S:
    case STATE_IDS.SIDE_TILT_S:
    case STATE_IDS.UP_TILT_S:
    case STATE_IDS.DOWN_TILT_S:
    case STATE_IDS.SIDE_CHARGE_S:
    case STATE_IDS.SIDE_CHARGE_EX_S:
    case STATE_IDS.UP_CHARGE_S:
    case STATE_IDS.UP_CHARGE_EX_S:
    case STATE_IDS.CROUCH_S:
    case STATE_IDS.LEDGE_GRAB_S:
    case STATE_IDS.ROLL_DODGE_S:
    case STATE_IDS.SPOT_DODGE_S:
    case STATE_IDS.GRAB_S:
    case STATE_IDS.TURN_S:
    case STATE_IDS.DASH_S:
    case STATE_IDS.DOWN_CHARGE_S:
    case STATE_IDS.DOWN_CHARGE_EX_S:
      return false;
    default:
      return true;
  }
}

export function IsStateNecessarilyGrounded(stateId: StateId) {
  switch (stateId) {
    case STATE_IDS.JUMP_SQUAT_S:
    case STATE_IDS.IDLE_S:
    case STATE_IDS.WALK_S:
    case STATE_IDS.TURN_S:
    case STATE_IDS.DASH_S:
    case STATE_IDS.DASH_ATTACK_S:
    case STATE_IDS.DASH_TURN_S:
    case STATE_IDS.RUN_S:
    case STATE_IDS.RUN_TURN_S:
    case STATE_IDS.STOP_RUN_S:
    case STATE_IDS.STOP_RUN_TURN_S:
    case STATE_IDS.SHIELD_RAISE_S:
    case STATE_IDS.SHIELD_S:
    case STATE_IDS.SHIELD_DROP_S:
    case STATE_IDS.SHIELD_BREAK_LAND_S:
    case STATE_IDS.DIZZY_S:
    case STATE_IDS.CROUCH_S:
    case STATE_IDS.ROLL_DODGE_S:
    case STATE_IDS.SPOT_DODGE_S:
    case STATE_IDS.GRAB_S:
    case STATE_IDS.GRAB_HOLD_S:
    case STATE_IDS.GRAB_HELD_S:
    case STATE_IDS.GRAB_RELEASE_S:
    case STATE_IDS.GRAB_ESCAPE_S:
    case STATE_IDS.RUN_GRAB_S:
    case STATE_IDS.LEDGE_GRAB_S:
    case STATE_IDS.LEDGE_RECOVER_S:
    case STATE_IDS.LEDGE_GUA_S:
    case STATE_IDS.LAND_S:
    case STATE_IDS.SOFT_LAND_S:
    case STATE_IDS.UP_TILT_S:
    case STATE_IDS.DOWN_TILT_S:
    case STATE_IDS.SIDE_TILT_S:
    case STATE_IDS.SIDE_CHARGE_S:
    case STATE_IDS.SIDE_CHARGE_EX_S:
    case STATE_IDS.UP_CHARGE_S:
    case STATE_IDS.UP_CHARGE_EX_S:
    case STATE_IDS.DOWN_CHARGE_S:
    case STATE_IDS.DOWN_CHARGE_EX_S:
    case STATE_IDS.ATTACK_S:
      return true;
    default:
      return true;
  }
}

export function IsStateAttackState(stateId: StateId) {
  switch (stateId) {
    case STATE_IDS.ATTACK_S:
    case STATE_IDS.DASH_ATTACK_S:
    case STATE_IDS.SIDE_CHARGE_S:
    case STATE_IDS.SIDE_CHARGE_EX_S:
    case STATE_IDS.UP_CHARGE_S:
    case STATE_IDS.UP_CHARGE_EX_S:
    case STATE_IDS.DOWN_CHARGE_S:
    case STATE_IDS.DOWN_CHARGE_EX_S:
    case STATE_IDS.SIDE_TILT_S:
    case STATE_IDS.UP_TILT_S:
    case STATE_IDS.DOWN_TILT_S:
    case STATE_IDS.N_AIR_S:
    case STATE_IDS.F_AIR_S:
    case STATE_IDS.B_AIR_S:
    case STATE_IDS.U_AIR_S:
    case STATE_IDS.D_AIR_S:
    case STATE_IDS.SPCL_S:
    case STATE_IDS.SIDE_SPCL_S:
    case STATE_IDS.SIDE_SPCL_EX_S:
    case STATE_IDS.SIDE_SPCL_AIR_S:
    case STATE_IDS.SIDE_SPCL_EX_AIR_S:
    case STATE_IDS.DOWN_SPCL_S:
    case STATE_IDS.DOWN_SPCL_AIR_S:
    case STATE_IDS.UP_SPCL_S:
    case STATE_IDS.LEDGE_GUA_S:
      return true;
    default:
      return false;
  }
}

// State mapping classes ===========================================================
