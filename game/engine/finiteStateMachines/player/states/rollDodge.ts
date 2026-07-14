import { Player } from '../../../entity/playerOrchestrator';
import { DivideRaw, MultiplyRaw, NumberToRaw } from '../../../math/fixedPoint';
import { ONE } from '../../../math/numberConstants';
import { EaseInRaw } from '../../../utils';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const RollDodge: FSMState = {
  StateName: 'RollDodge',
  StateId: STATE_IDS.ROLL_DODGE_S,
  OnEnter: (p: Player, w: World) => {
    const pd = w.PlayerData;
    const inputStore = pd.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    if (ia.LXAxis.Raw > 0) {
      p.Flags.FaceLeft();
    } else if (ia.LXAxis.Raw < 0) {
      p.Flags.FaceRight();
    }
    p.Flags.SetIntangabilityFrames(20);
    p.Flags.VelocityDecayOff();
  },
  OnUpdate: (p: Player, w: World) => {
    const fsmInfo = p.FSMInfo;
    const totalFrames = fsmInfo.GetFrameLengthForState(STATE_IDS.ROLL_DODGE_S)!;
    const currentFrameRaw = NumberToRaw(fsmInfo.CurrentStateFrame);
    const normalizedTimeRaw = DivideRaw(
      currentFrameRaw,
      NumberToRaw(totalFrames)
    );
    const clampedNormalizedTimeRaw = Math.min(normalizedTimeRaw, ONE);
    const easeRaw = EaseInRaw(clampedNormalizedTimeRaw);
    const maxSpeedRaw = p.Speeds.DodeRollSpeedRaw;
    const oneMinusEaseRaw = ONE - easeRaw;
    const direction = p.Flags.IsFacingRight ? NumberToRaw(-1) : NumberToRaw(1);
    p.Velocity.X.SetFromRaw(
      MultiplyRaw(direction, MultiplyRaw(maxSpeedRaw, oneMinusEaseRaw))
    );
  },
  OnExit: (p, w) => {
    p.Flags.VelocityDecayOn();
    p.Flags.ZeroIntangabilityFrames();
    p.Velocity.X.Zero();
  }
};

export const RollDodgeNode: FSMNode = {
  State: RollDodge,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
