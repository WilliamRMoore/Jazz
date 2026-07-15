import { Player } from '../../../entity/playerOrchestrator';
import { DivideRaw, MultiplyRaw, NumberToRaw } from '../../../math/fixedPoint';
import { ONE } from '../../../math/numberConstants';
import { EaseInRaw } from '../../../utils';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const GetUpRollForward: FSMState = {
  StateName: 'GetUpRollForward',
  StateId: STATE_IDS.GETUP_ROLL_FORWARD_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.SetIntangabilityFrames(15);
    p.Flags.VelocityDecayOff();
  },
  OnUpdate: (p: Player, w: World) => {
    const fsm = p.FSMInfo;
    const totalFrames = fsm.GetCurrentStateFrameLength()!;
    const rollRightSpeed = p.Speeds.GetUpRollForwardSpeedRaw;
    const currentFrameRaw = NumberToRaw(fsm.CurrentStateFrame);
    const normalizedTimeRaw = DivideRaw(
      currentFrameRaw,
      NumberToRaw(totalFrames)
    );
    const clampedNormalizedTimeRaw = Math.min(normalizedTimeRaw, ONE);
    const easeRaw = EaseInRaw(clampedNormalizedTimeRaw);
    let moveRaw = MultiplyRaw(rollRightSpeed, ONE - easeRaw);
    if (p.Flags.IsFacingLeft) {
      moveRaw = -moveRaw;
    }
    p.Velocity.X.SetFromRaw(moveRaw);
  },
  OnExit: (p: Player, w: World) => {
    p.Flags.SetIntangabilityFrames(0);
    p.Flags.VelocityDecayOn();
  }
};

export const GetUpRollForwardNode: FSMNode = {
  State: GetUpRollForward,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
