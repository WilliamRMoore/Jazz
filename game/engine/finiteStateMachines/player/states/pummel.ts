import { Player } from '../../../entity/playerOrchestrator';
import { NumberToRaw } from '../../../math/fixedPoint';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

const POINT_THREE_THREE = NumberToRaw(0.33);
const POINT_ONE_FIVE = NumberToRaw(0.15);
const POINT_SIX = NumberToRaw(0.6);

export const Pummel: FSMState = {
  StateName: 'Pummel',
  StateId: STATE_IDS.PUMMEL_S,
  OnEnter: (p: Player, w: World) => {
    const geId = GAME_EVENT_IDS.PUMMEL_GE;
    const stateId = STATE_IDS.PUMMEL_S;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const PummelNode: FSMNode = {
  State: Pummel,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_RELEASE_GE, sId: STATE_IDS.GRAB_RELEASE_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultHold]
};
