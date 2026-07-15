import { Player } from '../../../entity/playerOrchestrator';
import { DivideRaw, NumberToRaw } from '../../../math/fixedPoint';
import { TWO } from '../../../math/numberConstants';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { GAME_EVENT_IDS, STATE_IDS } from './shared';

export const LedgeGetUp: FSMState = {
  StateName: 'LedgeGetUp',
  StateId: STATE_IDS.LEDGE_GETUP_S,
  OnEnter: (p: Player, w: World) => {
    p.ECB.SetECBShape(STATE_IDS.LEDGE_GETUP_S);
    p.Flags.FastFallOff();
    p.Flags.SetIntangabilityFrames(30);

    const stage = w.StageData.Stages;
    let targetXRaw = p.Position.X.Raw;
    let targetYRaw = p.Position.Y.Raw;
    const isFacingRight = p.Flags.IsFacingRight;

    let minTargetDistSq = Infinity;
    for (let i = 0; i < stage.length; i++) {
      const ledges = stage[i].Ledges;
      const ledge = isFacingRight
        ? ledges.GetLeftLedge()
        : ledges.GetRightLedge();
      if (ledge && ledge.length > 0) {
        const cornerX = ledge[0].X.Raw;
        const cornerY = ledge[0].Y.Raw;
        const distSq =
          Math.abs(cornerX - p.Position.X.Raw) +
          Math.abs(cornerY - p.Position.Y.Raw);
        if (distSq < minTargetDistSq) {
          minTargetDistSq = distSq;
          targetXRaw = cornerX;
          targetYRaw = cornerY - p.ECB.YOffset.Raw;
        }
      }
    }

    const halfWidthRaw = DivideRaw(p.ECB.Width.Raw, TWO);
    targetXRaw = isFacingRight
      ? targetXRaw + halfWidthRaw
      : targetXRaw - halfWidthRaw;

    const framesToStage = p.FSMInfo.GetCurrentStateFrameLength()!;
    const framesToStageRaw = NumberToRaw(framesToStage);
    const diffXRaw = targetXRaw - p.Position.X.Raw;
    const diffYRaw = targetYRaw - p.Position.Y.Raw;

    p.Velocity.X.SetFromRaw(DivideRaw(diffXRaw, framesToStageRaw));
    p.Velocity.Y.SetFromRaw(DivideRaw(diffYRaw, framesToStageRaw));
    p.Flags.VelocityDecayOff();
  },
  OnUpdate: (p: Player, w: World) => {},
  OnExit: (p: Player, w: World) => {
    p.Velocity.X.Zero();
    p.Velocity.Y.Zero();
    p.Flags.VelocityDecayOn();
    p.LedgeDetector.ZeroLedgeGrabCount();
    p.Jump.ResetJumps();
  }
};

export const LedgeGetUpNode: FSMNode = {
  State: LedgeGetUp,
  DirectTransitions: [
    { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
  ],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
