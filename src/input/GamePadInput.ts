import { Player } from '../Game/Player/Player';
import { StateMachine } from '../Game/State/StateMachine';

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

  Clear() {
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
  }
}

export type InputActionPacket<T> = {
  input: T;
  frame: number;
  frameAdvantage: number;
  hash: string;
};
export type InputAction = {
  Action: string;
  LXAxsis: number;
  LYAxsis: number;
  RXAxis: number;
  RYAxsis: number;
};

export function NewInputAction() {
  return {
    Action: '',
    LXAxsis: 0,
    LYAxsis: 0,
    RXAxis: 0,
    RYAxsis: 0,
  } as InputAction;
}

const defaultInputFactory = (frameAdvantage: number, frame: number) => {
  let def = {
    input: {
      Action: 'idle',
      LXAxsis: 0,
      LYAxsis: 0,
      RYAxsis: 0,
      RXAxis: 0,
    },
    frame,
    frameAdvantage,
  } as InputActionPacket<InputAction>;
};

const currentInput = new GamePadInput();

export function listenForGamePadInput() {
  setInterval(() => pollInput(), 4);
}

function pollInput() {
  const gp = navigator.getGamepads()[0];
  if (gp && gp.connected) {
    readInput(gp);
  }
}

export function GetInput() {
  let input = transcribeInput(currentInput);
  return input;
}

function readInput(gamePad: Gamepad) {
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
}

function transcribeInput(input: GamePadInput) {
  // Button priority is as follows: special > attack > right stick > grab > guard > jump
  const LXAxis = input.LXAxis;
  const LYAxis = input.LYAxis;
  const RXAxis = input.RXAxis;
  const RYAxis = input.RYAxis;
  const inputAction = NewInputAction();

  inputAction.LXAxsis = LXAxis;
  inputAction.LYAxsis = LYAxis;
  inputAction.RXAxis = RXAxis;
  inputAction.RYAxsis = RYAxis;

  // special was pressed
  if (input.special) {
    // Is it a special on the y axis?
    if (Math.abs(LYAxis) > Math.abs(LXAxis)) {
      if (LYAxis > 0) {
        inputAction.Action = Actions.upSpecial;
        return inputAction;
      }
      inputAction.Action = Actions.downSpecial;
      return inputAction;
    }
    // Is it a special on the x axis?
    if (LXAxis != 0) {
      inputAction.Action = Actions.sideSpecial;
      return inputAction;
    }

    // It is a nuetral special
    inputAction.Action = Actions.special;
    return inputAction;
  }

  // Action was pressed
  if (input.action) {
    // Y axis?
    if (Math.abs(LYAxis) > Math.abs(LXAxis)) {
      if (LYAxis > 0) {
        inputAction.Action = Actions.upAttack;
        return inputAction;
      }
      inputAction.Action = Actions.downAttack;
      return inputAction;
    }

    if (LXAxis != 0) {
      inputAction.Action = Actions.sideAttack;
      return inputAction;
    }
    inputAction.Action = Actions.attack;
    return inputAction;
  }

  // Right stick was used
  // Right stick more horizontal than vertical
  if (Math.abs(RXAxis) > Math.abs(RYAxis)) {
    inputAction.Action = Actions.sideAttack;
    return inputAction;
  }

  // Right stick was used
  // Right stick more vertical than horrizontal
  if (Math.abs(RYAxis) > Math.abs(RXAxis)) {
    if (RYAxis > 0) {
      inputAction.Action = Actions.upAttack;
      return inputAction;
    }
    inputAction.Action = Actions.downAttack;
    return inputAction;
  }

  // Grab was pressed
  if (input.rb) {
    inputAction.Action = Actions.grab;
    return inputAction;
  }

  // Guard was pressed
  if (input.rt || input.lt) {
    inputAction.Action = Actions.guard;
    return inputAction;
  }

  // Jump was pressed
  if (input.jump) {
    inputAction.Action = Actions.jump;
    return inputAction;
  }

  if (Math.abs(input.LXAxis) > 0) {
    if (Math.abs(input.LXAxis) < 0.6) {
      inputAction.Action = Actions.move;
      return inputAction;
    }
    inputAction.Action = Actions.moveFast;
    return inputAction;
  }

  // Nothing was pressed
  inputAction.Action = Actions.default;
  return inputAction;
}

