import { World } from '../world/world';

export function TimedFlags(world: World): void {
  const playerData = world.PlayerData;
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const flags = p.Flags;
    if (flags.IsInHitPause) {
      flags.DecrementHitPause();
    }
    if (flags.IsIntangible) {
      flags.DecrementIntangabilityFrames();
    }
    if (flags.IsPlatDetectDisabled) {
      flags.DecrementDisablePlatDetection();
    }
  }
}
