import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const ShieldBreak: FSMState = {
  StateName: 'ShieldBreak',
  StateId: STATE_IDS.SHIELD_BREAK_S,
  OnEnter: (p: Player, w: World) => {
    p.Velocity.X.Zero();
    p.Velocity.Y.SetFromNumber(-30);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const ShieldBreakNode: FSMNode = {
  State: ShieldBreak,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.shieldBreakDefaultShieldTumble]
};
