import { InputAction } from '../../../input/Input';
import { NumberToRaw } from '../../../math/fixedPoint';
import { InputStoreLocal } from '../../engine-state-management/Managers';
import { World } from '../../world/world';
import { StateId, STATE_IDS, GAME_EVENT_IDS, GameEventId } from './shared';

type conditionFunc = (world: World, playerIndex: number) => boolean;

export type condition = {
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

export const IdleToTurn: condition = {
  Name: 'IdleToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const flags = p.Flags;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.RawLXAxis < 0 && flags.IsFacingRight) {
      return true;
    }

    if (ia.RawLXAxis > 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.TURN_S,
};

export const IdleToDash: condition = {
  Name: 'IdleToDash',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (prevIa.Action === GAME_EVENT_IDS.MOVE_FAST_GE) {
      return false;
    }

    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.Action !== GAME_EVENT_IDS.MOVE_FAST_GE) {
      return false;
    }

    const facingRight = p.Flags.IsFacingRight;
    const lxAxis = ia.RawLXAxis;

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

export const IdleToDashTurn: condition = {
  Name: 'IdleToTurnDash',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (prevIa.Action === GAME_EVENT_IDS.MOVE_FAST_GE) {
      return false;
    }

    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.Action !== GAME_EVENT_IDS.MOVE_FAST_GE) {
      return false;
    }

    const p = w.PlayerData.Player(playerIndex)!;
    const flags = p.Flags;
    const lxAxis = ia.RawLXAxis;

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

export const shieldToShieldDrop: condition = {
  Name: 'ToShieldDrop',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.RawLTVal === 0 && ia.RawRTVal === 0) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.SHIELD_DROP_S,
};

export const WalkToDash: condition = {
  Name: 'WalkToDash',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;
    const fsmInfo = p.FSMInfo;
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (
      fsmInfo.CurrentStateFrame > 2 ||
      prevIa.Action === GAME_EVENT_IDS.MOVE_FAST_GE
    ) {
      return false;
    }

    const flags = p.Flags;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (
      flags.IsFacingRight &&
      ia.RawLXAxis > 0 &&
      ia.Action === GAME_EVENT_IDS.MOVE_FAST_GE
    ) {
      return true;
    }

    if (
      flags.IsFacingLeft &&
      ia.RawLXAxis < 0 &&
      ia.Action === GAME_EVENT_IDS.MOVE_FAST_GE
    ) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.DASH_S,
};

export const WalkToTurn: condition = {
  Name: 'WalkToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const player = w.PlayerData.Player(playerIndex)!;
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (prevIa === undefined) {
      return false;
    }

    const prevLaxRaw = prevIa.RawLXAxis;
    const curLaxRaw = ia.RawLXAxis;
    if (
      (prevLaxRaw < 0 && curLaxRaw > 0) ||
      (prevLaxRaw > 0 && curLaxRaw < 0)
    ) {
      return true;
    }

    const flags = player.Flags;
    if (
      (prevLaxRaw === 0 && flags.IsFacingRight && curLaxRaw < 0) ||
      (prevLaxRaw === 0 && flags.IsFacingLeft && curLaxRaw > 0)
    ) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.TURN_S,
};

export const RunToRunStopByGuard: condition = {
  Name: 'RunToRunStopByGuard',
  ConditionFunc: (w: World, playerIndex: number) => {
    const pd = w.PlayerData;
    const inputStore = pd.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.Action === GAME_EVENT_IDS.GUARD_GE) {
      return true;
    }
    return false;
  },
  StateId: STATE_IDS.STOP_RUN_S,
};

export const RunToTurn: condition = {
  Name: 'RunToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const player = w.PlayerData.Player(playerIndex)!;
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (prevIa === undefined) {
      return false;
    }

    const prevLaxRaw = prevIa.RawLXAxis;
    const curLaxRaw = ia.RawLXAxis;

    if (
      (prevLaxRaw < 0 && curLaxRaw > 0) ||
      (prevLaxRaw > 0 && curLaxRaw < 0)
    ) {
      return true;
    }

    const flags = player.Flags;
    if (
      (prevLaxRaw === 0 && flags.IsFacingRight && curLaxRaw < 0) ||
      (prevLaxRaw === 0 && flags.IsFacingLeft && curLaxRaw > 0)
    ) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.RUN_TURN_S,
};

