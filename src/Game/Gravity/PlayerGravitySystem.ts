import { AddClampedYImpulseToPlayer, Player } from '../Player/Player';

export class PlayerGravitySystem {
  private Players: Array<Player>;
  private Gravity: number;

  constructor(players: Array<Player>, gravity: number | null) {
    this.Players = players;
    this.Gravity = gravity ?? 0.5;
  }

  public ApplyGravity() {
    const length = this.Players.length;
    for (let i = 0; i < length; i++) {
      const p = this.Players[i];

      if (p.Grounded || p.LedgeGrab) {
        p.PlayerVelocity.Y = 0;
        continue;
      }

      AddClampedYImpulseToPlayer(p, p.FallSpeed, this.Gravity);

      if (p.PlayerVelocity.Y >= p.MaxYVelocity) {
        p.PlayerVelocity.Y = p.MaxXVelocity;
      }
    }
  }
}
