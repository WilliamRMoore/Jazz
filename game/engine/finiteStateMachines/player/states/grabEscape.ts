import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { STATE_IDS } from './shared';

export const GrabEscape: FSMState = {
  StateName: 'GrabEscape',
  StateId: STATE_IDS.GRAB_ESCAPE_S,
  OnEnter: (p: Player, w: World) => {
    const velocity = p.Velocity;
    const flags = p.Flags;
    const releaseVelocity = flags.IsFacingRight ? -10 : 10;
    velocity.X.SetFromNumber(releaseVelocity);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const GrabEscapeNode: FSMNode = {
  State: GrabEscape,
  DirectTransitions: [],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
