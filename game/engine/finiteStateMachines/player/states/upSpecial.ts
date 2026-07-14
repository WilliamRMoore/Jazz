import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';
import { attackOnEnter, attackOnExit, attackOnUpdate } from '../stateHelpers';

export const UpSpecial: FSMState = {
  StateName: 'UpSpecial',
  StateId: STATE_IDS.UP_SPCL_S,
  OnEnter: (p: Player, w: World) => {
    const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(w.LocalFrame);
    if (ia.LXAxis.Raw > 0) {
      p.Flags.FaceRight();
    }
    if (ia.LXAxis.Raw < 0) {
      p.Flags.FaceLeft();
    }
    const geId = GAME_EVENT_IDS.UP_SPCL_GE;
    const stateId = STATE_IDS.UP_SPCL_S;
    attackOnEnter(p, w, geId);
  },
  OnUpdate: attackOnUpdate,
  OnExit: attackOnExit
};

export const UpSpecialNode: FSMNode = {
  State: UpSpecial,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultHelpess]
};
