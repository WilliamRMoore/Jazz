import { Player } from '../../../entity/playerOrchestrator';
import { NumberToRaw } from '../../../math/fixedPoint';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

const POINT_ONE_FIVE = NumberToRaw(0.15);

export const SideTilt: FSMState = {
  StateName: 'SideTilt',
  StateId: STATE_IDS.SIDE_TILT_S,
  OnEnter: (p: Player, w: World) => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    if (ia.LYAxis.Raw > POINT_ONE_FIVE) {
      attackOnEnter(p, w, GAME_EVENT_IDS.S_TILT_U_GE);
      return;
    }
    if (ia.LYAxis.Raw < -POINT_ONE_FIVE) {
      attackOnEnter(p, w, GAME_EVENT_IDS.S_TILT_D_GE);
      return;
    }
    attackOnEnter(p, w, GAME_EVENT_IDS.S_TILT_GE);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const SideTiltNode: FSMNode = {
  State: SideTilt,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
  ],
  Conditions: [Conditions.SideTiltToWalk],
  DefaultConditions: [Conditions.defaultIdle]
};
