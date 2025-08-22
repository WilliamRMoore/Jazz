import { Player, PlayerOnStage } from '../playerOrchestrator';
import { EaseIn, Sequencer } from '../../utils';
import { World } from '../../world/world';
import { FSMState } from './PlayerStateMachine';
import { InputAction } from '../../../loops/Input';
import { FlatVec } from '../../physics/vector';
import { Attack } from '../playerComponents';

// Aliases =========================================================================

export type GameEventId = number;
export type StateId = number;
export type AttackId = number;

// Constants =======================================================================

const seq = new Sequencer();

seq.SeqStart = -1;

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
  public readonly IDLE_GE = seq.Next as GameEventId;
  public readonly MOVE_GE = seq.Next as GameEventId;
  public readonly MOVE_FAST_GE = seq.Next as GameEventId;
  public readonly JUMP_GE = seq.Next as GameEventId;
  public readonly GRAB_GE = seq.Next as GameEventId;
  public readonly GUARD_GE = seq.Next as GameEventId;
  public readonly UP_GE = seq.Next as GameEventId;
  public readonly DOWN_GE = seq.Next as GameEventId;
  // End of GameEvents that can be source from player input
  public readonly LAND_GE = seq.Next as GameEventId;
  public readonly SOFT_LAND_GE = seq.Next as GameEventId;
  public readonly FALL_GE = seq.Next as GameEventId;
  public readonly LEDGE_GRAB_GE = seq.Next as GameEventId;
  public readonly HIT_STOP_GE = seq.Next as GameEventId;
  public readonly LAUNCH_GE = seq.Next as GameEventId;
  public readonly TUBMLE_GE = seq.Next as GameEventId;
}

export const GAME_EVENT_IDS = new GAME_EVENTS();

seq.SeqStart = -1;

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
  public readonly HELPESS_S = seq.Next as StateId;
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
  public readonly SIDE_SPCL_S = seq.Next as StateId;
  public readonly SIDE_SPCL_EX_S = seq.Next as StateId;
  public readonly DOWN_SPCL_S = seq.Next as StateId;
  public readonly HIT_STOP_S = seq.Next as StateId;
  public readonly LAUNCH_S = seq.Next as StateId;
  public readonly TUMBLE_S = seq.Next as StateId;
  public readonly CROUCH_S = seq.Next as StateId;
}

export const STATE_IDS = new STATES();

seq.SeqStart = -1;

class ATTACKS {
  public readonly N_GRND_ATK = seq.Next as AttackId;
  public readonly S_GRND_ATK = seq.Next as AttackId;
  public readonly U_GRND_ATK = seq.Next as AttackId;
  public readonly D_GRND_ATK = seq.Next as AttackId;
  public readonly S_CHARGE_ATK = seq.Next as AttackId;
  public readonly S_CHARGE_EX_ATK = seq.Next as AttackId;
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
  public readonly U_SPCL_ATK = seq.Next as AttackId;
  public readonly D_SPCL_ATK = seq.Next as AttackId;
}

export const ATTACK_IDS = new ATTACKS();

// State mapping classes ===========================================================

class StateRelation {
  public readonly stateId: StateId;
  public readonly mappings: ActionStateMappings;

  constructor(stateId: StateId, actionStateTranslations: ActionStateMappings) {
    this.stateId = stateId;
    this.mappings = actionStateTranslations;
  }
}

export class ActionStateMappings {
  private readonly mappings = new Map<GameEventId, StateId>();
  private condtions?: Array<condition>;
  private defaultConditions?: Array<condition>;

  public GetMapping(geId: GameEventId): StateId | undefined {
    return this.mappings.get(geId);
  }

  public GetConditions() {
    return this.condtions;
  }

  public GetDefaults(): Array<condition> | undefined {
    return this.defaultConditions;
  }

  public SetMappings(mappingsArray: { geId: GameEventId; sId: StateId }[]) {
    mappingsArray.forEach((actSt) => {
      this.mappings.set(actSt.geId, actSt.sId);
    });
  }

  public SetConditions(conditions: Array<condition>) {
    this.condtions = conditions;
  }

  public SetDefaults(conditions: Array<condition>) {
    if (!this.defaultConditions) {
      this.defaultConditions = conditions;
    }
  }
}

// Conditionals ====================================================================

type conditionFunc = (world: World, playerIndex: number) => boolean;

type condition = {
  Name: string;
  ConditionFunc: conditionFunc;
  StateId: StateId;
};

export function RunCondition(
  c: condition,
  w: World,
  playerIndex: number
): StateId | undefined {
  if (c.ConditionFunc(w, playerIndex) === true) {
    return c.StateId;
  }
  return undefined;
}

const IdleToTurn: condition = {
  Name: 'IdleToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const flags = p.Flags;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (ia.LXAxis < 0 && flags.IsFacingRight) {
      return true;
    }

    if (ia.LXAxis > 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.TURN_S,
};

const IdleToDash: condition = {
  Name: 'IdleToDash',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const prevIa = w.GetPlayerPreviousInput(playerIndex)!;

    if (prevIa.Action === GAME_EVENT_IDS.MOVE_FAST_GE) {
      return false;
    }

    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (ia.Action !== GAME_EVENT_IDS.MOVE_FAST_GE) {
      return false;
    }

    const facingRight = p.Flags.IsFacingRight;
    const lxAxis = ia.LXAxis;

    if (lxAxis > 0 && facingRight) {
      return true;
    }

    if (lxAxis < 0 && !facingRight) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.DASH_S,
};

const IdleToDashturn: condition = {
  Name: 'IdleToTurnDash',
  ConditionFunc: (w: World, playerIndex: number) => {
    const prevIa = w.GetPlayerPreviousInput(playerIndex)!;

    if (prevIa.Action === GAME_EVENT_IDS.MOVE_FAST_GE) {
      return false;
    }

    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (ia.Action !== GAME_EVENT_IDS.MOVE_FAST_GE) {
      return false;
    }

    const p = w.GetPlayer(playerIndex)!;
    const flags = p.Flags;
    const lxAxis = ia.LXAxis;

    if (lxAxis < 0 && flags.IsFacingRight) {
      return true;
    }

    if (lxAxis > 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.DASH_TURN_S,
};

const WalkToDash: condition = {
  Name: 'WalkToDash',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const fsmInfo = p.FSMInfo;
    const prevIa = w.GetPlayerPreviousInput(playerIndex)!;

    if (
      fsmInfo.CurrentStateFrame > 2 ||
      prevIa.Action === GAME_EVENT_IDS.MOVE_FAST_GE
    ) {
      return false;
    }

    const flags = p.Flags;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (
      flags.IsFacingRight &&
      ia.LXAxis > 0 &&
      ia.Action === GAME_EVENT_IDS.MOVE_FAST_GE
    ) {
      return true;
    }

    if (
      flags.IsFacingLeft &&
      ia.LXAxis < 0 &&
      ia.Action === GAME_EVENT_IDS.MOVE_FAST_GE
    ) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.DASH_S,
};

const WalkToTurn: condition = {
  Name: 'WalkToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const prevIa = w.GetPlayerPreviousInput(playerIndex);

    if (prevIa === undefined) {
      return false;
    }

    const prevLax = prevIa.LXAxis;
    const curLax = ia.LXAxis;
    if ((prevLax < 0 && curLax > 0) || (prevLax > 0 && curLax < 0)) {
      return true;
    }

    const flags = p.Flags;
    if (
      (prevLax === 0 && flags.IsFacingRight && curLax < 0) ||
      (prevLax === 0 && flags.IsFacingLeft && curLax > 0)
    ) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.TURN_S,
};

const RunToTurn: condition = {
  Name: 'RunToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const prevIa = w.GetPlayerPreviousInput(playerIndex);

    if (prevIa === undefined) {
      return false;
    }

    const prevLax = prevIa.LXAxis;
    const curLax = ia.LXAxis;

    if ((prevLax < 0 && curLax > 0) || (prevLax > 0 && curLax < 0)) {
      return true;
    }

    const flags = p.Flags;
    if (
      (prevLax === 0 && flags.IsFacingRight && curLax < 0) ||
      (prevLax === 0 && flags.IsFacingLeft && curLax > 0)
    ) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.RUN_TURN_S,
};

const DashToTurn: condition = {
  Name: 'DashToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const prevIa = w.GetPlayerPreviousInput(playerIndex);

    if (prevIa === undefined) {
      return false;
    }

    const prevLax = prevIa.LXAxis; // Previous left stick X-axis
    const curLax = ia.LXAxis; // Current left stick X-axis
    const laxDifference = curLax - prevLax; // Difference between current and previous X-axis
    const threshold = 0.5; // Threshold for detecting significant variation

    const flags = p.Flags;
    const facingRight = flags.IsFacingRight;
    // Check if the variation exceeds the threshold and is in the opposite direction of the player's facing direction
    if (laxDifference < -threshold && facingRight) {
      // Player is facing right, but the stick moved significantly to the left
      if (curLax < 0) {
        return true;
      }
    }

    if (laxDifference > threshold && !facingRight) {
      // Player is facing left, but the stick moved significantly to the right
      if (curLax > 0) {
        return true;
      }
    }

    return false;
  },
  StateId: STATE_IDS.DASH_TURN_S,
};

const ToJump: condition = {
  Name: 'ToJump',
  ConditionFunc: (w: World, playerIndex: number) => {
    const player = w.GetPlayer(playerIndex)!;
    const currentInput = w.GetPlayerCurrentInput(playerIndex)!;
    const prevInput = w.GetPlayerPreviousInput(playerIndex);
    const jumpId = GAME_EVENT_IDS.JUMP_GE;

    if (
      inputMacthesTargetNotRepeating(jumpId, currentInput, prevInput) &&
      player.Jump.HasJumps()
    ) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.JUMP_S,
};

const ToAirDodge: condition = {
  Name: 'ToAirDodge',
  ConditionFunc: (w: World, playerIndex: number) => {
    const currentInput = w.GetPlayerCurrentInput(playerIndex);
    if (currentInput?.Action === GAME_EVENT_IDS.GUARD_GE) {
      return true;
    }
    return false;
  },
  StateId: STATE_IDS.AIR_DODGE_S,
};

const DashDefaultRun: condition = {
  Name: 'DashDefaultRun',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const flags = p.Flags;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (ia.LXAxis > 0 && flags.IsFacingRight) {
      return true;
    }

    if (ia.LXAxis < 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.RUN_S,
};

const DashDefaultIdle: condition = {
  Name: 'DashDefaultIdle',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (ia.LXAxis === 0) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.IDLE_S,
};

const TurnDefaultWalk: condition = {
  Name: 'TurnDefaultWalk',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex);
    const p = w.GetPlayer(playerIndex);
    const facingRight = p?.Flags.IsFacingRight;

    if ((facingRight && ia!.LXAxis < 0) || (!facingRight && ia!.LXAxis > 0)) {
      return true;
    }
    return false;
  },
  StateId: STATE_IDS.WALK_S,
};

const TurnToDash: condition = {
  Name: 'TurnToDash',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const stateFrame = p.FSMInfo.CurrentStateFrame;

    if (stateFrame > 2) {
      return false;
    }

    const input = w.GetPlayerCurrentInput(playerIndex)!;

    if (input.LXAxis < -0.5 && p.Flags.IsFacingRight) {
      return true;
    }

    if (input.LXAxis > 0.5 && p.Flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.DASH_S,
};

const ToNair: condition = {
  Name: 'ToNAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const prevIa = w.GetPlayerPreviousInput(playerIndex);

    return inputMacthesTargetNotRepeating(GAME_EVENT_IDS.ATTACK_GE, ia, prevIa);
  },
  StateId: STATE_IDS.N_AIR_S,
};

const ToFAir: condition = {
  Name: 'ToFAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex);
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const prevIa = w.GetPlayerPreviousInput(playerIndex) ?? ia;

    if (ia.Action === prevIa.Action) {
      return false;
    }

    if (ia.Action !== GAME_EVENT_IDS.SIDE_ATTACK_GE) {
      return false;
    }

    const isFacingRight = p?.Flags.IsFacingRight;
    const IsFacingLeft = !isFacingRight;

    const isRStickXAxisActuated = Math.abs(ia.RXAxis) > 0;

    if (isRStickXAxisActuated === true) {
      if (isFacingRight && ia.RXAxis > 0) {
        return true;
      }

      if (IsFacingLeft && ia.RXAxis < 0) {
        return true;
      }
    }

    if (isRStickXAxisActuated === false) {
      if (isFacingRight && ia.LXAxis > 0) {
        return true;
      }

      if (IsFacingLeft && ia.LXAxis < 0) {
        return true;
      }
    }

    return false;
  },
  StateId: STATE_IDS.F_AIR_S,
};

