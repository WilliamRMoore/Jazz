import { NumberToRaw } from '../math/fixedPoint';
import { PlayerOnStageOrPlats } from '../entity/playerOrchestrator';
import { PlayerData, StageData } from '../world/world';

const POINT_TWO = NumberToRaw(0.2);

export function ApplyVelocityDecay(
  playerData: PlayerData,
  stageData: StageData
): void {
  const playerCount = playerData.PlayerCount;
  const stage = stageData.Stage;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex)!;
    const flags = p.Flags;

    if (flags.IsInHitPause || !flags.IsVelocityDecayActive) {
      continue;
    }

    const grounded = PlayerOnStageOrPlats(
      stage,
      p.ECB.Bottom,
      p.ECB.SensorDepth
    );
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

    const aerialVelocityDecayRaw = speeds.AerialVelocityDecayRaw;
    const fallSpeedRaw = p.Flags.IsFastFalling
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
