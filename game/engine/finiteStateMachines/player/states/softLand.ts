import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const SoftLand: FSMState = {
  StateName: 'SoftLand',
  StateId: STATE_IDS.SOFT_LAND_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Jump.ResetJumps();
    p.Velocity.Y.Zero();
    p.LedgeDetector.ZeroLedgeGrabCount();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {}
};

export const SoftLandNode: FSMNode = {
  State: SoftLand,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [
    Conditions.LandToIdle,
    Conditions.LandToWalk,
    Conditions.LandToTurn
  ]
};
