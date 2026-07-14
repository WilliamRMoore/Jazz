import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const LedgeGrab: FSMState = {
  StateName: 'LedgeGrab',
  StateId: STATE_IDS.LEDGE_GRAB_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Velocity.X.Zero();
    p.Velocity.Y.Zero();
    const ledgeDetectorComp = p.LedgeDetector;
    const jumpComp = p.Jump;
    jumpComp.ResetJumps();
    jumpComp.IncrementJumps();
    ledgeDetectorComp.IncrementLedgeGrabs();
    p.Flags.SetIntangabilityFrames(30);
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.LedgeDetector.ReleaseLedge();
    p.Flags.SetDisableLedgeDetectionFrames(15);
  }
};

export const LedgeGrabNode: FSMNode = {
  State: LedgeGrab,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.LEDGE_GETUP_S },
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S },
    { geId: GAME_EVENT_IDS.ATTACK_GE, sId: STATE_IDS.LEDGE_ATTACK_S }
  ],
  Conditions: [
    Conditions.LedgeGrabDrop,
    Conditions.LedgeGrabToGetUp,
    Conditions.LedgeGrabToLedgeRoll
  ],
  DefaultConditions: [Conditions.defaultNFall]
};
