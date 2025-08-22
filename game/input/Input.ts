import {
  GAME_EVENT_IDS,
  GameEventId,
} from '../engine/player/finite-state-machine/PlayerStates';
import { World } from '../engine/world/world';

export type InputAction = {
  Action: GameEventId;
  LXAxis: number;
  LYAxis: number;
  RXAxis: number;
  RYAxis: number;
  Start: boolean;
  Select: boolean;
};

export class GamePadInput {
  LXAxis: number = 0;
  LYAxis: number = 0;
  RXAxis: number = 0;
  RYAxis: number = 0;

  action: boolean = false;
  special: boolean = false;
  jump: boolean = false;
  lb: boolean = false;
  rb: boolean = false;
  lt: boolean = false;
  rt: boolean = false;

  dpUp: boolean = false;
  dpDown: boolean = false;
  dpRight: boolean = false;
  dpLeft: boolean = false;

  start: boolean = false;
  select: boolean = false;

  Clear(): void {
    this.LXAxis = 0;
    this.LYAxis = 0;
    this.RXAxis = 0;
    this.RYAxis = 0;

    this.action = false;
    this.special = false;
    this.jump = false;
    this.lb = false;
    this.rb = false;
    this.lt = false;
    this.rt = false;

    this.dpUp = false;
    this.dpDown = false;
    this.dpLeft = false;
    this.dpRight = false;

    this.start = false;
    this.select = false;
  }
}

const currentInput = new GamePadInput();

function readInput(gamePad: Gamepad): void {
  currentInput.Clear();
  let lx = setDeadzone(gamePad.axes[0]);
  let ly = setDeadzone(gamePad.axes[1]);
  let rx = setDeadzone(gamePad.axes[2]);
  let ry = setDeadzone(gamePad.axes[3]);

  [lx, ly] = clampStick(lx, ly);
  [rx, ry] = clampStick(rx, ry);

  // controls are inverted, flip values.
  if (ly != 0) {
    ly *= -1;
  }

  if (ry != 0) {
    ry *= -1;
  }

  currentInput.LXAxis = lx;
  currentInput.LYAxis = ly;
  currentInput.RXAxis = rx;
  currentInput.RYAxis = ry;

  currentInput.action = gamePad.buttons[0].pressed;
  currentInput.special = gamePad.buttons[2].pressed;
  currentInput.jump = gamePad.buttons[1].pressed || gamePad.buttons[3].pressed;
  currentInput.lb = gamePad.buttons[4].pressed;
  currentInput.rb = gamePad.buttons[5].pressed;
  currentInput.lt = gamePad.buttons[6].pressed;
  currentInput.rt = gamePad.buttons[7].pressed;

  currentInput.dpUp = gamePad.buttons[12].pressed;
  currentInput.dpDown = gamePad.buttons[13].pressed;
  currentInput.dpLeft = gamePad.buttons[14].pressed;
  currentInput.dpRight = gamePad.buttons[15].pressed;

  currentInput.start = gamePad.buttons[9].pressed;
  currentInput.select = gamePad.buttons[8].pressed;
}

export function GetInput(index: number, w: World): InputAction {
  const gp = navigator.getGamepads()[index];
  if (gp && gp.connected) {
    readInput(gp);
  }
  return transcribeInput(currentInput);
}

function handleSpecial(
  inputAction: InputAction,
  LXAxis: number,
  LYAxis: number
): InputAction {
  //are we more vertical than horizontal?
  if (Math.abs(LYAxis) > Math.abs(LXAxis)) {
    if (LYAxis > 0) {
      inputAction.Action = GAME_EVENT_IDS.UP_SPCL_GE;
      return inputAction;
    }
    inputAction.Action = GAME_EVENT_IDS.DOWN_SPCL_GE;
    return inputAction;
  }
  // Is it a special on the x axis?
  if (LXAxis != 0) {
    inputAction.Action = GAME_EVENT_IDS.SIDE_SPCL_GE;
    return inputAction;
  }

  // It is a nuetral special
  inputAction.Action = GAME_EVENT_IDS.SPCL_GE;
  return inputAction;
}