const ToBAir: condition = {
  Name: 'ToBAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex);
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const prevIa = w.GetPlayerPreviousInput(playerIndex);

    if (ia.Action === prevIa?.Action) {
      return false;
    }

    if (ia.Action === GAME_EVENT_IDS.SIDE_ATTACK_GE) {
      if (p!.Flags.IsFacingRight && (ia.RXAxis < 0 || ia.LXAxis < 0)) {
        return true;
      }

      if (p!.Flags.IsFacingLeft && (ia.RXAxis > 0 || ia.LXAxis > 0)) {
        return true;
      }
    }

    return false;
  },
  StateId: STATE_IDS.B_AIR_S,
};

const ToUAir: condition = {
  Name: 'UAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const prevIa = w.GetPlayerPreviousInput(playerIndex);

    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.UP_ATTACK_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.U_AIR_S,
};

const ToDAir: condition = {
  Name: 'UAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const prevIa = w.GetPlayerPreviousInput(playerIndex);

    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.DOWN_ATTACK_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.D_AIR_S,
};

const SideTiltToWalk: condition = {
  Name: 'SideTiltToWalk',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (
      ia.Action !== GAME_EVENT_IDS.MOVE_GE ||
      ia.Action !== GAME_EVENT_IDS.MOVE_FAST_GE
    ) {
      return false;
    }

    const p = w.GetPlayer(playerIndex)!;
    const flags = p.Flags;

    if (ia.LXAxis > 0 && flags.IsFacingRight) {
      return true;
    }

    if (ia.LXAxis < 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.WALK_S,
};

const defaultWalk: condition = {
  Name: 'Walk',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.WALK_S,
};

const defaultRun: condition = {
  Name: 'Run',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.RUN_S,
};

const defaultIdle: condition = {
  Name: 'Idle',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.IDLE_S,
};

const defaultDash: condition = {
  Name: 'Dash',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.DASH_S,
};

const defaultJump: condition = {
  Name: 'Jump',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.JUMP_S,
};

const defaultNFall: condition = {
  Name: 'NFall',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.N_FALL_S,
};

const defaultHelpess: condition = {
  Name: 'Helpless',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.HELPESS_S,
};

const defaultSideChargeEx: condition = {
  Name: 'DefaultSideChargeEx',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.SIDE_CHARGE_EX_S,
};

const defaultUpChargeEx: condition = {
  Name: 'DefaultUpChargeToEx',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.UP_CHARGE_EX_S,
};

const LandToIdle: condition = {
  Name: 'LandToIdle',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetInputManager(playerIndex).GetInputForFrame(w.localFrame)!;

    if (ia.LXAxis === 0) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.IDLE_S,
};

const LandToWalk: condition = {
  Name: 'LandToWalk',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const flags = p.Flags;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (ia.LXAxis > 0 && flags.IsFacingRight) {
      return true;
    }

    if (ia.LXAxis < 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.WALK_S,
};

const LandToTurn: condition = {
  Name: 'LandToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const flags = p.Flags;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (ia.LXAxis < 0 && flags.IsFacingRight) {
      return true;
    }

    if (ia.LXAxis > 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.TURN_S,
};

const DefaultDownTiltToCrouch: condition = {
  Name: 'DefaultDownTiltToCrouch',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    if (ia.Action === GAME_EVENT_IDS.DOWN_GE) {
      return true;
    }
    return false;
  },
  StateId: STATE_IDS.CROUCH_S,
};

const RunStopToTurn: condition = {
  Name: 'RunStopToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const flags = p.Flags;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (ia.LXAxis > 0 && flags.IsFacingLeft) {
      return true;
    }

    if (ia.LXAxis < 0 && flags.IsFacingRight) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.RUN_TURN_S,
};

const IdleToAttack: condition = {
  Name: 'IdleToAttack',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const lastIa = w.GetPlayerPreviousInput(playerIndex);
    return inputMacthesTargetNotRepeating(GAME_EVENT_IDS.ATTACK_GE, ia, lastIa);
  },
  StateId: STATE_IDS.ATTACK_S,
};

const IdleToSideCharge: condition = {
  Name: 'IdleToSideCharge',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const lastIa = w.GetPlayerPreviousInput(playerIndex)!;

    if (
      inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.SIDE_ATTACK_GE,
        ia,
        lastIa
      ) === false
    ) {
      return false;
    }

    if (Math.abs(ia.RXAxis) > Math.abs(ia.RYAxis) === false) {
      return false;
    }

    return true;
  },
  StateId: STATE_IDS.SIDE_CHARGE_S,
};

const IdleToUpTilt: condition = {
  Name: 'IdleToUpTilt',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const lastIa = w.GetPlayerPreviousInput(playerIndex);
    if (
      inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.UP_ATTACK_GE,
        ia,
        lastIa
      ) === false
    ) {
      return false;
    }

    if (ia.RYAxis > 0) {
      return false;
    }

    return true;
  },
  StateId: STATE_IDS.UP_TILT_S,
};

const IdleToUpCharge: condition = {
  Name: 'IdleToUpCharge',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const lastIa = w.GetPlayerPreviousInput(playerIndex);

    if (
      inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.UP_ATTACK_GE,
        ia,
        lastIa
      ) === false
    ) {
      return false;
    }

    if (Math.abs(ia.RYAxis) > Math.abs(ia.RXAxis) === false) {
      return false;
    }

    return true;
  },
  StateId: STATE_IDS.UP_CHARGE_S,
};

