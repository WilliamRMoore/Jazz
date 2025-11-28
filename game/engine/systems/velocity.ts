import { AddToPlayerPositionFp } from '../entity/playerOrchestrator';
import { PlayerData } from '../world/world';

export function ApplyVelocity(playerData: PlayerData): void {
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);

    if (p.Flags.IsInHitPause) {
      continue;
    }

    const playerVelocity = p.Velocity;

    AddToPlayerPositionFp(p, playerVelocity.X, playerVelocity.Y);
  }
}
