import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const WallKick: FSMState = {
  StateName: 'WallSlide',
  StateId: STATE_IDS.WALL_KICK_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Velocity.Y.SetFromRaw(0);
    p.Velocity.X.SetFromRaw(0);
    const stateLength = p.FSMInfo.GetCurrentStateFrameLength() ?? 10;
    p.Flags.SetIntangabilityFrames(stateLength - 3);
  },
  OnUpdate: (p: Player, w: World) => {
    if (p.FSMInfo.CurrentStateFrame == 4) {
      const xVel = p.Flags.IsFacingRight
        ? p.Speeds.WallKickVelocityXRaw
        : -p.Speeds.WallKickVelocityXRaw;
      p.Velocity.X.SetFromRaw(xVel);
      p.Velocity.Y.SetFromRaw(-p.Speeds.WallKickVelocityYRaw);
    }
  },
  OnExit: (p: Player, w: World) => {}
};

export const WallKickNode: FSMNode = {
  State: WallKick,
  DirectTransitions: [
    {
      geId: GAME_EVENT_IDS.HIT_STOP_GE,
      sId: STATE_IDS.HIT_STOP_S
    }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultNFall]
};
