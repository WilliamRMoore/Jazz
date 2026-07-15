import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';
import { STATE_IDS, GAME_EVENT_IDS } from './shared';

export const SideCharge: FSMState = {
  StateName: 'SideChagrge',
  StateId: STATE_IDS.SIDE_CHARGE_S,
  OnEnter: (p: Player, w: World) => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const rXAxis = ia.RXAxis;
    if (rXAxis.Raw > 0) {
      p.Flags.FaceRight();
    }
    if (rXAxis.Raw < 0) {
      p.Flags.FaceLeft();
    }
    const geId = GAME_EVENT_IDS.SIDE_CHARGE_GE;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const SideChargeNode: FSMNode = {
  State: SideCharge,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [Conditions.SideChargeToEx],
  DefaultConditions: [Conditions.defaultSideChargeEx]
};
