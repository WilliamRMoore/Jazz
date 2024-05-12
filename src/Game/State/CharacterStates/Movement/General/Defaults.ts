import { AddClampedXImpulseToPlayer, Player } from '../../../../Player/Player';
import IState from '../../../State';

const idle = {
  name: 'idle',
  onEnter: (player, ia) => {
    console.log('Entering idle');
  },
  onUpdate: (stateFrame, p, ia) => {},
  onExit: (p) => {
    console.log('Exiting idle');
  },
} as IState;

const neutralFall = {
  name: 'neutralFall',
  tranisitions: new Map<string, IState>(),
  onEnter: (p, ia) => {
    console.log('Entering Neutral fall');
  },
  onUpdate: (sf, p, ia) => {
    AddClampedXImpulseToPlayer(p, p.AirSpeedInpulseLimit, ia!.LXAxsis * 5);
  },
  onExit: (p) => {
    console.log('Exiting neutral fall');
  },
} as IState;

const impactLand = {
  name: 'impactLand',
  stateDefaultTransition: idle,
  tranisitions: new Map<string, IState>(),
  frameCount: 3,
  onEnter: (p, ia) => {
    console.log('Entering impactland');
  },
  onUpdate: (sf, p, ia) => {},
  onExit: (p) => {
    console.log('Exiting impactLand');
  },
} as IState;

const walk = {
  name: 'walk',
  tranisitions: new Map<string, IState>(),
  onEnter: (p, ia) => {},
  onUpdate: (sf, p, ia) => {},
  onExit: (p) => {},
} as IState;

const startWalk = {
  name: 'move',
  frameCount: 20,
  tranisitions: new Map<string, IState>(),
  onEnter: (p, ia) => {
    console.log('Entering startwalk');
  },
  onUpdate: (sf, p, ia) => {
    if (ia!.LXAxsis > 0) {
      p.FacingRight = true;
    }
    if (ia!.LXAxsis < 0) {
      p.FacingRight = false;
    }
    AddClampedXImpulseToPlayer(p, p.MaxWalkSpeed, ia!.LXAxsis * 2);
  },
  onExit: (p) => {
    console.log('Existing startWalk');
  },
} as IState;

startWalk.tranisitions?.set('walk', walk);
walk.tranisitions?.set('idle', idle);
neutralFall.tranisitions?.set('impactLand', impactLand);
idle.tranisitions?.set(startWalk.name, startWalk);

export { idle, startWalk, walk, neutralFall, impactLand };
