import { AddClampedXImpulseToPlayer, Player } from '../../Player/Player';
import { InputAction } from '../../../input/GamePadInput';
import IState from '../State';
import { VectorAllocator } from '../../../Physics/FlatVec';

// export const idle = {
//   name: 'grounded-idle',
//   tranisitions: ['grounded-jump', 'grounded-move', 'grounded-moveFast'],
//   onEnter: (player, ia) => {
//     console.log('Entering idle');
//   },
//   onUpdate: (stateFrame, player, stateMachine) => {},
//   onExit: (p: Player) => {},
// } as IState;

export const idle = {
  name: 'idle',
};

// export const neutralFall = {
//   name: 'neutralFall',
//   tranisitions: ['ariel-jump'],
//   onEnter: (player, ia) => {
//     console.log('entering Fall');
//   },
//   onUpdate: (stateFrame, player, ia) => {
//     // if (Math.abs(player.PlayerVelocity.X) < 18) {
//     //   player.AddVelocity(VectorAllocator(ia!.LXAxsis * 5, 0));
//     // }
//     AddClampedXImpulseToPlayer(
//       player,
//       player.AirSpeedInpulseLimit,
//       ia.LXAxsis * 5
//     );
//   },
// } as IState;

export const walk = {
  name: 'walk',
  tranisitions: ['jump', 'grounded-idle'],
  onEnter: (player, ia) => {
    console.log('Entering walk');
  },
  onUpdate: (stateFrame, player, ia) => {
    AddClampedXImpulseToPlayer(player, player.MaxWalkSpeed, ia.LXAxsis * 3);
  },
  onDefaultInput(inputAction) {
    return 'grounded-idle';
  },
} as IState;

export const startWalk = {
  name: 'grounded-move',
  frameCount: 20,
  stateDefaultTransition: 'walk',
  tranisitions: ['walk', 'grounded-moveFast', 'grounded-idle'],
  onEnter: () => {
    console.log('entering startwalk');
  },
  onUpdate: (stateFrame, player, ia) => {
    if (ia.LXAxsis > 0) {
      player.FacingRight = true;
    }
    if (ia.LXAxsis < 0) {
      player.FacingRight = false;
    }
    AddClampedXImpulseToPlayer(player, player.MaxWalkSpeed, ia.LXAxsis * 2);
  },
  onDefaultInput() {
    return 'default';
  },
} as IState;

export const turnWalk = {
  frameCount: 5,
  onEnter: (player, ia) => {
    //console.log('Entering turn walk');
  },
  onUpdate: (stateFrame, player, ia) => {},
  onExit: (player) => {
    player.FacingRight = !player.FacingRight;
  },
} as IState;

export const dash = {
  frameCount: 12,
  name: 'grounded-moveFast',
  stateDefaultTransition: 'run',
  tranisitions: ['run', 'grounded-moveFast'],
  onEnter: (player, ia) => {
    console.log('Enterdash');
    player.PlayerVelocity.X = 0;
    player.FacingRight = ia.LXAxsis > 0 ? true : false;
    if (player.FacingRight) {
      player.PlayerVelocity.X = 10;
    } else {
      player.PlayerVelocity.X = -10;
    }
  },
  onUpdate: (stateFrame, player, ia) => {
    if (stateFrame < 4) {
      AddClampedXImpulseToPlayer(
        player,
        15, //player.MaxRunSpeed + 5,
        ia.LXAxsis * 4
      );
    }
  },
  onExit: (player) => {},
  onDefaultInput: () => '',
} as IState;

export const turnDash = {} as IState;

export const run = {
  name: 'run',
  //stateDefaultTransition: 'stopRun',
  tranisitions: ['grounded-idle'],
  onEnter: (playe, ia) => {
    console.log('Entering Run');
  },
  onUpdate: (stateFrame, player, ia) => {
    AddClampedXImpulseToPlayer(player, player.MaxRunSpeed, ia.LXAxsis * 5);
  },
  onExit: (player) => {},
  onDefaultInput: (inputAction) => 'grounded-idle',
} as IState;

export const turnRun = {
  name: 'turnRun',
  frameCount: 30,
  stateDefaultTransition: 'run',
  tranisitions: ['jumpSquat'],
  onEnter: (player) => {
    console.log('Entering turnrun!');
  },
  onUpdate: (stateFrame, player, ia) => {
    if (player.FacingRight) {
      AddClampedXImpulseToPlayer(player, 0, -1);
    } else {
      AddClampedXImpulseToPlayer(player, 0, 1);
    }
  },
  onExit: (player) => {
    player.FacingRight = !player.FacingRight;
  },
} as IState;

export const stopRun = {
  name: 'stopRun',
  frameCount: 15,
  stateDefaultTransition: 'grounded-idle',
  tranisitions: ['jumpSquat'],
  onEnter: (player) => {
    console.log('Entering stopRun');
  },
  onUpdate: (frameNumber, player, ia) => {},
  onExit: (player) => {},
} as IState;

export const jumpSquat = {
  frameCount: 3,
  stateDefaultTransition: 'ground-jump',
  tranisitions: ['ground-jump'],
  name: 'grounded-jump',
  onEnter: (player) => {
    console.log('Entering jump squat');
  },
  onUpdate: (stateFrame, player, ia) => {},
  onExit: (player) => {},
} as IState;

export const groundedJump = {
  stateDefaultTransition: 'neutralFall',
  frameCount: 10,
  name: 'ground-jump',
  onEnter(player) {
    console.log('Entering groundjump');
    player.Grounded = false;
    player.PlayerVelocity.Y = 0;
    player.AddVelocity(VectorAllocator(0, -15));
  },
  onUpdate: (stateFrame, p, ia) => {},
} as IState;

export const ariealJump = {
  stateDefaultTransition: 'neutralFall',
  frameCount: 10,
  name: 'ariel-jump',
  onEnter(player) {
    console.log('Entering arieljump');
    player.Grounded = false;
    player.PlayerVelocity.Y = 0;
    player.AddVelocity(VectorAllocator(0, -15));
  },
  onUpdate: (stateFrame, p, ia) => {},
} as IState;

export const land = {} as IState;

export const softLand = {} as IState;

export const gaurd = {} as IState;

export const grab = {} as IState;

export const grabbed = {} as IState;

export const launch = {} as IState;

export const wallRide = {} as IState;

export const crouch = {} as IState;

export const hitStop = {} as IState;

export const platformFallThrough = {} as IState;

export const groundTechInPlace = {} as IState;

export const groundTechLeft = {} as IState;

export const groundTechRight = {} as IState;

export const wallTechLeft = {} as IState;

export const wallTechRight = {} as IState;

export const ledgeTitor = {} as IState;

export const ledgeGrab = {
  name: 'ledgeGrab',
  tranisitions: ['ledgeGrab', 'jump'],
  onEnter(player, ia) {
    player.LedgeGrab = true;
    player.PlayerVelocity.X = 0;
    player.PlayerVelocity.Y = 0;
    console.log('Entering ledge grab');
  },
  onUpdate(stateFrame, player, inputAction) {
    //player.PlayerVelocity.Y = 0;
  },
  onExit(player) {
    player.LedgeGrab = false;
  },
} as IState;

export const neutralAttack = {} as IState;

export const ForwardStrongAttack = {} as IState;

export const upStrongAttack = {} as IState;

export const downStrongAttack = {} as IState;

export const forwardTilt = {} as IState;

export const downTilt = {} as IState;

export const upTitlt = {} as IState;

export const special = {} as IState;

export const sideSpecial = {} as IState;

export const downSpecial = {} as IState;

export const upSpecial = {} as IState;
