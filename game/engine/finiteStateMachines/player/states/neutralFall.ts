import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';
import { aerialInputOnUpdate } from '../stateHelpers';

export const NeutralFall: FSMState = {
  StateName: 'NFALL',
  StateId: STATE_IDS.N_FALL_S,
  OnEnter: (p: Player, w: World) => {
    if (p.Jump.JumpCountIsZero()) {
      p.Jump.IncrementJumps();
    }
  },
  OnUpdate: (p: Player, w: World) => {
    aerialInputOnUpdate(p, w);
  },
  OnExit: (p: Player, w: World) => {}
};

export const NeutralFallNode: FSMNode = {
  State: NeutralFall,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
    { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S },
    { geId: GAME_EVENT_IDS.WALL_KICK_GE, sId: STATE_IDS.WALL_KICK_S }
  ],
  Conditions: [
    Conditions.ToJump,
    Conditions.ToAirDodge,
    Conditions.ToNair,
    Conditions.ToUAir,
    Conditions.ToDAir,
    Conditions.ToFAir,
    Conditions.ToBAir,
    Conditions.ToSideSpecialAir,
    Conditions.ToUpSpecial,
    Conditions.ToDownSpecialAir,
    Conditions.ToStickJump
  ],
  DefaultConditions: []
};