export const DashToTurn: condition = {
  Name: 'DashToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const player = w.PlayerData.Player(playerIndex)!;
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (prevIa === undefined) {
      return false;
    }

    const prevLaxRaw = prevIa.RawLXAxis; // Previous left stick X-axis
    const curLaxRaw = ia.RawLXAxis; // Current left stick X-axis
    const laxDifference = curLaxRaw - prevLaxRaw; // Difference between current and previous X-axis
    const threshold = NumberToRaw(0.5); // Threshold for detecting significant variation

    const flags = player.Flags;
    const facingRight = flags.IsFacingRight;
    // Check if the variation exceeds the threshold and is in the opposite direction of the player's facing direction
    if (laxDifference < -threshold && facingRight) {
      // Player is facing right, but the stick moved significantly to the left
      if (curLaxRaw < 0) {
        return true;
      }
    }

    if (laxDifference > threshold && !facingRight) {
      // Player is facing left, but the stick moved significantly to the right
      if (curLaxRaw > 0) {
        return true;
      }
    }

    return false;
  },
  StateId: STATE_IDS.DASH_TURN_S,
};

export const ToJump: condition = {
  Name: 'ToJump',
  ConditionFunc: (w: World, playerIndex: number) => {
    const player = w.PlayerData.Player(playerIndex)!;
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);
    const jumpId = GAME_EVENT_IDS.JUMP_GE;

    if (
      inputMacthesTargetNotRepeating(jumpId, ia, prevIa) &&
      player.Jump.HasJumps()
    ) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.JUMP_S,
};

export const ToAirDodge: condition = {
  Name: 'ToAirDodge',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    return isBufferedInput(inputStore, curFrame, 3, GAME_EVENT_IDS.GUARD_GE);
  },
  StateId: STATE_IDS.AIR_DODGE_S,
};

export const DashDefaultRun: condition = {
  Name: 'DashDefaultRun',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;
    const flags = p.Flags;
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.RawLXAxis > 0 && flags.IsFacingRight) {
      return true;
    }

    if (ia.RawLXAxis < 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.RUN_S,
};

export const DashDefaultIdle: condition = {
  Name: 'DashDefaultIdle',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.RawLXAxis === 0) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.IDLE_S,
};

export const TurnDefaultWalk: condition = {
  Name: 'TurnDefaultWalk',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const p = w.PlayerData.Player(playerIndex);
    const facingRight = p?.Flags.IsFacingRight;

    if (
      (facingRight && ia!.RawLXAxis < 0) ||
      (!facingRight && ia!.RawLXAxis > 0)
    ) {
      return true;
    }
    return false;
  },
  StateId: STATE_IDS.WALK_S,
};

export const TurnToDash: condition = {
  Name: 'TurnToDash',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;
    const stateFrame = p.FSMInfo.CurrentStateFrame;

    if (stateFrame > 2) {
      return false;
    }

    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const negPointFiveRaw = NumberToRaw(-0.5);
    const posPointFiveRaw = NumberToRaw(0.5);
    if (
      (ia.RawLXAxis < negPointFiveRaw && p.Flags.IsFacingRight) ||
      (ia.RawLXAxis > posPointFiveRaw && p.Flags.IsFacingLeft)
    ) {
      const prevIa = inputStore.GetInputForFrame(w.PreviousFrame);
      return inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.MOVE_FAST_GE,
        ia,
        prevIa
      );
    }
    return false;
  },
  StateId: STATE_IDS.DASH_S,
};

export const ToNair: condition = {
  Name: 'ToNAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    return inputMacthesTargetNotRepeating(GAME_EVENT_IDS.ATTACK_GE, ia, prevIa);
  },
  StateId: STATE_IDS.N_AIR_S,
};

export const ToFAir: condition = {
  Name: 'ToFAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex);
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (ia.Action === prevIa.Action) {
      return false;
    }

    if (ia.Action !== GAME_EVENT_IDS.SIDE_ATTACK_GE) {
      return false;
    }

    const isFacingRight = p?.Flags.IsFacingRight;
    const IsFacingLeft = !isFacingRight;

    const isRStickXAxisActuated = Math.abs(ia.RawRXAxis) > 0;

    if (isRStickXAxisActuated === true) {
      if (isFacingRight && ia.RawRXAxis > 0) {
        return true;
      }

      if (IsFacingLeft && ia.RawRXAxis < 0) {
        return true;
      }
    }

    if (isRStickXAxisActuated === false) {
      if (isFacingRight && ia.RawLXAxis > 0) {
        return true;
      }

      if (IsFacingLeft && ia.RawLXAxis < 0) {
        return true;
      }
    }

    return false;
  },
  StateId: STATE_IDS.F_AIR_S,
};