const RunToDashAttack: condition = {
  Name: 'ToDashAttack',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    if (ia.Action === GAME_EVENT_IDS.SIDE_ATTACK_GE) {
      const facingRight = p.Flags.IsFacingRight;
      if (
        (ia.LXAxis > 0 && facingRight) ||
        (ia.LXAxis < 0 && facingRight === false)
      ) {
        return true;
      }
    }
    return false;
  },
  StateId: STATE_IDS.DASH_ATTACK_S,
};

const WalkToSideTilt: condition = {
  Name: 'WalkToSideTilt',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    if (ia.Action === GAME_EVENT_IDS.SIDE_ATTACK_GE) {
      const facingRight = p.Flags.IsFacingRight;
      if (
        (ia.LXAxis > 0 && facingRight) ||
        (ia.LXAxis < 0 && facingRight === false)
      ) {
        return true;
      }
    }
    return false;
  },
  StateId: STATE_IDS.SIDE_TILT_S,
};

const ToSideSpecial: condition = {
  Name: 'ToSideSpecial',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const lastIa = w.GetPlayerPreviousInput(playerIndex);
    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.SIDE_SPCL_GE,
      ia,
      lastIa
    );
  },
  StateId: STATE_IDS.SIDE_SPCL_S,
};

const ToDownSpecial: condition = {
  Name: 'IdleToDownSpecial',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const lastIa = w.GetPlayerPreviousInput(playerIndex);

    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.DOWN_SPCL_GE,
      ia,
      lastIa
    );
  },
  StateId: STATE_IDS.DOWN_SPCL_S,
};

const ToDownTilt: condition = {
  Name: 'ToDownTilt',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;
    const prevIa = w.GetPlayerPreviousInput(playerIndex);

    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.DOWN_ATTACK_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.DOWN_TILT_S,
};

const HitStopToLaunch: condition = {
  Name: 'HitStopToLaunch',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;

    if (p.HitStop.HitStopFrames > 0) {
      return false;
    }

    return true;
  },
  StateId: STATE_IDS.LAUNCH_S,
};

const LaunchToTumble: condition = {
  Name: 'LaunchToHitStun',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.GetPlayer(playerIndex)!;

    if (p.HitStun.FramesOfHitStun > 0) {
      return false;
    }

    return true;
  },
  StateId: STATE_IDS.TUMBLE_S,
};

const SideChargeToEx: condition = {
  Name: 'SideChargeToEx',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (ia.Action === GAME_EVENT_IDS.IDLE_GE) {
      return true;
    }

    const p = w.GetPlayer(playerIndex)!;
    const flags = p.Flags;

    if (flags.IsFacingRight && ia.RXAxis <= 0) {
      return true;
    }

    if (flags.IsFacingLeft && ia.RXAxis >= 0) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.SIDE_CHARGE_EX_S,
};

const UpChargeToEx: condition = {
  Name: 'UpChargeToEx',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ia = w.GetPlayerCurrentInput(playerIndex)!;

    if (ia.Action === GAME_EVENT_IDS.IDLE_GE) {
      return true;
    }

    if (ia.RYAxis >= 0) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.UP_CHARGE_EX_S,
};

// StateMapping init functions ====================================================================

function InitIdleRelations(): StateRelation {
  const idleTranslations = new ActionStateMappings();

  idleTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.MOVE_GE, sId: STATE_IDS.WALK_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
  ]);

  const condtions: Array<condition> = [
    IdleToDash,
    IdleToDashturn,
    IdleToTurn,
    IdleToAttack,
    IdleToSideCharge,
    IdleToUpCharge,
    IdleToUpTilt,
    ToSideSpecial,
    ToDownSpecial,
  ];

  idleTranslations.SetConditions(condtions);

  const idle = new StateRelation(STATE_IDS.IDLE_S, idleTranslations);
  return idle;
}

function InitTurnRelations(): StateRelation {
  const turnTranslations = new ActionStateMappings();

  turnTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  const defaultConditions: Array<condition> = [
    TurnDefaultWalk,
    defaultIdle,
    ToSideSpecial,
  ];

  turnTranslations.SetConditions([TurnToDash, ToSideSpecial, WalkToSideTilt]);

  turnTranslations.SetDefaults(defaultConditions);

  const turnWalk = new StateRelation(STATE_IDS.TURN_S, turnTranslations);

  return turnWalk;
}

function InitWalkRelations(): StateRelation {
  const walkTranslations = new ActionStateMappings();

  walkTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.IDLE_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
  ]);

  const conditions: Array<condition> = [
    WalkToTurn,
    WalkToDash,
    ToSideSpecial,
    WalkToSideTilt,
  ];

  walkTranslations.SetConditions(conditions);

  const walkRelations = new StateRelation(STATE_IDS.WALK_S, walkTranslations);

  return walkRelations;
}

function InitDashRelations(): StateRelation {
  const dashTranslations = new ActionStateMappings();

  dashTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  const conditions: Array<condition> = [
    DashToTurn,
    ToSideSpecial,
    RunToDashAttack,
  ];

  dashTranslations.SetConditions(conditions);

  const defaultConditions: Array<condition> = [
    DashDefaultRun,
    defaultIdle /*DashDefaultIdle*/,
  ];

  dashTranslations.SetDefaults(defaultConditions);

  const dashRelations = new StateRelation(STATE_IDS.DASH_S, dashTranslations);

  return dashRelations;
}

function InitDashTurnRelations(): StateRelation {
  const dashTrunTranslations = new ActionStateMappings();

  dashTrunTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  dashTrunTranslations.SetConditions([ToSideSpecial]);

  dashTrunTranslations.SetDefaults([defaultDash]);

  const dashTurnRelations = new StateRelation(
    STATE_IDS.DASH_TURN_S,
    dashTrunTranslations
  );

  return dashTurnRelations;
}

function InitRunRelations(): StateRelation {
  const runTranslations = new ActionStateMappings();

  runTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.STOP_RUN_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
  ]);

  const conditions: Array<condition> = [
    RunToTurn,
    ToSideSpecial,
    RunToDashAttack,
  ];

  runTranslations.SetConditions(conditions);

  const runRelations = new StateRelation(STATE_IDS.RUN_S, runTranslations);

  return runRelations;
}

function InitRunTurnRelations(): StateRelation {
  const runTurnMapping = new ActionStateMappings();

  runTurnMapping.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  runTurnMapping.SetConditions([ToSideSpecial]);
  runTurnMapping.SetDefaults([defaultRun]);

  const runTurnRelations = new StateRelation(
    STATE_IDS.RUN_TURN_S,
    runTurnMapping
  );

  return runTurnRelations;
}

function InitStopRunRelations(): StateRelation {
  const stopRunTranslations = new ActionStateMappings();

  stopRunTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.MOVE_FAST_GE, sId: STATE_IDS.DASH_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
    { geId: GAME_EVENT_IDS.SIDE_SPCL_GE, sId: STATE_IDS.SIDE_SPCL_S },
  ]);

  const conditions: Array<condition> = [RunStopToTurn];

  stopRunTranslations.SetConditions(conditions);

  stopRunTranslations.SetDefaults([defaultIdle]);

  const stopRunRelations = new StateRelation(
    STATE_IDS.STOP_RUN_S,
    stopRunTranslations
  );

  return stopRunRelations;
}

function InitJumpSquatRelations(): StateRelation {
  const jumpSquatTranslations = new ActionStateMappings();

  jumpSquatTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  jumpSquatTranslations.SetDefaults([defaultJump]);

  const jumpSquatRelations = new StateRelation(
    STATE_IDS.JUMP_SQUAT_S,
    jumpSquatTranslations
  );

  return jumpSquatRelations;
}

function InitJumpRelations(): StateRelation {
  const jumpTranslations = new ActionStateMappings();

  jumpTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  jumpTranslations.SetConditions([ToJump, ToAirDodge]);

  jumpTranslations.SetDefaults([defaultNFall]);

  const jumpRelations = new StateRelation(STATE_IDS.JUMP_S, jumpTranslations);

  return jumpRelations;
}

function InitNeutralFallRelations(): StateRelation {
  const nFallTranslations = new ActionStateMappings();

  nFallTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  nFallTranslations.SetConditions([
    ToJump,
    ToAirDodge,
    ToNair,
    ToUAir,
    ToDAir,
    ToFAir,
    ToBAir,
  ]);

  const nFallRelations = new StateRelation(
    STATE_IDS.N_FALL_S,
    nFallTranslations
  );

  return nFallRelations;
}

function InitLandRelations(): StateRelation {
  const landTranslations = new ActionStateMappings();

  landTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
  ]);

  landTranslations.SetDefaults([LandToIdle, LandToWalk, LandToTurn]);

  const landRelations = new StateRelation(STATE_IDS.LAND_S, landTranslations);

  return landRelations;
}

