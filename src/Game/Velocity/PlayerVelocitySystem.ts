import { AddClampedYImpulseToPlayer, Player } from '../Player/Player';

export class PlayerVelocitySystem {
  private readonly Players: Array<Player>;

  constructor(playersArr: Array<Player>) {
    this.Players = playersArr;
  }

  UpdateVelocity() {
    let length = this.Players.length;

    for (let i = 0; i < length; i++) {
      const p = this.Players[i];

      let grounded = p.Grounded;
      let pvx = p.PlayerVelocity.X;
      let pvy = p.PlayerVelocity.Y;
      let fallSpeed = p.FallSpeed;
      let pgvd = p.GroundVelocityDecay;
      let pavd = p.ArialVelocityDecay;

      //Update Velocty
      p.PlayerPosition.X += pvx;
      p.PlayerPosition.Y += pvy;

      //ApplyVelocityDecay
      if (grounded) {
        if (pvx > 0) {
          pvx -= pgvd;
        }
        if (pvx < 0) {
          pvx += pgvd;
        }
      }

      //AddClampedYImpulseToPlayer(p, fallSpeed, pvy);
      if (!grounded) {
        if (pvx > 0) {
          pvx -= pavd;
        }
        if (pvx < 0) {
          pvx += pavd;
        }
        if (pvy > fallSpeed) {
          pvy -= pavd;
        }
        if (pvy < 0) {
          pvy += pavd;
        }
      }

      if (Math.abs(pvx) < 3) {
        pvx = 0;
      }

      p.PlayerVelocity.X = pvx;
      p.PlayerVelocity.Y = pvy;
    }
  }
}
