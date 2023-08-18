import { Player } from '../../Player/Player';
import { InputAction } from '../../../input/GamePadInput';
import IState from '../State';
import { VectorAllocator } from '../../../Physics/FlatVec';

export const idle = {
  name: 'idle',
  onEnter: (player) => {
    player.ECB.ChangeTrack('idle');
  },
  onUpdate: (stateFrame, player, stateMachine) => {
    player.ApplyVelocity();
    player.ApplyVelocityDecay();
    player.ApplyGravity();
    player.ECB.MoveToPosition(player.PlayerPosition.X, player.PlayerPosition.Y);
    player.ECB.Update();
  },
} as IState;

export const walk = {
  name: 'walk',
  onEnter: (player) => {
    player.ECB.ChangeTrack('walk');
  },
  onUpdate: (dt, player, stateMachine, ia) => {
    player.AddVelocity(VectorAllocator(ia!.LXAxsis, 0));
    player.ApplyVelocity();
    player.ApplyVelocityDecay();
    player.ECB.MoveToPosition(player.PlayerPosition.X, player.PlayerPosition.Y);
  },
} as IState;

export const turnWalk = {
  onEnter: (player) => {
    player.ECB.ChangeTrack('turnWalk');
  },
  onUpdate: (stateFrame, player, stateMachine) => {
    player.AddVelocity(VectorAllocator());
    player.ApplyVelocity();
    player.ApplyGravity();
    player.ECB.MoveToPosition(player.PlayerPosition.X, player.PlayerPosition.Y);
    player.ECB.Update();
  },
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
  onUpdate: (stateFrame, player, stateMachine) => {
    player.AddVelocity(VectorAllocator(13, 0));
    player.ApplyVelocity();
    player.ApplyVelocityDecay();
    player.ApplyGravity();
    player.ECB.MoveToPosition(player.PlayerPosition.X, player.PlayerPosition.Y);
    player.ECB.Update();
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
  name: 'jumpSquat',
  onEnter: (player) => {
    player.ECB.ChangeTrack('jumpSquat');
  },
  onUpdate: (stateFrame, player, stateMachine) => {
    player.ApplyVelocity();
    player.ApplyVelocityDecay();
    player.ApplyGravity();
    player.ECB.MoveToPosition(player.PlayerPosition.X, player.PlayerPosition.Y);
    player.ECB.Update();
  },
  onExit: (player) => {},
} as IState;

export const jump = {} as IState;

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

export const ledgeGrab = {} as IState;

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
