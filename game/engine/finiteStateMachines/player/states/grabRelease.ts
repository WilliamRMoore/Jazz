import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const GrabRelease: FSMState = {
  StateName: 'GrabRelease',
  StateId: STATE_IDS.GRAB_RELEASE_S,
  OnEnter: (p: Player, w: World) => {
    const velocity = p.Velocity;
    const flags = p.Flags;
    const releaseVelocity = flags.IsFacingRight ? -6 : 6;
    velocity.X.SetFromNumber(releaseVelocity);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const GrabReleaseNode: FSMNode = {
  State: GrabRelease,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
