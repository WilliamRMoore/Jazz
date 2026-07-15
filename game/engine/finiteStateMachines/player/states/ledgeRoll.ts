import { Player } from '../../../entity/playerOrchestrator';
import { DivideRaw, MultiplyRaw, NumberToRaw } from '../../../math/fixedPoint';
import { ONE, TWO } from '../../../math/numberConstants';
import { EaseInRaw } from '../../../utils';
import { World } from '../../../world/world';
import * as Conditions from './conditions/conditions';
import { FSMNode } from '../PlayerStateCollections';
import { FSMState } from '../PlayerStateMachine';
import { STATE_IDS } from './shared';

export const LedgeRoll: FSMState = {
  StateName: 'LedgeRoll',
  StateId: STATE_IDS.LEDGE_ROLL_S,
  OnEnter: (p: Player, w: World) => {
    p.ECB.SetECBShape(STATE_IDS.LEDGE_ROLL_S);
    p.Flags.FastFallOff();

    const getUpFrames = p.LedgeDetector.LedgeRollFrames.ledgeGetUpFrames; // By this frame player should be back on stage
    const rollEnd = p.FSMInfo.GetFrameLengthForState(STATE_IDS.LEDGE_ROLL_S)!;
    p.Flags.SetIntangabilityFrames(rollEnd);

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

    const framesToStageRaw = NumberToRaw(getUpFrames);
    const diffXRaw = targetXRaw - p.Position.X.Raw;
    const diffYRaw = targetYRaw - p.Position.Y.Raw;

    p.Velocity.X.SetFromRaw(DivideRaw(diffXRaw, framesToStageRaw));
    p.Velocity.Y.SetFromRaw(DivideRaw(diffYRaw, framesToStageRaw));
    p.Flags.VelocityDecayOff();
  },
  OnUpdate: (p: Player, w: World) => {
    const frame = p.FSMInfo.CurrentStateFrame;
    const getUpFrames = p.LedgeDetector.LedgeRollFrames.ledgeGetUpFrames;
    const rollStart = p.LedgeDetector.LedgeRollFrames.ledgeRollFrames[0];
    const rollEnd = p.FSMInfo.GetFrameLengthForState(STATE_IDS.LEDGE_ROLL_S)!;

    if (frame === getUpFrames) {
      p.Velocity.X.Zero();
      p.Velocity.Y.Zero();
    }

    if (frame >= rollStart && frame <= rollEnd) {
      const rollFrames = rollEnd - rollStart + 1;
      const currentRollFrame = frame - rollStart + 1;

      const rollSpeedRaw = p.Speeds.LedgeRollSpeedRaw;

      const normalizedTimeRaw = DivideRaw(
        NumberToRaw(currentRollFrame),
        NumberToRaw(rollFrames)
      );
      const clampedNormalizedTimeRaw = Math.min(normalizedTimeRaw, ONE);
      const easeRaw = EaseInRaw(clampedNormalizedTimeRaw);
      let moveRaw = MultiplyRaw(rollSpeedRaw, ONE - easeRaw);

      if (p.Flags.IsFacingLeft) {
        moveRaw = -moveRaw;
      }
      p.Velocity.X.SetFromRaw(moveRaw);
    }
  },
  OnExit: (p: Player, w: World) => {
    p.Velocity.X.Zero();
    p.Velocity.Y.Zero();
    p.Flags.VelocityDecayOn();
    p.LedgeDetector.ZeroLedgeGrabCount();
    p.Jump.ResetJumps();
  }
};

export const LedgeRollNode: FSMNode = {
  State: LedgeRoll,
  DirectTransitions: [],
  Conditions: [],
  DefaultConditions: [Conditions.defaultIdle]
};