function InitSoftLandRelations(): StateRelation {
  const softLandTranslations = new ActionStateMappings();

  softLandTranslations.SetMappings([
    { geId: STATE_IDS.HIT_STOP_S, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
  ]);

  softLandTranslations.SetDefaults([LandToIdle, LandToWalk, LandToTurn]);

  const softLandRelations = new StateRelation(
    STATE_IDS.SOFT_LAND_S,
    softLandTranslations
  );

  return softLandRelations;
}

function InitLedgeGrabRelations(): StateRelation {
  const LedgeGrabTranslations = new ActionStateMappings();

  LedgeGrabTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_S },
  ]);

  const LedgeGrabRelations = new StateRelation(
    STATE_IDS.LEDGE_GRAB_S,
    LedgeGrabTranslations
  );

  return LedgeGrabRelations;
}

function InitAirDodgeRelations(): StateRelation {
  const airDodgeTranslations = new ActionStateMappings();

  airDodgeTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.LAND_S },
  ]);

  airDodgeTranslations.SetDefaults([defaultHelpess]);

  const AirDodgeRelations = new StateRelation(
    STATE_IDS.AIR_DODGE_S,
    airDodgeTranslations
  );

  return AirDodgeRelations;
}

function InitHelpessRelations(): StateRelation {
  const helpessTranslations = new ActionStateMappings();

  helpessTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  const HelplessRelations = new StateRelation(
    STATE_IDS.HELPESS_S,
    helpessTranslations
  );

  return HelplessRelations;
}

function InitAttackRelations(): StateRelation {
  const attackTranslations = new ActionStateMappings();

  attackTranslations.SetDefaults([defaultIdle]);

  const attackRelations = new StateRelation(
    STATE_IDS.ATTACK_S,
    attackTranslations
  );

  return attackRelations;
}

function InitDashAttackRelations(): StateRelation {
  const dashAtkTranslations = new ActionStateMappings();

  dashAtkTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  dashAtkTranslations.SetDefaults([defaultIdle]);

  const dashAtkRelations = new StateRelation(
    STATE_IDS.DASH_ATTACK_S,
    dashAtkTranslations
  );

  return dashAtkRelations;
}

function InitSideChargeRelations(): StateRelation {
  const sideChargeTranslations = new ActionStateMappings();

  sideChargeTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  sideChargeTranslations.SetConditions([SideChargeToEx]);

  sideChargeTranslations.SetDefaults([defaultSideChargeEx]);

  const sideChargeRelations = new StateRelation(
    STATE_IDS.SIDE_CHARGE_S,
    sideChargeTranslations
  );

  return sideChargeRelations;
}

function InitSideChargeExRelations(): StateRelation {
  const sideChargeExTranslations = new ActionStateMappings();

  sideChargeExTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  sideChargeExTranslations.SetDefaults([defaultIdle]);

  const relation = new StateRelation(
    STATE_IDS.SIDE_CHARGE_EX_S,
    sideChargeExTranslations
  );

  return relation;
}

function InitUpChargeRelations(): StateRelation {
  const upChargeRelations = new ActionStateMappings();

  upChargeRelations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  upChargeRelations.SetConditions([UpChargeToEx]);

  upChargeRelations.SetDefaults([defaultUpChargeEx]);

  const relation = new StateRelation(STATE_IDS.UP_CHARGE_S, upChargeRelations);

  return relation;
}

function InitiUpChargeExRelations(): StateRelation {
  const translations = new ActionStateMappings();

  translations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  translations.SetConditions([UpChargeToEx]);

  translations.SetDefaults([defaultIdle]);

  const relation = new StateRelation(STATE_IDS.UP_CHARGE_EX_S, translations);

  return relation;
}

function InitAirAttackRelations(): StateRelation {
  const airAttackTranslations = new ActionStateMappings();

  airAttackTranslations.SetDefaults([defaultNFall]);

  airAttackTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  const airAttackRelations = new StateRelation(
    STATE_IDS.N_AIR_S,
    airAttackTranslations
  );

  return airAttackRelations;
}

function InitFAirAttackRelations(): StateRelation {
  const fAirAttackTranslations = new ActionStateMappings();

  fAirAttackTranslations.SetDefaults([defaultNFall]);

  fAirAttackTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  const fAirTranslations = new StateRelation(
    STATE_IDS.F_AIR_S,
    fAirAttackTranslations
  );

  return fAirTranslations;
}

function InitUAirRelations(): StateRelation {
  const uAirTranslations = new ActionStateMappings();

  uAirTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  uAirTranslations.SetDefaults([defaultNFall]);

  const uAirRelations = new StateRelation(STATE_IDS.U_AIR_S, uAirTranslations);

  return uAirRelations;
}

function InitBAirRelations(): StateRelation {
  const bAirTranslations = new ActionStateMappings();

  bAirTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  bAirTranslations.SetDefaults([defaultNFall]);

  const bAirRelations = new StateRelation(STATE_IDS.B_AIR_S, bAirTranslations);

  return bAirRelations;
}

function InitDAirRelations(): StateRelation {
  const dAirTranslations = new ActionStateMappings();

  dAirTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
  ]);

  dAirTranslations.SetDefaults([defaultNFall]);

  const bAirRelations = new StateRelation(STATE_IDS.D_AIR_S, dAirTranslations);

  return bAirRelations;
}

function InitSideSpecialRelations(): StateRelation {
  const sideSpclTranslations = new ActionStateMappings();

  sideSpclTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.HELPESS_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    {
      geId: GAME_EVENT_IDS.SIDE_SPCL_EX_GE,
      sId: STATE_IDS.SIDE_SPCL_EX_S,
    },
  ]);

  sideSpclTranslations.SetDefaults([defaultIdle]);

  const sideSpecialRelations = new StateRelation(
    STATE_IDS.SIDE_SPCL_S,
    sideSpclTranslations
  );

  return sideSpecialRelations;
}

function InitSideSpecialExtensionRelations(): StateRelation {
  const sideSpclExTranslations = new ActionStateMappings();

  sideSpclExTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  sideSpclExTranslations.SetDefaults([defaultIdle]);

  const sideSpclExRelations = new StateRelation(
    STATE_IDS.SIDE_SPCL_EX_S,
    sideSpclExTranslations
  );

  return sideSpclExRelations;
}

function InitDownSpecialRelations(): StateRelation {
  const downSpecialTranslations = new ActionStateMappings();

  downSpecialTranslations.SetDefaults([defaultIdle]);

  const downSpecRelations = new StateRelation(
    STATE_IDS.DOWN_SPCL_S,
    downSpecialTranslations
  );

  return downSpecRelations;
}

function InitHitStopRelations(): StateRelation {
  const hitStopTranslations = new ActionStateMappings();

  const hitStopConditions = [HitStopToLaunch];

  hitStopTranslations.SetConditions(hitStopConditions);

  const hitStunRelations = new StateRelation(
    STATE_IDS.HIT_STOP_S,
    hitStopTranslations
  );

  return hitStunRelations;
}

function InitTumbleRelations(): StateRelation {
  const TumbleTranslations = new ActionStateMappings();

  TumbleTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.LAND_S },
  ]);

  TumbleTranslations.SetConditions([ToJump]);

  const TumbleRelations = new StateRelation(
    STATE_IDS.TUMBLE_S,
    TumbleTranslations
  );

  return TumbleRelations;
}

function InitLaunchRelations(): StateRelation {
  const launchTranslations = new ActionStateMappings();

  launchTranslations.SetConditions([LaunchToTumble]);

  const launchRelations = new StateRelation(
    STATE_IDS.LAUNCH_S,
    launchTranslations
  );

  return launchRelations;
}

function InitCrouchRelations(): StateRelation {
  const crouchTranslations = new ActionStateMappings();

  crouchTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.IDLE_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.MOVE_GE, sId: STATE_IDS.WALK_S },
    { geId: GAME_EVENT_IDS.MOVE_FAST_GE, sId: STATE_IDS.DASH_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
  ]);

  crouchTranslations.SetConditions([ToDownSpecial, ToDownTilt]);

  const crouchRelations = new StateRelation(
    STATE_IDS.CROUCH_S,
    crouchTranslations
  );

  return crouchRelations;
}

function InitDownTiltRelations(): StateRelation {
  const dTiltTranslations = new ActionStateMappings();

  dTiltTranslations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  dTiltTranslations.SetDefaults([DefaultDownTiltToCrouch, defaultIdle]);

  const dTiltRelations = new StateRelation(
    STATE_IDS.DOWN_TILT_S,
    dTiltTranslations
  );

  return dTiltRelations;
}

function InitSideTiltRelations(): StateRelation {
  const sideTiltTrnalsations = new ActionStateMappings();

  sideTiltTrnalsations.SetMappings([
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
  ]);

  sideTiltTrnalsations.SetDefaults([defaultIdle]);

  const sideTiltRelations = new StateRelation(
    STATE_IDS.SIDE_TILT_S,
    sideTiltTrnalsations
  );

  return sideTiltRelations;
}

function InitUpTiltRelations(): StateRelation {
  const upTiltTranslations = new ActionStateMappings();

  upTiltTranslations.SetMappings([
    {
      geId: GAME_EVENT_IDS.HIT_STOP_GE,
      sId: STATE_IDS.HIT_STOP_S,
    },
  ]);

  upTiltTranslations.SetDefaults([defaultIdle]);

  const upTiltRelations = new StateRelation(
    STATE_IDS.UP_TILT_S,
    upTiltTranslations
  );

  return upTiltRelations;
}

// STATES ==================================================================