export const ToBAir: condition = {
  Name: 'ToBAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex);
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (ia.Action === prevIa?.Action) {
      return false;
    }

    if (ia.Action === GAME_EVENT_IDS.SIDE_ATTACK_GE) {
      if (p!.Flags.IsFacingRight && (ia.RawRXAxis < 0 || ia.RawLXAxis < 0)) {
        return true;
      }

      if (p!.Flags.IsFacingLeft && (ia.RawRXAxis > 0 || ia.RawLXAxis > 0)) {
        return true;
      }
    }

    return false;
  },
  StateId: STATE_IDS.B_AIR_S,
};

export const ToUAir: condition = {
  Name: 'ToUAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.UP_ATTACK_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.U_AIR_S,
};

export const ToDAir: condition = {
  Name: 'ToDAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.DOWN_ATTACK_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.D_AIR_S,
};

export const SideTiltToWalk: condition = {
  Name: 'SideTiltToWalk',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (
      ia.Action !== GAME_EVENT_IDS.MOVE_GE ||
      ia.Action !== GAME_EVENT_IDS.MOVE_FAST_GE
    ) {
      return false;
    }

    const p = w.PlayerData.Player(playerIndex)!;
    const flags = p.Flags;

    if (ia.RawLXAxis > 0 && flags.IsFacingRight) {
      return true;
    }

    if (ia.RawLXAxis < 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.WALK_S,
};

export const LandToIdle: condition = {
  Name: 'LandToIdle',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.RawLXAxis === 0) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.IDLE_S,
};

export const LandToWalk: condition = {
  Name: 'LandToWalk',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;
    const flags = p.Flags;
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.RawLXAxis > 0 && flags.IsFacingRight) {
      return true;
    }

    if (ia.RawLXAxis < 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.WALK_S,
};

export const LandToTurn: condition = {
  Name: 'LandToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;
    const flags = p.Flags;
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.RawLXAxis < 0 && flags.IsFacingRight) {
      return true;
    }

    if (ia.RawLXAxis > 0 && flags.IsFacingLeft) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.TURN_S,
};

export const DefaultDownTiltToCrouch: condition = {
  Name: 'DefaultDownTiltToCrouch',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    if (ia.Action === GAME_EVENT_IDS.DOWN_GE) {
      return true;
    }
    return false;
  },
  StateId: STATE_IDS.CROUCH_S,
};

export const RunStopToTurn: condition = {
  Name: 'RunStopToTurn',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;
    const flags = p.Flags;

    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.RawLXAxis > 0 && flags.IsFacingLeft) {
      return true;
    }

    if (ia.RawLXAxis < 0 && flags.IsFacingRight) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.RUN_TURN_S,
};

export const IdleToAttack: condition = {
  Name: 'IdleToAttack',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);
    return inputMacthesTargetNotRepeating(GAME_EVENT_IDS.ATTACK_GE, ia, prevIa);
  },
  StateId: STATE_IDS.ATTACK_S,
};

export const ToSideCharge: condition = {
  Name: 'ToSideCharge',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (
      inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.SIDE_ATTACK_GE,
        ia,
        prevIa
      ) === false
    ) {
      return false;
    }

    const rxAbsRaw = Math.abs(ia.RawRXAxis);
    if (rxAbsRaw > 0 && rxAbsRaw > Math.abs(ia.RawRYAxis)) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.SIDE_CHARGE_S,
};

export const IdleToUpTilt: condition = {
  Name: 'IdleToUpTilt',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);
    if (
      inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.UP_ATTACK_GE,
        ia,
        prevIa
      ) === false
    ) {
      return false;
    }

    if (ia.RawRYAxis > 0) {
      return false;
    }

    return true;
  },
  StateId: STATE_IDS.UP_TILT_S,
};

export const ToUpCharge: condition = {
  Name: 'ToUpCharge',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (
      inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.UP_ATTACK_GE,
        ia,
        prevIa
      ) === false
    ) {
      return false;
    }

    if (Math.abs(ia.RawRYAxis) > Math.abs(ia.RawRXAxis) === false) {
      return false;
    }

    return true;
  },
  StateId: STATE_IDS.UP_CHARGE_S,
};

