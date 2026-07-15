import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const TechInPlace: FSMState = {
  StateName: 'TechInPlace',
  StateId: STATE_IDS.TECH_IN_PLACE_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.SetIntangabilityFrames(20);
    p.Velocity.X.Zero();
    p.Velocity.Y.Zero();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const TechInPlaceNode: FSMNode = {
  State: TechInPlace,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