export const Idle: FSMState = {
  StateName: 'IDLE',
  StateId: STATE_IDS.IDLE_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.SetCanWalkOffFalse();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.Flags.SetCanWalkOffTrue();
  },
};

export const Walk: FSMState = {
  StateName: 'WALK',
  StateId: STATE_IDS.WALK_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.SetCanWalkOffFalse();
  },
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID);
    if (ia !== undefined) {
      p.AddWalkImpulseToPlayer(ia.LXAxis);
    }
  },
  OnExit: (p: Player, w: World) => {
    p.Flags.SetCanWalkOffTrue();
  },
};

export const Turn: FSMState = {
  StateName: 'TURN',
  StateId: STATE_IDS.TURN_S,
  OnEnter: (p: Player, W: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.Flags.ChangeDirections();
  },
};

export const Dash: FSMState = {
  StateName: 'DASH',
  StateId: STATE_IDS.DASH_S,
  OnEnter: (p: Player, w: World) => {
    const flags = p.Flags;
    const MaxDashSpeed = p.Speeds.MaxDashSpeed;
    const impulse = flags.IsFacingRight
      ? Math.floor(MaxDashSpeed / 0.33)
      : -Math.floor(MaxDashSpeed / 0.33);

    p.Velocity.AddClampedXImpulse(MaxDashSpeed, impulse);
  },
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID);
    const speedsComp = p.Speeds;
    const dashSpeedMultiplier = speedsComp.DashMultiplier;
    const impulse = (ia?.LXAxis ?? 0) * dashSpeedMultiplier;
    p.Velocity.AddClampedXImpulse(speedsComp.MaxDashSpeed, impulse);
  },
  OnExit: (p: Player, w: World) => {},
};

export const DashTurn: FSMState = {
  StateName: 'DASH_TURN',
  StateId: STATE_IDS.DASH_TURN_S,
  OnEnter: (p: Player, w: World) => {
    p.Velocity.X = 0;
    p.Flags.ChangeDirections();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const Run: FSMState = {
  StateName: 'RUN',
  StateId: STATE_IDS.RUN_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID);
    if (ia !== undefined) {
      const speeds = p.Speeds;
      p.Velocity.AddClampedXImpulse(
        speeds.MaxRunSpeed,
        ia.LXAxis * speeds.RunSpeedMultiplier
      );
    }
  },
  OnExit: (p: Player, w: World) => {},
};

export const RunTurn: FSMState = {
  StateName: 'RUN_TURN',
  StateId: STATE_IDS.RUN_TURN_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.SetCanWalkOffFalse();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.Flags.ChangeDirections();
    p.Flags.SetCanWalkOffTrue();
  },
};

export const RunStop: FSMState = {
  StateName: 'RUN_STOP',
  StateId: STATE_IDS.STOP_RUN_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.SetCanWalkOffFalse();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.Flags.SetCanWalkOffTrue();
  },
};

export const JumpSquat: FSMState = {
  StateName: 'JUMPSQUAT',
  StateId: STATE_IDS.JUMP_SQUAT_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const Jump: FSMState = {
  StateName: 'JUMP',
  StateId: STATE_IDS.JUMP_S,
  OnEnter: (p: Player, w: World) => {
    const jumpComp = p.Jump;
    p.Flags.FastFallOff();
    jumpComp.IncrementJumps();
    p.ECB.SetECBShape(STATE_IDS.JUMP_S);
    p.AddToPlayerYPosition(-p.ECB.YOffset);
  },
  OnUpdate: (p: Player, w: World) => {
    if (p.FSMInfo.CurrentStateFrame === 1) {
      p.Velocity.Y = -p.Jump.JumpVelocity;
    }

    const inputAction = w.GetPlayerCurrentInput(p.ID);
    const speedsComp = p.Speeds;
    p.Velocity.AddClampedXImpulse(
      speedsComp.AerialSpeedInpulseLimit,
      (inputAction?.LXAxis ?? 0) * speedsComp.ArielVelocityMultiplier
    );
  },
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const NeutralFall: FSMState = {
  StateName: 'NFALL',
  StateId: STATE_IDS.N_FALL_S,
  OnEnter: (p: Player, w: World) => {
    if (p.Jump.JumpCountIsZero()) {
      p.Jump.IncrementJumps();
    }
    p.ECB.SetECBShape(STATE_IDS.N_FALL_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID)!;
    const speedsComp = p.Speeds;
    const prevIa = w.GetPlayerPreviousInput(p.ID)!;

    if (p.Velocity.Y > 0 && ia.LYAxis < -0.8 && prevIa.LYAxis > -0.8) {
      p.Flags.FastFallOn();
    }

    p.Velocity.AddClampedXImpulse(
      speedsComp.AerialSpeedInpulseLimit,
      ia.LXAxis * speedsComp.ArielVelocityMultiplier
    );
  },
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
  },
};

export const Land: FSMState = {
  StateName: 'Land',
  StateId: STATE_IDS.LAND_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Jump.ResetJumps();
    p.Velocity.Y = 0;
    p.LedgeDetector.ZeroLedgeGrabCount();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const SoftLand: FSMState = {
  StateName: 'SoftLand',
  StateId: STATE_IDS.SOFT_LAND_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Jump.ResetJumps();
    p.Velocity.Y = 0;
    p.LedgeDetector.ZeroLedgeGrabCount();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {},
};

export const LedgeGrab: FSMState = {
  StateName: 'LedgeGrab',
  StateId: STATE_IDS.LEDGE_GRAB_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Flags.GravityOff();
    p.Velocity.X = 0;
    p.Velocity.Y = 0;
    const ledgeDetectorComp = p.LedgeDetector;
    const jumpComp = p.Jump;
    jumpComp.ResetJumps();
    jumpComp.IncrementJumps();
    ledgeDetectorComp.IncrementLedgeGrabs();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.Flags.GravityOn();
  },
};

export const AirDodge: FSMState = {
  StateName: 'AirDodge',
  StateId: STATE_IDS.AIR_DODGE_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Flags.GravityOff();
    const pVel = p.Velocity;
    const ia = w.GetPlayerCurrentInput(p.ID)!;
    const angle = Math.atan2(ia?.LYAxis, ia?.LXAxis);
    const speed = p.Speeds.AirDogeSpeed;
    pVel.X = Math.cos(angle) * speed;
    pVel.Y = -Math.sin(angle) * speed;
  },
  OnUpdate: (p: Player, w: World) => {
    const frameLength = p.FSMInfo.GetFrameLengthForState(
      STATE_IDS.AIR_DODGE_S
    )!;
    const currentFrameForState = p.FSMInfo.CurrentStateFrame;
    const normalizedTime = Math.min(currentFrameForState / frameLength, 1);
    const ease = EaseIn(normalizedTime);
    const pVel = p.Velocity;
    pVel.X *= 1 - ease;
    pVel.Y *= 1 - ease;
  },
  OnExit: (p: Player, w: World) => {
    p.Flags.GravityOn();
  },
};

export const Helpess: FSMState = {
  StateName: 'Helpess',
  StateId: STATE_IDS.HELPESS_S,
  OnEnter: (p: Player, w: World) => {
    if (p.Jump.OnFirstJump()) {
      p.Jump.IncrementJumps();
    }
  },
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID);
    const speeds = p.Speeds;
    const airSpeed = speeds.AerialSpeedInpulseLimit;
    const airMult = speeds.ArielVelocityMultiplier;
    p.Velocity.AddClampedXImpulse(airSpeed, (ia!.LXAxis * airMult) / 2);
  },
  OnExit: (p: Player, w: World) => {},
};

export const NAttack: FSMState = {
  StateName: 'Attack',
  StateId: STATE_IDS.ATTACK_S,
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.ATTACK_GE);
  },
  OnUpdate: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    const attack = attackComp.GetAttack();
    const impulse = attack?.GetActiveImpulseForFrame(
      p.FSMInfo.CurrentStateFrame
    );

    if (impulse === undefined) {
      return;
    }

    const x = p.Flags.IsFacingRight ? impulse.X : -impulse.X;
    const y = impulse.Y;
    const clamp = attack?.ImpulseClamp;
    const pVel = p.Velocity;
    if (clamp !== undefined) {
      pVel.AddClampedXImpulse(clamp, x);
      pVel.AddClampedYImpulse(clamp, y);
    }
  },
  OnExit: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    attackComp.ZeroCurrentAttack();
  },
};

export const DashAttack: FSMState = {
  StateName: 'DashAttack',
  StateId: STATE_IDS.DASH_ATTACK_S,
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.DASH_ATTACK_GE);
    p.Flags.SetCanWalkOffFalse();
  },
  OnUpdate: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    const attack = attackComp.GetAttack();
    const impulse = attack?.GetActiveImpulseForFrame(
      p.FSMInfo.CurrentStateFrame
    );

    if (impulse === undefined) {
      return;
    }

    const x = p.Flags.IsFacingRight ? impulse.X : -impulse.X;
    const y = impulse.Y;
    const clamp = attack?.ImpulseClamp;
    const pVel = p.Velocity;
    if (clamp !== undefined) {
      pVel.AddClampedXImpulse(clamp, x);
      pVel.AddClampedYImpulse(clamp, y);
    }
  },
  OnExit: (p, w) => {
    const attackComp = p.Attacks;
    attackComp.ZeroCurrentAttack();
    p.Flags.SetCanWalkOffTrue();
  },
};