function setDeadzone(v: number) {
  const DEADZONE = 0.7;

  if (Math.abs(v) < DEADZONE) {
    v = 0;
  } else {
    v = v - Math.sign(v) * DEADZONE;

    v /= 1.0 - DEADZONE;
  }

  return v;
}

function clampStick(x: number, y: number) {
  let m = Math.sqrt(x * x + y * y);

  if (m > 1) {
    x /= m;
    y /= m;
  }

  return [x, y];
}

interface IActions {
  upSpecial: string;
  downSpecial: string;
  sideSpecial: string;
  special: string;
  upAttack: string;
  downAttack: string;
  sideAttack: string;
  attack: string;
  default: string;
  move: string;
  moveFast: string;
  jump: string;
  grab: string;
  guard: string;
}

const Actions: IActions = {
  upSpecial: 'up_special',
  downSpecial: 'down_special',
  sideSpecial: 'side_special',
  special: 'special',
  upAttack: 'up_attack',
  downAttack: 'down_attack',
  sideAttack: 'side_attack',
  attack: 'attack',
  default: 'default',
  move: 'move',
  moveFast: 'moveFast',
  jump: 'jump',
  grab: 'grab',
  guard: 'guard',
};

const InvalidGuessSpec = (
  guessed: InputActionPacket<InputAction>,
  real: InputActionPacket<InputAction>
) => {
  return guessed.input.Action == real.input.Action &&
    guessed.input.LXAxsis == real.input.LXAxsis &&
    guessed.input.LYAxsis == real.input.LYAxsis &&
    guessed.input.RXAxis == real.input.RXAxis &&
    guessed.input.RYAxsis == real.input.RYAxsis
    ? false
    : true;
};

export { InvalidGuessSpec };

export function HandleInput(
  player: Player,
  input: InputAction,
  SM: StateMachine
) {
  // if (player.Grounded) {
  //   let a = handleGroundedPlayerInput(input);
  //   SM.SetState(a);
  //   return;
  // }
  //TODO: We need a transition state from idle to walk, idleToWalk, that can transisition to run.
  //This approach can solve issue where we need the player to "hold" an action, as well.
  //idle -> attackCharge -> attack attack charge can default to smash
  // Might need to name the final state something different than the input action, can't request smash on charge if smash is a valid transition for charge.
  // if (input.Action == 'default') {
  //   SM.SetState(input);
  //   return;
  // }

  // if (player.Grounded) {
  //   input.Action = 'grounded-' + input.Action;
  //   SM.SetState(input);
  // } else {
  //   input.Action = 'ariel-' + input.Action;
  //   SM.SetState(input);
  // }
  SM.SetState(input);
  return;
  // if (!player.LedgeGrab) {
  //   if (input.Action == 'run') {
  //     if (player.Grounded) {
  //       SM.SetState('walk');
  //     }
  //     if (!player.Grounded) {
  //       SM.SetState('neutralFall');
  //     }
  //   } else if (input.Action == 'jump') {
  //     //debugger;
  //     player.CurrentStateMachineState == 'jump'
  //       ? SM.SetState('jump')
  //       : player.Grounded
  //       ? SM.SetState('jumpSquat')
  //       : SM.SetState('jump');
  //   } else {
  //     if (player.Grounded) {
  //       SM.SetState('idle');
  //     } else {
  //       SM.SetState('neutralFall');
  //     }
  //   }
  // } else {
  //   if (input.Action == 'jump') {
  //     SM.SetState('jump');
  //   }
  // }
}

// function handleGroundedPlayerInput(ia: InputAction): string {
//   switch (ia.Action) {
//     case Actions.jump:
//       return Actions.jumpSquat;
//     default:
//       return ia.Action;
//   }
// }

// function HandlerArielPlayerInput(ia: InputAction) {
//   switch (ia.Action) {
//     case Actions.dash:
//       return 'neutralFall';
//     case Actions.walk:
//       return 'neutralFall';
//     default:
//       return ia.Action;
//   }
// }
