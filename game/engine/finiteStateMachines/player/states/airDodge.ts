import { Player } from '../../../entity/playerOrchestrator';
import { DivideRaw, MultiplyRaw, NumberToRaw } from '../../../math/fixedPoint';
import { COS_LUT, SIN_LUT } from '../../../math/LUTS';
import { ONE } from '../../../math/numberConstants';
import { EaseInRaw, GetAtan2IndexRaw } from '../../../utils';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { STATE_IDS, GAME_EVENT_IDS } from './shared';

export const AirDodge: FSMState = {
  StateName: 'AirDodge',
  StateId: STATE_IDS.AIR_DODGE_S,
  OnEnter: (p: Player, w: World) => {
    p.Flags.FastFallOff();
    p.Flags.ZeroDisablePlatDetection();
    const pVel = p.Velocity;
    const inputStore = w.PlayerData.InputStore(p.ID);
    const curFrame = w.LocalFrame;
    const ia = inputStore.GetInputForFrame(curFrame);
    const angleIndexRaw = GetAtan2IndexRaw(ia!.LYAxis.Raw, ia!.LXAxis.Raw);
    let speed = p.Speeds.AirDogeSpeedRaw;
    if (ia.LXAxis.Raw === 0 && ia.LYAxis.Raw === 0) {
      speed = 0;
    }
    pVel.X.SetFromRaw(MultiplyRaw(COS_LUT[angleIndexRaw], speed));
    pVel.Y.SetFromRaw(MultiplyRaw(-SIN_LUT[angleIndexRaw], speed));
    p.Flags.VelocityDecayOff();
  },
  OnUpdate: (p: Player, w: World) => {
    const frameLength = p.FSMInfo.GetFrameLengthForState(
      STATE_IDS.AIR_DODGE_S
    )!;
    const currentFrameForState = p.FSMInfo.CurrentStateFrame;
    const currentFrameFpRaw = NumberToRaw(currentFrameForState);
    const frameLengthFpRaw = NumberToRaw(frameLength);
    const normalizedTimeRaw = DivideRaw(currentFrameFpRaw, frameLengthFpRaw);
    const clampedNormalizedTimeRaw = Math.min(normalizedTimeRaw, ONE);
    const easeRaw = EaseInRaw(clampedNormalizedTimeRaw);
    const pVel = p.Velocity;
    const oneMinusEaseRaw = ONE - easeRaw;
    pVel.X.SetFromRaw(MultiplyRaw(pVel.X.Raw, oneMinusEaseRaw));
    pVel.Y.SetFromRaw(MultiplyRaw(pVel.Y.Raw, oneMinusEaseRaw));
    if (currentFrameForState === 2) {
      p.Flags.SetIntangabilityFrames(15);
    }
  },
  OnExit: (p: Player, w: World) => {
    p.Flags.VelocityDecayOn();
    p.Flags.ZeroIntangabilityFrames();
  }
};

export const AirDodgeNode: FSMNode = {
  State: AirDodge,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.LAND_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultHelpess]
};