export const DownTilt: FSMState = {
  StateName: 'DownTilt',
  StateId: STATE_IDS.DOWN_TILT_S,
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.D_TILT_GE);
    p.ECB.SetECBShape(STATE_IDS.DOWN_TILT_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    const attack = attackComp.GetAttack();
    const impulse = attack?.GetActiveImpulseForFrame(
      p.FSMInfo.CurrentStateFrame
    );

    if (impulse === undefined) {
      return;
    }

    const x = p.Flags.IsFacingRight ? impulse.X : -impulse.X;
    const y = impulse.Y;
    const clamp = attack?.ImpulseClamp;
    const pVel = p.Velocity;
    if (clamp !== undefined) {
      pVel.AddClampedXImpulse(clamp, x);
      pVel.AddClampedYImpulse(clamp, y);
    }
  },
  OnExit: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    attackComp.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
};

export const SideTilt: FSMState = {
  StateName: 'SideTilt',
  StateId: STATE_IDS.SIDE_TILT_S,
  OnEnter: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID)!;

    if (ia.LYAxis > 0.15) {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.S_TILT_U_GE);
      p.ECB.SetECBShape(STATE_IDS.SIDE_TILT_S);
      return;
    }

    if (ia.LYAxis < -0.15) {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.S_TILT_D_GE);
      p.ECB.SetECBShape(STATE_IDS.SIDE_TILT_S);
      return;
    }

    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.S_TILT_GE);
    p.ECB.SetECBShape(STATE_IDS.SIDE_TILT_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    const attack = attackComp.GetAttack()!;
    const impulse = attack?.GetActiveImpulseForFrame(
      p.FSMInfo.CurrentStateFrame
    );

    if (impulse === undefined) {
      return;
    }

    addAttackImpulseToPlayer(p, impulse, attack);
  },
  OnExit: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    attackComp.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
};

export const UpTilt: FSMState = {
  StateName: 'UpTilt',
  StateId: STATE_IDS.UP_TILT_S,
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.U_TILT_GE);
    p.ECB.SetECBShape(STATE_IDS.UP_TILT_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    const attack = attackComp.GetAttack()!;
    const impulse = attack?.GetActiveImpulseForFrame(
      p.FSMInfo.CurrentStateFrame
    );

    if (impulse === undefined) {
      return;
    }

    addAttackImpulseToPlayer(p, impulse, attack);
  },
  OnExit: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    attackComp.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
};

export const SideCharge: FSMState = {
  StateName: 'SideChagrge',
  OnEnter: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID)!;
    const rXAxis = ia.RXAxis;

    if (rXAxis > 0) {
      p.Flags.FaceRight();
    }

    if (rXAxis < 0) {
      p.Flags.FaceLeft();
    }

    p.Flags.SetCanWalkOffFalse();
    const attackComp = p.Attacks;
    attackComp.SetCurrentAttack(GAME_EVENT_IDS.SIDE_CHARGE_GE);
    attackComp.GetAttack()!.OnEnter(w, p);
  },
  OnUpdate: (p, w) => {
    // Shake player maybe?
  },
  OnExit: (p, w) => {
    p.Flags.SetCanWalkOffTrue();
    const attackComp = p.Attacks;
    attackComp.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
  StateId: STATE_IDS.SIDE_CHARGE_S,
};

export const SideChargeEx: FSMState = {
  StateName: 'SideChagrgeEx',
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.SIDE_CHARGE_EX_GE);
    p.ECB.SetECBShape(STATE_IDS.SIDE_CHARGE_EX_S);
  },
  OnUpdate: (p, w) => {
    const attackComp = p.Attacks;
    const attack = attackComp.GetAttack()!;
    const impulse = attack?.GetActiveImpulseForFrame(
      p.FSMInfo.CurrentStateFrame
    );

    if (impulse === undefined) {
      return;
    }

    addAttackImpulseToPlayer(p, impulse, attack);
  },
  OnExit: (p, w) => {
    p.Attacks.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
  StateId: STATE_IDS.SIDE_CHARGE_EX_S,
};

export const UpCharge: FSMState = {
  StateName: 'UpCharge',
  OnEnter: (p, w) => {
    const ia = w.GetPlayerCurrentInput(p.ID)!;
    const rXAxis = ia.RXAxis;
    if (rXAxis > 0) {
      p.Flags.FaceRight();
    }
    if (rXAxis < 0) {
      p.Flags.FaceLeft();
    }

    p.Flags.SetCanWalkOffFalse();
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.UP_CHARGE_GE);
    p.ECB.SetECBShape(STATE_IDS.UP_CHARGE_S);
  },
  OnUpdate: (p, w) => {},
  OnExit: (p, w) => {
    p.Flags.SetCanWalkOffTrue();
    p.Attacks.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
  StateId: STATE_IDS.UP_CHARGE_S,
};

export const UpChargeEx: FSMState = {
  StateName: 'UpChargeExt',
  OnEnter: (p, w) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.UP_CHARGE_EX_GE);
    p.ECB.SetECBShape(STATE_IDS.UP_CHARGE_EX_S);
  },
  OnUpdate: (p, w) => {
    const attackComp = p.Attacks;
    const attack = attackComp.GetAttack()!;
    const impulse = attack?.GetActiveImpulseForFrame(
      p.FSMInfo.CurrentStateFrame
    );

    if (impulse === undefined) {
      return;
    }

    addAttackImpulseToPlayer(p, impulse, attack);
  },
  OnExit: (p, w) => {
    p.Attacks.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
  StateId: STATE_IDS.UP_CHARGE_EX_S,
};

export const DownCharge: FSMState = {
  StateName: 'DownCharge',
  OnEnter: (p, w) => {},
  OnUpdate: (p, w) => {},
  OnExit: (p, w) => {},
  StateId: STATE_IDS.DOWN_CHARGE_S,
};

export const DownChargeEx: FSMState = {
  StateName: 'DownChargeExt',
  OnEnter: (p, w) => {},
  OnUpdate: (p, w) => {},
  OnExit: (p, w) => {},
  StateId: STATE_IDS.DOWN_CHARGE_EX_S,
};

export const NAerialAttack: FSMState = {
  StateName: 'AerialAttack',
  StateId: STATE_IDS.N_AIR_S,
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.N_AIR_GE);
    p.ECB.SetECBShape(STATE_IDS.N_AIR_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID)!;
    const prevIa = w.GetPlayerPreviousInput(p.ID);
    const speeds = p.Speeds;
    const airSpeed = speeds.AerialSpeedInpulseLimit;
    const airMult = speeds.ArielVelocityMultiplier;
    p.Velocity.AddClampedXImpulse(airSpeed, ia!.LXAxis * airMult);
    if (prevIa !== undefined && ShouldFastFall(ia.LYAxis, prevIa.LYAxis)) {
      p.Flags.FastFallOn();
    }
  },
  OnExit(p: Player, w: World) {
    const attackComp = p.Attacks;
    attackComp.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
};

export const FAerialAttack: FSMState = {
  StateName: 'FAir',
  StateId: STATE_IDS.F_AIR_S,
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.F_AIR_GE);
    p.ECB.SetECBShape(STATE_IDS.F_AIR_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID)!;
    const prevIa = w.GetPlayerPreviousInput(p.ID);
    const speedsComp = p.Speeds;
    p.Velocity.AddClampedXImpulse(
      speedsComp.AerialSpeedInpulseLimit,
      ia.LXAxis * speedsComp.ArielVelocityMultiplier
    );
    if (prevIa !== undefined && ShouldFastFall(ia.LYAxis, prevIa.LYAxis)) {
      p.Flags.FastFallOn();
    }
  },
  OnExit: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    attackComp.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
};

export const UAirAttack: FSMState = {
  StateName: 'UAir',
  StateId: STATE_IDS.U_AIR_S,
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.U_AIR_GE);
    p.ECB.SetECBShape(STATE_IDS.U_AIR_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID)!;
    const prevIa = w.GetPlayerPreviousInput(p.ID);
    const speedsComp = p.Speeds;
    p.Velocity.AddClampedXImpulse(
      speedsComp.AerialSpeedInpulseLimit,
      ia.LXAxis * speedsComp.ArielVelocityMultiplier
    );
    if (prevIa !== undefined && ShouldFastFall(ia.LYAxis, prevIa.LYAxis)) {
      p.Flags.FastFallOn();
    }
  },
  OnExit: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    attackComp.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
};

export const BAirAttack: FSMState = {
  StateName: 'BAir',
  StateId: STATE_IDS.B_AIR_S,
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.B_AIR_GE);
    p.ECB.SetECBShape(STATE_IDS.B_AIR_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID)!;
    const prevIa = w.GetPlayerPreviousInput(p.ID);
    const speedsComp = p.Speeds;
    p.Velocity.AddClampedXImpulse(
      speedsComp.AerialSpeedInpulseLimit,
      ia.LXAxis * speedsComp.ArielVelocityMultiplier
    );
    if (prevIa !== undefined && ShouldFastFall(ia.LYAxis, prevIa.LYAxis)) {
      p.Flags.FastFallOn();
    }
  },
  OnExit: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    attackComp.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
};

