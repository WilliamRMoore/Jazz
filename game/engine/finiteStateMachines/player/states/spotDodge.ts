import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const SpotDodge: FSMState = {
  StateName: 'SpotDodge',
  StateId: STATE_IDS.SPOT_DODGE_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.SetIntangabilityFrames(20);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p, w) => {}
};

export const SpotDodgeNode: FSMNode = {
  State: SpotDodge,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
