import { PlayerOnStageOrPlats } from '../entity/playerOrchestrator';
import { STATE_IDS } from '../finite-state-machine/stateConfigurations/shared';
import { DivideRaw } from '../math/fixedPoint';
import { POINT_TWO, TWO } from '../math/numberConstants';
import { World } from '../world/world';

export function ApplyVelocityDecay(world: World): void {
  const playerData = world.PlayerData;
  const stageData = world.StageData;
  const playerCount = playerData.PlayerCount;
  const stage = stageData.Stages;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex)!;
    const flags = p.Flags;

    if (flags.IsInHitPause || !flags.IsVelocityDecayActive) {
      continue;
    }

    //const grounded = PlayerOnStageOrPlats(stage, p);
    let grounded = false;
    const stagesLength = stage.length;
    for (let i = 0; i < stagesLength; i++) {
      const stagePiece = stage[i];
      grounded = PlayerOnStageOrPlats(stagePiece, p);
      if (grounded) {
        break;
      }
    }
    const playerVelocity = p.Velocity;
    const pvxRaw = playerVelocity.X.Raw;
    const pvyRaw = playerVelocity.Y.Raw;
    const speeds = p.Speeds;
    const absPvxRaw = Math.abs(pvxRaw);

    if (grounded) {
      const groundedVelocityDecayRaw = speeds.GroundedVelocityDecayRaw;
      if (pvxRaw > 0) {
        playerVelocity.X.SubtractRaw(groundedVelocityDecayRaw);
      } else if (pvxRaw < 0) {
        playerVelocity.X.AddRaw(groundedVelocityDecayRaw);
      }
      if (absPvxRaw < groundedVelocityDecayRaw) {
        playerVelocity.X.Zero();
      }
      if (pvyRaw > 0) {
        playerVelocity.Y.Zero();
      }
      continue;
    }

    if (p.FSMInfo.CurrentStatetId === STATE_IDS.WALL_SLIDE_S) {
      const halfFallSpeed = DivideRaw(p.Speeds.FallSpeedRaw, TWO);
      if (pvyRaw > halfFallSpeed) {
        playerVelocity.Y.SetFromRaw(halfFallSpeed);
      }
      continue;
    }

    const aerialVelocityDecayRaw = speeds.AerialVelocityDecayRaw;
    const fallSpeedRaw =
      p.FSMInfo.CurrentStatetId === STATE_IDS.WALL_SLIDE_S
        ? DivideRaw(speeds.FallSpeedRaw, TWO)
        : p.Flags.IsFastFalling
          ? speeds.FastFallSpeedRaw
          : speeds.FallSpeedRaw;

    if (pvxRaw > 0) {
      playerVelocity.X.SubtractRaw(aerialVelocityDecayRaw);
    } else if (pvxRaw < 0) {
      playerVelocity.X.AddRaw(aerialVelocityDecayRaw);
    }

    if (pvyRaw > fallSpeedRaw) {
      playerVelocity.Y.SubtractRaw(aerialVelocityDecayRaw);
    }

    if (pvyRaw < 0) {
      playerVelocity.Y.AddRaw(aerialVelocityDecayRaw);
    }

    if (absPvxRaw < POINT_TWO) {
      playerVelocity.X.Zero(); //= 0;
    }
  }
}