export const DAirAttack: FSMState = {
  StateName: 'DAir',
  StateId: STATE_IDS.D_AIR_S,
  OnEnter: (p: Player, w: World) => {
    p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.D_AIR_GE);
    p.ECB.SetECBShape(STATE_IDS.D_AIR_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID)!;
    const prevIa = w.GetPlayerPreviousInput(p.ID);
    const speedsComp = p.Speeds;
    p.Velocity.AddClampedXImpulse(
      speedsComp.AerialSpeedInpulseLimit,
      ia.LXAxis * speedsComp.ArielVelocityMultiplier
    );
    if (prevIa !== undefined && ShouldFastFall(ia.LYAxis, prevIa.LYAxis)) {
      p.Flags.FastFallOn();
    }
  },
  OnExit: (p: Player, w: World) => {
    p.Attacks.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
};

export const SideSpecial: FSMState = {
  StateName: 'SideSpecial',
  StateId: STATE_IDS.SIDE_SPCL_S,
  OnEnter: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID)!;
    const lxAxis = ia.LXAxis;

    if (lxAxis < 0) {
      p.Flags.FaceLeft();
    }
    if (lxAxis >= 0) {
      p.Flags.FaceRight();
    }

    p.Flags.SetCanWalkOffTrue();
    const attackComp = p.Attacks;
    attackComp.SetCurrentAttack(GAME_EVENT_IDS.SIDE_SPCL_GE);
    const atk = attackComp.GetAttack()!;
    atk.OnEnter(w, p);
  },
  OnUpdate: (p: Player, w: World) => {
    const attack = p.Attacks.GetAttack()!;
    const currentStateFrame = p.FSMInfo.CurrentStateFrame;
    const impulse = attack.GetActiveImpulseForFrame(currentStateFrame);

    if (impulse !== undefined) {
      addAttackImpulseToPlayer(p, impulse, attack);
    }
    attack.OnUpdate(w, p, currentStateFrame);
  },
  OnExit: (p: Player, w: World) => {
    const atkComp = p.Attacks;
    const atk = atkComp.GetAttack()!;
    atk.OnExit(w, p);
    atkComp.ZeroCurrentAttack();
  },
};

export const SideSpecialExtension: FSMState = {
  StateName: 'SideSpecialExtension',
  StateId: STATE_IDS.SIDE_SPCL_EX_S,
  OnEnter: (p: Player, w: World) => {
    const atkComp = p.Attacks;
    atkComp.SetCurrentAttack(GAME_EVENT_IDS.SIDE_SPCL_EX_GE);
    atkComp.GetAttack()!.OnEnter(w, p);
  },
  OnUpdate: (p, world) => {
    const attackComp = p.Attacks;
    const attack = attackComp.GetAttack()!;

    attack.OnUpdate(world, p, world.localFrame);
  },
  OnExit: (p: Player, w: World) => {
    const atkComp = p.Attacks;
    atkComp.GetAttack()!.OnExit(w, p);
    atkComp.ZeroCurrentAttack();
  },
};

export const DownSpecial: FSMState = {
  StateName: 'DownSpecial',
  StateId: STATE_IDS.DOWN_SPCL_S,
  OnEnter: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    attackComp.SetCurrentAttack(GAME_EVENT_IDS.DOWN_SPCL_GE);
    const gravity = attackComp.GetAttack()!.GravityActive;
    if (gravity === false) {
      p.Flags.GravityOff();
    }
    p.ECB.SetECBShape(STATE_IDS.DOWN_SPCL_S);
  },
  OnUpdate: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    const attack = attackComp.GetAttack()!;
    const impulse = attack?.GetActiveImpulseForFrame(
      p.FSMInfo.CurrentStateFrame
    );

    if (impulse === undefined) {
      return;
    }

    addAttackImpulseToPlayer(p, impulse, attack);
  },
  OnExit: (p: Player, w: World) => {
    const attackComp = p.Attacks;
    p.Flags.GravityOn();
    attackComp.ZeroCurrentAttack();
    p.ECB.ResetECBShape();
  },
};

export const HitStop: FSMState = {
  StateName: 'HitStop',
  StateId: STATE_IDS.HIT_STOP_S,
  OnEnter: (p: Player, world: World) => {
    p.Flags.FastFallOff();
    p.Flags.GravityOff();
    p.Velocity.X = 0;
    p.Velocity.Y = 0;
  },
  OnUpdate: (p: Player, world: World) => {
    p.HitStop.Decrement();
  },
  OnExit: (p: Player, world: World) => {
    p.Flags.GravityOn();
    p.HitStop.SetZero();
  },
};

export const Launch: FSMState = {
  StateName: 'Launch',
  StateId: STATE_IDS.LAUNCH_S,
  OnEnter: (p: Player, w: World) => {
    const pVel = p.Velocity;
    const hitStun = p.HitStun;
    pVel.X = hitStun.VX;
    pVel.Y = hitStun.VY;
    if (p.Jump.OnFirstJump()) {
      p.Jump.IncrementJumps();
    }
  },
  OnUpdate: (p: Player, w: World) => {
    p.HitStun.DecrementHitStun();
  },
  OnExit: (p, w) => {
    p.HitStun.Zero();
  },
};

export const Tumble: FSMState = {
  StateName: 'Tumble',
  StateId: STATE_IDS.TUMBLE_S,
  OnEnter: (p: Player, w: World) => {
    p.Jump.ResetJumps();
    p.Jump.IncrementJumps();
  },
  OnUpdate: (p: Player, w: World) => {
    const ia = w.GetPlayerCurrentInput(p.ID);
    const speeds = p.Speeds;
    const airSpeed = speeds.AerialSpeedInpulseLimit;
    const airMult = speeds.ArielVelocityMultiplier;
    p.Velocity.AddClampedXImpulse(airSpeed, (ia!.LXAxis * airMult) / 2);
  },
  OnExit: (p: Player, w: World) => {},
};

export const Crouch: FSMState = {
  StateName: 'Crouch',
  StateId: STATE_IDS.CROUCH_S,
  OnEnter: (p: Player, w: World) => {
    p.ECB.SetECBShape(STATE_IDS.CROUCH_S);
    p.Flags.SetCanWalkOffFalse();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.ECB.ResetECBShape();
    p.Flags.SetCanWalkOffTrue();
  },
};

/**
 * TODO
 * neutralSpecial
 * neutralSpecial EX
 * upSpecial
 * upSpecial EX
 * downCharge
 * upcharge
 * grab
 * runGrab
 * shield
 * shieldBreak
 * dodgeRoll
 * tech
 * wallSlide
 * wallKick
 * held (when grabbed)
 * pummel
 * dirtNap
 * groundRecover
 * ledgeRecover
 * flinch
 * clang
 * platDrop
 */

//==================== Utils =====================

function ShouldFastFall(curLYAxsis: number, prevLYAxsis: number): boolean {
  return curLYAxsis < -0.8 && prevLYAxsis > -0.8;
}

function inputMacthesTargetNotRepeating(
  targetGeId: GameEventId,
  ia: InputAction,
  prevIa: InputAction | undefined
) {
  if (ia.Action !== targetGeId) {
    return false;
  }

  if (prevIa === undefined) {
    return true;
  }

  if (ia.Action === prevIa.Action) {
    return false;
  }

  return true;
}

function addAttackImpulseToPlayer(p: Player, impulse: FlatVec, attack: Attack) {
  const x = p.Flags.IsFacingRight ? impulse.X : -impulse.X;
  const y = impulse.Y;
  const clamp = attack?.ImpulseClamp;
  const pVel = p.Velocity;
  if (clamp !== undefined) {
    pVel.AddClampedXImpulse(clamp, x);
    pVel.AddClampedYImpulse(clamp, y);
  }
}

//================================================

