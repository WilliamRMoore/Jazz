import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const DirtNap: FSMState = {
  StateName: 'DirtNap',
  StateId: STATE_IDS.DIRT_NAP_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.LedgeDetector.ZeroLedgeGrabCount();
  }
};

export const DirtNapNode: FSMNode = {
  State: DirtNap,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.ATTACK_GE, sId: STATE_IDS.GETUP_ATTACK_S }
  ],
  Conditions: [
    Conditions.toGetUp,
    Conditions.toGetUpRollForward,
    Conditions.toGetUpRollBack
  ],
  DefaultConditions: [Conditions.defaultToGetUp]
};
