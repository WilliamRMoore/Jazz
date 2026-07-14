import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { STATE_IDS } from '../shared';

export const HitStop: FSMState = {
  StateName: 'HitStop',
  StateId: STATE_IDS.HIT_STOP_S,
  OnEnter: (p: Player, world: World) => {
    p.Flags.FastFallOff();
    p.Velocity.X.Zero();
    p.Velocity.Y.Zero();
  },
  OnUpdate: (p: Player, world: World) => {
    p.HitStop.Decrement();
  },
  OnExit: (p: Player, world: World) => {
    p.HitStop.SetZero();
  }
};

export const HitStopNode: FSMNode = {
  State: HitStop,
  DirectTransitions: [],
  Conditions: [
    Conditions.HitStopToHitSlide,
    Conditions.HitStopToFlinch,
    Conditions.HitStopToLaunch
  ],
  DefaultConditions: []
};
