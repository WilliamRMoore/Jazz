import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

export const SideSpecialAir: FSMState = {
  StateName: 'SideSpecialAir',
  StateId: STATE_IDS.SIDE_SPCL_AIR_S,
  OnEnter: (p: Player, w: World) => {
    const curFrame = w.LocalFrame;
    const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(curFrame);
    const lxAxis = ia.LXAxis;
    if (lxAxis.Raw < 0) {
      p.Flags.FaceLeft();
    }
    if (lxAxis.Raw >= 0) {
      p.Flags.FaceRight();
    }
    const geId = GAME_EVENT_IDS.S_SPCL_AIR_GE;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const SideSpecialAirNode: FSMNode = {
  State: SideSpecialAir,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    {
      geId: GAME_EVENT_IDS.S_SPCL_EX_AIR_GE,
      sId: STATE_IDS.SIDE_SPCL_EX_AIR_S
    },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultHelpess]
};