function handleAction(
  inputAction: InputAction,
  LXAxis: number,
  LYAxis: number
): InputAction {
  if (Math.abs(LYAxis) > Math.abs(LXAxis)) {
    // up
    if (LYAxis > 0) {
      inputAction.Action = GAME_EVENT_IDS.UP_ATTACK_GE;
      return inputAction;
    }

    //down
    inputAction.Action = GAME_EVENT_IDS.DOWN_ATTACK_GE;
    return inputAction;
  }

  // left or right
  if (LXAxis != 0) {
    inputAction.Action = GAME_EVENT_IDS.SIDE_ATTACK_GE;
    return inputAction;
  }

  // nuetral
  inputAction.Action = GAME_EVENT_IDS.ATTACK_GE;
  return inputAction;
}

function transcribeInput(input: GamePadInput): InputAction {
  const LXAxis = input.LXAxis;
  const LYAxis = input.LYAxis;
  const RXAxis = input.RXAxis;
  const RYAxis = input.RYAxis;
  const inputAction = NewInputAction();

  inputAction.LXAxis = LXAxis;
  inputAction.LYAxis = LYAxis;
  inputAction.RXAxis = RXAxis;
  inputAction.RYAxis = RYAxis;
  inputAction.Start = input.start;
  inputAction.Select = input.select;

  // special was pressed
  if (input.special) {
    return handleSpecial(inputAction, LXAxis, LYAxis);
  }

  // Action was pressed
  if (input.action) {
    return handleAction(inputAction, LXAxis, LYAxis);
  }

  // Right stick was used
  // Right stick more horizontal than vertical
  if (Math.abs(RXAxis) > Math.abs(RYAxis)) {
    inputAction.Action = GAME_EVENT_IDS.SIDE_ATTACK_GE;
    return inputAction;
  }

  // Right stick was used
  // Right stick more vertical than horrizontal
  if (Math.abs(RYAxis) > Math.abs(RXAxis)) {
    if (RYAxis > 0) {
      inputAction.Action = GAME_EVENT_IDS.UP_ATTACK_GE;
      return inputAction;
    }
    inputAction.Action = GAME_EVENT_IDS.DOWN_ATTACK_GE;
    return inputAction;
  }

  // Grab was pressed
  if (input.rb) {
    inputAction.Action = GAME_EVENT_IDS.GRAB_GE;
    return inputAction;
  }

  // Guard was pressed
  if (input.rt || input.lt) {
    inputAction.Action = GAME_EVENT_IDS.GUARD_GE;
    return inputAction;
  }

  // Jump was pressed
  if (input.jump) {
    inputAction.Action = GAME_EVENT_IDS.JUMP_GE;
    return inputAction;
  }

  if (LYAxis > 0.7) {
    inputAction.Action = GAME_EVENT_IDS.UP_GE;
    return inputAction;
  }

  if (LYAxis < -0.5) {
    inputAction.Action = GAME_EVENT_IDS.DOWN_GE;
    return inputAction;
  }

  if (Math.abs(LXAxis) > 0) {
    inputAction.Action =
      Math.abs(LXAxis) > 0.6
        ? GAME_EVENT_IDS.MOVE_FAST_GE
        : GAME_EVENT_IDS.MOVE_GE;
    return inputAction;
  }

  // Nothing was pressed
  inputAction.Action = GAME_EVENT_IDS.IDLE_GE;
  return inputAction;
}

function setDeadzone(v: number): number {
  const DEADZONE = 0.2;

  if (Math.abs(v) < DEADZONE) {
    v = 0;
  } else {
    v = v - Math.sign(v) * DEADZONE;

    v /= 1.0 - DEADZONE;
  }

  return v;
}

const clampDto: Array<number> = [];

function clampStick(x: number, y: number): number[] {
  let m = Math.sqrt(x * x + y * y);

  if (m > 1) {
    x /= m;
    y /= m;
  }

  clampDto[0] = x;
  clampDto[1] = y;
  return clampDto;
}

export function NewInputAction() {
  return {
    Action: GAME_EVENT_IDS.IDLE_GE,
    LXAxis: 0,
    LYAxis: 0,
    RXAxis: 0,
    RYAxis: 0,
  } as InputAction;
}
