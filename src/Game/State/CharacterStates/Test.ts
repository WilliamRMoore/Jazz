import { AddClampedXImpulseToPlayer, Player } from '../../Player/Player';
import { InputAction } from '../../../input/GamePadInput';
import IState from '../State';
import { VectorAllocator } from '../../../Physics/FlatVec';

export const idle = {
  name: 'idle',
  onEnter: (player) => {
    console.log('Entering idle');
  },
  onUpdate: (stateFrame, player, stateMachine) => {},
} as IState;

export const neutralFall = {
  name: 'neutralFall',
  onEnter: (player) => {
    console.log('entering Fall');
  },
  onUpdate: (stateFrame, player, ia) => {
    // if (Math.abs(player.PlayerVelocity.X) < 18) {
    //   player.AddVelocity(VectorAllocator(ia!.LXAxsis * 5, 0));
    // }
    AddClampedXImpulseToPlayer(
      player,
      player.AirSpeedInpulseLimit,
      ia.LXAxsis * 5
    );
  },
} as IState;

export const walk = {
  name: 'walk',
  onEnter: (player) => {
    console.log('Entering walk');
  },
  onUpdate: (dt, player, ia) => {
    if (ia.LXAxsis > 0) {
      player.FacingRight = true;
    }
    if (ia.LXAxsis < 0) {
      player.FacingRight = false;
    }
    AddClampedXImpulseToPlayer(player, player.MaxWalkSpeed, ia.LXAxsis * 5);
  },
} as IState;

export const turnWalk = {
  frameCount: 5,
  onEnter: (player) => {
    console.log('Entering turn walk');
  },
  onUpdate: (stateFrame, player, ia) => {},
  onExit: (player) => {
    player.FacingRight = !player.FacingRight;
  },
} as IState;

export const dash = {} as IState;

export const turnDash = {} as IState;

export const run = {
  name: 'run',
  onEnter: (player) => {
    console.log('enter run');
  },
  onUpdate: (stateFrame, player, ia) => {
    if (Math.abs(player.PlayerVelocity.X) <= player.MaxWalkSpeed) {
      player.AddVelocity(VectorAllocator(ia?.LXAxsis! * 15, 0));
    }
  },

  onExit: (p) => {
    console.log('Exiting run');
  },
} as IState;

export const turnRun = {} as IState;

export const stopRun = {} as IState;

export const jumpSquat = {
  frameCount: 3,
  stateDefaultTransition: 'jump',
  tranisitions: ['jump'],
  name: 'jumpSquat',
  onEnter: (player) => {
    console.log('Entering jump squat');
  },
  onUpdate: (stateFrame, player, ia) => {},
  onExit: (player) => {},
} as IState;

export const jump = {
  stateDefaultTransition: 'neutralFall',
  frameCount: 10,
  name: 'jump',
  onEnter(player, inputAction) {
    console.log('Entering Jump State');
    player.Grounded = false;
    player.PlayerVelocity.Y = 0;
    player.AddVelocity(VectorAllocator(inputAction.LXAxsis * 4, -15));
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
  onEnter(player, inputAction) {
    player.LedgeGrab = true;
    player.PlayerVelocity.X = 0;
    player.PlayerVelocity.Y = 0;
  },
  onUpdate(stateFrame, player, inputAction) {
    //player.PlayerVelocity.Y = 0;
  },
  onExit(player, inputAction) {
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
