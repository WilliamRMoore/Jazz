import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const HitFlinch: FSMState = {
  StateName: 'HitFlinch',
  StateId: STATE_IDS.HIT_FLINCH_S,
  OnEnter: (p: Player, w: World) => {
    const pVel = p.Velocity;
    const hitStun = p.HitStun;
    pVel.X = hitStun.VX;
    pVel.Y = hitStun.VY;
  },
  OnUpdate: (p: Player, w: World) => {
    p.HitStun.DecrementHitStun();
  },
  OnExit: (p: Player, w: World) => {
    p.HitStun.Zero();
  }
};

export const HitFlinchNode: FSMNode = {
  State: HitFlinch,
  DirectTransitions: [
    {
      geId: GAME_EVENT_IDS.LAND_GE,
      sId: STATE_IDS.SOFT_LAND_S
    },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [Conditions.FlinchToFall],
  DefaultConditions: []
};