const IDLE_STATE_RELATIONS = InitIdleRelations();
const TURN_RELATIONS = InitTurnRelations();
const WALK_RELATIONS = InitWalkRelations();
const DASH_RELATIONS = InitDashRelations();
const DASH_TURN_RELATIONS = InitDashTurnRelations();
const RUN_RELATIONS = InitRunRelations();
const RUN_TURN_RELATIONS = InitRunTurnRelations();
const STOP_RUN_RELATIONS = InitStopRunRelations();
const JUMP_SQUAT_RELATIONS = InitJumpSquatRelations();
const JUMP_RELATIONS = InitJumpRelations();
const NFALL_RELATIONS = InitNeutralFallRelations();
const LAND_RELATIONS = InitLandRelations();
const SOFT_LAND_RELATIONS = InitSoftLandRelations();
const LEDGE_GRAB_RELATIONS = InitLedgeGrabRelations();
const AIR_DODGE_RELATIONS = InitAirDodgeRelations();
const HELPESS_RELATIONS = InitHelpessRelations();
const ATTACK_RELATIONS = InitAttackRelations();
const SIDE_CHARGE_RELATIONS = InitSideChargeRelations();
const SIDE_CHARGE_EX_RELATIONS = InitSideChargeExRelations();
const DOWN_TILT_RELATIONS = InitDownTiltRelations();
const UP_TILT_RELATIONS = InitUpTiltRelations();
const SIDE_TILT_RELATIONS = InitSideTiltRelations();
const DASH_ATK_RELATIONS = InitDashAttackRelations();
const AIR_ATK_RELATIONS = InitAirAttackRelations();
const F_AIR_ATK_RELATIONS = InitFAirAttackRelations();
const U_AIR_ATK_RELATIONS = InitUAirRelations();
const B_AIR_ATK_RELATIONS = InitBAirRelations();
const D_AIR_ATK_RELATIONS = InitDAirRelations();
const SIDE_SPECIAL_RELATIONS = InitSideSpecialRelations();
const SIDE_SPECIAL_EX_RELATIONS = InitSideSpecialExtensionRelations();
const DOWN_SPECIAL_RELATIONS = InitDownSpecialRelations();
const HIT_STOP_RELATIONS = InitHitStopRelations();
const TUMBLE_RELATIONS = InitTumbleRelations();
const LAUNCH_RELATIONS = InitLaunchRelations();
const CROUCH_RELATIONS = InitCrouchRelations();

export const ActionMappings = new Map<StateId, ActionStateMappings>()
  .set(IDLE_STATE_RELATIONS.stateId, IDLE_STATE_RELATIONS.mappings)
  .set(TURN_RELATIONS.stateId, TURN_RELATIONS.mappings)
  .set(WALK_RELATIONS.stateId, WALK_RELATIONS.mappings)
  .set(DASH_RELATIONS.stateId, DASH_RELATIONS.mappings)
  .set(DASH_TURN_RELATIONS.stateId, DASH_TURN_RELATIONS.mappings)
  .set(RUN_RELATIONS.stateId, RUN_RELATIONS.mappings)
  .set(RUN_TURN_RELATIONS.stateId, RUN_TURN_RELATIONS.mappings)
  .set(STOP_RUN_RELATIONS.stateId, STOP_RUN_RELATIONS.mappings)
  .set(JUMP_SQUAT_RELATIONS.stateId, JUMP_SQUAT_RELATIONS.mappings)
  .set(JUMP_RELATIONS.stateId, JUMP_RELATIONS.mappings)
  .set(NFALL_RELATIONS.stateId, NFALL_RELATIONS.mappings)
  .set(LAND_RELATIONS.stateId, LAND_RELATIONS.mappings)
  .set(SOFT_LAND_RELATIONS.stateId, SOFT_LAND_RELATIONS.mappings)
  .set(LEDGE_GRAB_RELATIONS.stateId, LEDGE_GRAB_RELATIONS.mappings)
  .set(AIR_DODGE_RELATIONS.stateId, AIR_DODGE_RELATIONS.mappings)
  .set(HELPESS_RELATIONS.stateId, HELPESS_RELATIONS.mappings)
  .set(ATTACK_RELATIONS.stateId, ATTACK_RELATIONS.mappings)
  .set(SIDE_CHARGE_RELATIONS.stateId, SIDE_CHARGE_RELATIONS.mappings)
  .set(SIDE_CHARGE_EX_RELATIONS.stateId, SIDE_CHARGE_EX_RELATIONS.mappings)
  .set(DOWN_TILT_RELATIONS.stateId, DOWN_TILT_RELATIONS.mappings)
  .set(UP_TILT_RELATIONS.stateId, UP_TILT_RELATIONS.mappings)
  .set(SIDE_TILT_RELATIONS.stateId, SIDE_TILT_RELATIONS.mappings)
  .set(DASH_ATK_RELATIONS.stateId, DASH_ATK_RELATIONS.mappings)
  .set(AIR_ATK_RELATIONS.stateId, AIR_ATK_RELATIONS.mappings)
  .set(F_AIR_ATK_RELATIONS.stateId, F_AIR_ATK_RELATIONS.mappings)
  .set(U_AIR_ATK_RELATIONS.stateId, U_AIR_ATK_RELATIONS.mappings)
  .set(B_AIR_ATK_RELATIONS.stateId, B_AIR_ATK_RELATIONS.mappings)
  .set(D_AIR_ATK_RELATIONS.stateId, D_AIR_ATK_RELATIONS.mappings)
  .set(DOWN_SPECIAL_RELATIONS.stateId, DOWN_SPECIAL_RELATIONS.mappings)
  .set(SIDE_SPECIAL_RELATIONS.stateId, SIDE_SPECIAL_RELATIONS.mappings)
  .set(SIDE_SPECIAL_EX_RELATIONS.stateId, SIDE_SPECIAL_EX_RELATIONS.mappings)
  .set(HIT_STOP_RELATIONS.stateId, HIT_STOP_RELATIONS.mappings)
  .set(TUMBLE_RELATIONS.stateId, TUMBLE_RELATIONS.mappings)
  .set(LAUNCH_RELATIONS.stateId, LAUNCH_RELATIONS.mappings)
  .set(CROUCH_RELATIONS.stateId, CROUCH_RELATIONS.mappings);

export const FSMStates = new Map<StateId, FSMState>()
  .set(Idle.StateId, Idle)
  .set(Turn.StateId, Turn)
  .set(Walk.StateId, Walk)
  .set(Run.StateId, Run)
  .set(RunTurn.StateId, RunTurn)
  .set(RunStop.StateId, RunStop)
  .set(Dash.StateId, Dash)
  .set(DashTurn.StateId, DashTurn)
  .set(JumpSquat.StateId, JumpSquat)
  .set(Jump.StateId, Jump)
  .set(NeutralFall.StateId, NeutralFall)
  .set(Land.StateId, Land)
  .set(SoftLand.StateId, SoftLand)
  .set(LedgeGrab.StateId, LedgeGrab)
  .set(AirDodge.StateId, AirDodge)
  .set(Helpess.StateId, Helpess)
  .set(NAttack.StateId, NAttack)
  .set(SideCharge.StateId, SideCharge)
  .set(SideChargeEx.StateId, SideChargeEx)
  .set(SideTilt.StateId, SideTilt)
  .set(DashAttack.StateId, DashAttack)
  .set(NAerialAttack.StateId, NAerialAttack)
  .set(FAerialAttack.StateId, FAerialAttack)
  .set(UAirAttack.StateId, UAirAttack)
  .set(BAirAttack.StateId, BAirAttack)
  .set(DAirAttack.StateId, DAirAttack)
  .set(SideSpecial.StateId, SideSpecial)
  .set(SideSpecialExtension.StateId, SideSpecialExtension)
  .set(DownSpecial.StateId, DownSpecial)
  .set(HitStop.StateId, HitStop)
  .set(Tumble.StateId, Tumble)
  .set(Launch.StateId, Launch)
  .set(Crouch.StateId, Crouch)
  .set(DownTilt.StateId, DownTilt)
  .set(UpTilt.StateId, UpTilt);

export const AttackGameEventMappings = new Map<GameEventId, AttackId>()
  .set(GAME_EVENT_IDS.ATTACK_GE, ATTACK_IDS.N_GRND_ATK)
  .set(GAME_EVENT_IDS.SIDE_CHARGE_GE, ATTACK_IDS.S_CHARGE_ATK)
  .set(GAME_EVENT_IDS.SIDE_CHARGE_EX_GE, ATTACK_IDS.S_CHARGE_EX_ATK)
  .set(GAME_EVENT_IDS.DASH_ATTACK_GE, ATTACK_IDS.DASH_ATK)
  .set(GAME_EVENT_IDS.D_TILT_GE, ATTACK_IDS.D_TILT_ATK)
  .set(GAME_EVENT_IDS.S_TILT_GE, ATTACK_IDS.S_TILT_ATK)
  .set(GAME_EVENT_IDS.S_TILT_U_GE, ATTACK_IDS.S_TILT_U_ATK)
  .set(GAME_EVENT_IDS.S_TILT_D_GE, ATTACK_IDS.S_TITL_D_ATK)
  .set(GAME_EVENT_IDS.U_TILT_GE, ATTACK_IDS.U_TILT_ATK)
  .set(GAME_EVENT_IDS.N_AIR_GE, ATTACK_IDS.N_AIR_ATK)
  .set(GAME_EVENT_IDS.F_AIR_GE, ATTACK_IDS.F_AIR_ATK)
  .set(GAME_EVENT_IDS.U_AIR_GE, ATTACK_IDS.U_AIR_ATK)
  .set(GAME_EVENT_IDS.B_AIR_GE, ATTACK_IDS.B_AIR_ATK)
  .set(GAME_EVENT_IDS.D_AIR_GE, ATTACK_IDS.D_AIR_ATK)
  .set(GAME_EVENT_IDS.SIDE_SPCL_GE, ATTACK_IDS.S_SPCL_ATK)
  .set(GAME_EVENT_IDS.SIDE_SPCL_EX_GE, ATTACK_IDS.S_SPCL_EX_ATK)
  .set(GAME_EVENT_IDS.DOWN_SPCL_GE, ATTACK_IDS.D_SPCL_ATK);
