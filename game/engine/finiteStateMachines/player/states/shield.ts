import { Player } from '../../../entity/playerOrchestrator';
import { DivideRaw, MultiplyRaw, SqrtRaw } from '../../../math/fixedPoint';
import { ONE } from '../../../math/numberConstants';
import { World } from '../../../world/world';
import * as Conditions from '../conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from '../shared';

export const Shield: FSMState = {
  StateName: 'Shield',
  StateId: STATE_IDS.SHIELD_S,
  OnEnter: (p: Player, w: World) => {
    p.Shield.Active = true;
  },
  OnUpdate: (p: Player, w: World) => {
    // shrink shield
    const inputStore = w.PlayerData.InputStore(p.ID);
    const input = inputStore.GetInputForFrame(w.LocalFrame);
    const s = p.Shield;
    const triggerValue =
      input.LTValRaw >= input.RTValRaw ? input.LTValRaw : input.RTValRaw;
    s.ShrinkRaw(triggerValue);
    s.SetCalculatedRadiusRaw(triggerValue);
    // tilt shield
    const lxAxis = input.LXAxis;
    const lyAxis = input.LYAxis;
    if (lxAxis.Raw === 0 && lyAxis.Raw === 0) {
      s.ShieldTiltX.Zero();
      s.ShieldTiltY.Zero();
      return;
    }
    const magSqr =
      MultiplyRaw(lxAxis.Raw, lxAxis.Raw) + MultiplyRaw(lyAxis.Raw, lyAxis.Raw);
    if (magSqr > ONE) {
      const mag = SqrtRaw(magSqr);
      const clampedXRaw = DivideRaw(lxAxis.Raw, mag);
      const clampedYRaw = -DivideRaw(lyAxis.Raw, mag);
      const newoffsetXRaw = MultiplyRaw(
        clampedXRaw,
        s.maxShieldOffSetRadius.Raw
      );
      const newoffsetYRaw = MultiplyRaw(
        clampedYRaw,
        s.maxShieldOffSetRadius.Raw
      );
      s.ShieldTiltX.SetFromRaw(newoffsetXRaw);
      s.ShieldTiltY.SetFromRaw(newoffsetYRaw);
      return;
    }
    const newoffsetXRaw = MultiplyRaw(lxAxis.Raw, s.maxShieldOffSetRadius.Raw);
    const newoffsetYRaw = -MultiplyRaw(lyAxis.Raw, s.maxShieldOffSetRadius.Raw);
    s.ShieldTiltX.SetFromRaw(newoffsetXRaw);
    s.ShieldTiltY.SetFromRaw(newoffsetYRaw);
  },
  OnExit: (p, w) => {
    p.Shield.Active = false;
    p.Shield.ShieldTiltX.Zero();
    p.Shield.ShieldTiltY.Zero();
    p.Shield.SetCalculatedRadiusRaw(0);
  }
};

export const ShieldNode: FSMNode = {
  State: Shield,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
    { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
    { geId: GAME_EVENT_IDS.GRAB_GE, sId: STATE_IDS.GRAB_S },
    { geId: GAME_EVENT_IDS.GRAB_HELD_GE, sId: STATE_IDS.GRAB_HELD_S },
    { geId: GAME_EVENT_IDS.SHIELD_BREAK_GE, sId: STATE_IDS.SHIELD_BREAK_S },
    { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S }
  ],
  Conditions: [
    Conditions.shieldToShieldDrop,
    Conditions.ToSpotDodge,
    Conditions.ToRollDodge,
    Conditions.ToStickJumpSquat
  ],
  DefaultConditions: []
};