export const ToDownCharge: condition = {
  Name: 'ToDownCharge',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    if (
      inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.DOWN_ATTACK_GE,
        ia,
        prevIa
      ) === false
    ) {
      return false;
    }

    if (ia.RawRYAxis >= 0) {
      return false;
    }

    if (Math.abs(ia.RawRYAxis) > Math.abs(ia.RawRXAxis) === false) {
      return false;
    }

    return true;
  },
  StateId: STATE_IDS.DOWN_CHARGE_S,
};

export const RunToDashAttack: condition = {
  Name: 'ToDashAttack',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    if (ia.Action === GAME_EVENT_IDS.SIDE_ATTACK_GE) {
      if (Math.abs(ia.RawRXAxis) > 0) {
        return false;
      }
      const facingRight = p.Flags.IsFacingRight;
      if (
        (ia.RawLXAxis > 0 && facingRight) ||
        (ia.RawLXAxis < 0 && facingRight === false)
      ) {
        return true;
      }
    }
    return false;
  },
  StateId: STATE_IDS.DASH_ATTACK_S,
};

export const ToSideTilt: condition = {
  Name: 'ToSideTilt',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex);
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    if (ia.Action !== GAME_EVENT_IDS.SIDE_ATTACK_GE) {
      return false;
    }

    if (Math.abs(ia.RawRXAxis) > 0) {
      return false;
    }
    const facingRight = p.Flags.IsFacingRight;
    if (
      (ia.RawLXAxis > 0 && facingRight) ||
      (ia.RawLXAxis < 0 && !facingRight)
    ) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.SIDE_TILT_S,
};

export const ToNSpecial: condition = {
  Name: 'ToNSpecial',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);
    return inputMacthesTargetNotRepeating(GAME_EVENT_IDS.SPCL_GE, ia, prevIa);
  },
  StateId: STATE_IDS.SPCL_S,
};

export const ToSideSpecial: condition = {
  Name: 'ToSideSpecial',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);
    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.SIDE_SPCL_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.SIDE_SPCL_S,
};

export const ToSideSpecialAir: condition = {
  Name: 'ToSideSpecialAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);
    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.SIDE_SPCL_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.SIDE_SPCL_AIR_S,
};

export const ToDownSpecial: condition = {
  Name: 'ToDownSpecial',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.DOWN_SPCL_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.DOWN_SPCL_S,
};

export const ToDownSpecialAir: condition = {
  Name: 'ToDownSpecialAir',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);
    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.DOWN_SPCL_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.DOWN_SPCL_AIR_S,
};

export const ToUpSpecial: condition = {
  Name: 'ToUpSpecial',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);
    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.UP_SPCL_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.UP_SPCL_S,
};

export const ToDownTilt: condition = {
  Name: 'ToDownTilt',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const prevFrame = w.PreviousFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const prevIa = inputStore.GetInputForFrame(prevFrame);

    return inputMacthesTargetNotRepeating(
      GAME_EVENT_IDS.DOWN_ATTACK_GE,
      ia,
      prevIa
    );
  },
  StateId: STATE_IDS.DOWN_TILT_S,
};

export const HitStopToLaunch: condition = {
  Name: 'HitStopToLaunch',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;

    if (p.HitStop.HitStopFrames > 0) {
      return false;
    }

    return true;
  },
  StateId: STATE_IDS.LAUNCH_S,
};

export const LaunchToTumble: condition = {
  Name: 'LaunchToHitStun',
  ConditionFunc: (w: World, playerIndex: number) => {
    const p = w.PlayerData.Player(playerIndex)!;

    if (p.HitStun.FramesOfHitStun > 0) {
      return false;
    }

    return true;
  },
  StateId: STATE_IDS.TUMBLE_S,
};

export const SideChargeToEx: condition = {
  Name: 'SideChargeToEx',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.Action === GAME_EVENT_IDS.IDLE_GE) {
      return true;
    }

    const p = w.PlayerData.Player(playerIndex);
    const flags = p.Flags;

    if (flags.IsFacingRight && ia.RawRXAxis <= 0) {
      return true;
    }

    if (flags.IsFacingLeft && ia.RawRXAxis >= 0) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.SIDE_CHARGE_EX_S,
};

