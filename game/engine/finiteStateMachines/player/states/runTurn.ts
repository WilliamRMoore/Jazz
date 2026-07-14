import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const RunTurn: FSMState = {
  StateName: 'RUN_TURN',
  StateId: STATE_IDS.RUN_TURN_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.Flags.ChangeDirections();
  }
};

export const RunTurnNode: FSMNode = {
  State: RunTurn,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [Conditions.ToSideSpecial, Conditions.ToUpSpecial],
  DefaultConditions: [Conditions.defaultTrunRunToIdle, Conditions.defaultRun]
};
