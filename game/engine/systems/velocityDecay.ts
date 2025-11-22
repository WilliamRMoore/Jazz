import { NumberToRaw } from '../../math/fixedPoint';
import { PlayerOnStageOrPlats } from '../player/playerOrchestrator';
import { PlayerData, StageData } from '../world/world';

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
      const groundedVelocityDecay = speeds.GroundedVelocityDecay;
      if (pvxRaw > 0) {
        playerVelocity.X.Subtract(groundedVelocityDecay);
      } else if (pvxRaw < 0) {
        playerVelocity.X.Add(groundedVelocityDecay);
      }

      if (absPvxRaw < groundedVelocityDecay.Raw) {
        playerVelocity.X.Zero();
      }

      if (pvyRaw > 0) {
        playerVelocity.Y.Zero;
      }

      continue;
    }

    const aerialVelocityDecay = speeds.AerialVelocityDecay;
    const fallSpeed = p.Flags.IsFastFalling
      ? speeds.FastFallSpeed
      : speeds.FallSpeed;

    if (pvxRaw > 0) {
      playerVelocity.X.Subtract(aerialVelocityDecay); //-= aerialVelocityDecay;
    } else if (pvxRaw < 0) {
      playerVelocity.X.Add(aerialVelocityDecay); //+= aerialVelocityDecay;
    }

    if (pvyRaw > fallSpeed.Raw) {
      playerVelocity.Y.Subtract(aerialVelocityDecay); //-= aerialVelocityDecay;
    }

    if (pvyRaw < 0) {
      playerVelocity.Y.Add(aerialVelocityDecay);
    }

    if (absPvxRaw < NumberToRaw(0.2)) {
      playerVelocity.X.Zero(); //= 0;
    }
  }
}
