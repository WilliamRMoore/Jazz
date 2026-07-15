import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const ForwardThrow: FSMState = {
  StateName: 'ForwardThrow',
  StateId: STATE_IDS.FORWARD_THROW_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const ForwardThrowNode: FSMNode = {
  State: ForwardThrow,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
