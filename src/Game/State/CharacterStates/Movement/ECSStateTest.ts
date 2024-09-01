import { ECSIState } from '../../EcsStateMachine';
import { Actions } from '../../../../input/GamePadInput';

const idle = {
  Name: Actions.idle,
  OnEnter: (p, ia) => {
    console.log('Entering Idle');
  },
  OnUpdate: (p, ia, sf) => {},
  OnExit: (p) => {
    console.log('exiting idle');
  },
} as ECSIState;

const startWalk = {
  Name: Actions.move,
  FrameCount: 20,
  Transitions: new Map<string, ECSIState>(),
  OnEnter: (p, ia) => {
    console.log('Entering start Walk');
  },
  OnUpdate: (p, ia, sf) => {
    if (ia.LXAxis > 0) {
      p.FlagsComp.FaceRight();
    }

    if (ia.LXAxis < 0) {
      p.FlagsComp.FaceLeft();
    }
    p.VelComp.AddCalmpedXImpulse(p.SpeedsComp.MaxWalkSpeed, ia.LXAxis * 1.5);
  },
  OnExit: (p) => {
    console.log('Exiting StartWalk');
  },
} as ECSIState;

const walk = {
  Name: Actions.move,
  Transitions: new Map<string, ECSIState>(),
  OnEnter: (p, ia) => {
    console.log('Entrering Walk');
  },
  OnUpdate: (p, ia, sf) => {
    p.VelComp.AddCalmpedXImpulse(p.SpeedsComp.MaxWalkSpeed, ia.LXAxis * 1.5);
  },
  OnExit: (p) => {
    console.log('Exiting Walk');
  },
} as ECSIState;

const neutralFall: ECSIState = {
  Name: Actions.idle,
  Transitions: new Map<string, ECSIState>(),
  OnEnter: (p, ia) => {
    console.log('Entering Neutral fall');
  },
  OnUpdate: (p, ia, sf) => {
    p.VelComp.AddCalmpedXImpulse(
      p.SpeedsComp.AerialSpeedInpulseLimit,
      ia.LXAxis * 4
    );
  },
  OnExit: (p) => {
    console.log('exiting nautral fall');
  },
};

const land: ECSIState = {
  Name: 'impact_land',
  StateDefaultTransition: idle,
  FrameCount: 6,
  OnEnter: (p, ia) => {
    console.log('entering imapct land');
  },
  OnUpdate: (p, ia, sf) => {},
  OnExit: (p) => {
    console.log('exiting imapct land');
  },
};

const ledgeGrab: ECSIState = {
  Name: 'ledge_grab',
  OnEnter: (p, ia) => {
    p.FlagsComp.GrabLedge();
    p.VelComp.Vel.X = 0;
    p.VelComp.Vel.Y = 0;
    console.log('entered ledge grab');
  },
  OnExit: (p) => {
    p.FlagsComp.UnGrabLedge();
    console.log('Exiting ledge grab');
  },
};

startWalk.Transitions?.set(idle.Name, idle);
startWalk.StateDefaultTransition = walk;
walk.Transitions?.set(idle.Name, idle);
idle.Transitions?.set(startWalk.Name, startWalk);
neutralFall.Transitions?.set(land.Name, land);

export { startWalk, walk, idle, land, neutralFall, ledgeGrab };
