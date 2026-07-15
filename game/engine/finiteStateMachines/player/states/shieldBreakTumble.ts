import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const ShieldBreakTumble: FSMState = {
  StateName: 'ShieldBreakTumble',
  StateId: STATE_IDS.SHIELD_BREAK_TUMBLE_S,
  OnEnter: (p: Player, w: World) => {},
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const ShieldBreakTumbleNode: FSMNode = {
  State: ShieldBreakTumble,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S },
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.SHIELD_BREAK_LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SHIELD_BREAK_LAND_S }
  ],
  Conditions: [],
  DefaultConditions: []
};
