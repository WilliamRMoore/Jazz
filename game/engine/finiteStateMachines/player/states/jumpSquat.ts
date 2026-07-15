import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { STATE_IDS, GAME_EVENT_IDS } from './shared';

export const JumpSquat: FSMState = {
  StateName: 'JUMPSQUAT',
  StateId: STATE_IDS.JUMP_SQUAT_S,
  OnEnter: (p: Player, w: World) => {
    const pHist = w.HistoryData.PlayerHistoryDB[p.ID].get(w.PreviousFrame);
    const lastState = pHist.stateId;
    if (lastState === STATE_IDS.SHIELD_S) {
      p.Flags.JumpFromShield();
    }
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const JumpSquatNode: FSMNode = {
  State: JumpSquat,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_GE, sId: STATE_IDS.GRAB_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [Conditions.ToUpSpecial],
  DefaultConditions: [Conditions.defaultJump]
};