export const UpChargeToEx: condition = {
  Name: 'UpChargeToEx',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    if (ia.Action === GAME_EVENT_IDS.IDLE_GE) {
      return true;
    }

    // This handles releasing the analog stick from the 'up' position
    if (ia.RawRYAxis <= NumberToRaw(0.1)) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.UP_CHARGE_EX_S,
};

export const DownChargeToEx: condition = {
  Name: 'DownChargeToEx',
  ConditionFunc: (w: World, playerIndex: number) => {
    const inputStore = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = inputStore.GetInputForFrame(curFrame);

    // Release C-stick
    if (ia.Action === GAME_EVENT_IDS.IDLE_GE) {
      return true;
    }

    // Release analog stick from down position
    if (ia.RawRYAxis >= NumberToRaw(-0.1)) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.DOWN_CHARGE_EX_S,
};

export const ToSpotDodge: condition = {
  Name: 'ToSpotDodge',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ips = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = ips.GetInputForFrame(curFrame);
    const prevIa = ips.GetInputForFrame(w.PreviousFrame);

    if (ia.Action === GAME_EVENT_IDS.GUARD_GE) {
      const lyAxisDiff = prevIa.RawLYAxis - ia.RawLYAxis;
      if (
        ia.RawLYAxis < 0 &&
        ia.RawLYAxis < prevIa.RawLYAxis &&
        lyAxisDiff >= NumberToRaw(0.25)
      ) {
        return true;
      }
    }

    return false;
  },
  StateId: STATE_IDS.SPOT_DODGE_S,
};

export const ToRollDodge: condition = {
  Name: 'ToRollDodge',
  ConditionFunc: (w: World, playerIndex: number) => {
    const ips = w.PlayerData.InputStore(playerIndex);
    const curFrame = w.localFrame;
    const ia = ips.GetInputForFrame(curFrame);

    if (ia.Action !== GAME_EVENT_IDS.GUARD_GE) {
      return false;
    }

    const prevIa = ips.GetInputForFrame(w.PreviousFrame);
    const lxAxisDiffRaw = prevIa.RawLXAxis - ia.RawLXAxis;

    if (
      ia.RawLXAxis > 0 &&
      ia.RawLXAxis > prevIa.RawLXAxis &&
      lxAxisDiffRaw <= NumberToRaw(-0.25)
    ) {
      return true;
    }

    if (
      ia.RawLXAxis < 0 &&
      ia.RawLXAxis < prevIa.RawLXAxis &&
      lxAxisDiffRaw >= NumberToRaw(0.25)
    ) {
      return true;
    }

    return false;
  },
  StateId: STATE_IDS.ROLL_DODGE_S,
};

export const defaultWalk: condition = {
  Name: 'Walk',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.WALK_S,
};

export const defaultRun: condition = {
  Name: 'Run',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.RUN_S,
};

export const defaultIdle: condition = {
  Name: 'Idle',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.IDLE_S,
};

export const defaultDash: condition = {
  Name: 'Dash',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.DASH_S,
};

export const defaultJump: condition = {
  Name: 'Jump',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.JUMP_S,
};

export const defaultShield: condition = {
  Name: 'Shield',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.SHIELD_S,
};

export const defaultNFall: condition = {
  Name: 'NFall',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.N_FALL_S,
};

export const defaultHelpess: condition = {
  Name: 'Helpless',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.HELPLESS_S,
};

export const defaultSideChargeEx: condition = {
  Name: 'DefaultSideChargeEx',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.SIDE_CHARGE_EX_S,
};

export const defaultUpChargeEx: condition = {
  Name: 'DefaultUpChargeToEx',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.UP_CHARGE_EX_S,
};

export const defaultDownChargeEx: condition = {
  Name: 'DefaultDownChargeEx',
  ConditionFunc: (w: World, playerIndex: number) => {
    return true;
  },
  StateId: STATE_IDS.DOWN_CHARGE_EX_S,
};

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

function isBufferedInput(
  inputStore: InputStoreLocal<InputAction>,
  currentFrame: number,
  bufferFrames: number,
  targetGameEvent: GameEventId
): boolean {
  for (let i = 0; i < bufferFrames; i++) {
    const ia = inputStore.GetInputForFrame(currentFrame - i);
    if (!ia) continue;
    if (ia.Action === targetGameEvent) {
      // Check if the input was held for more than the buffer window
      const prevIa = inputStore.GetInputForFrame(currentFrame - i - 1);
      if (prevIa.Action !== targetGameEvent) {
        return true;
      }
    }
  }
  return false;
}
