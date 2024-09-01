import { Entity } from '../ECS';
import { UnboxedPlayer } from '../Extensions/ECSBuilderExtensions';

export class VelocityECSSystem {
  private Players: Array<UnboxedPlayer>;
  constructor(players: Array<Entity>) {
    this.Players = new Array<UnboxedPlayer>();
    players.forEach((p) => this.Players.push(new UnboxedPlayer(p)));
  }

  ApplyVelocity() {
    for (let index = 0; index < this.Players.length; index++) {
      const player = this.Players[index];

      const grounded = player.FlagsComp.IsGrounded();
      const ledgeGrab = player.FlagsComp.IsInLedgeGrab();
      let pvx = player.VelComp.Vel.X;
      let pvy = player.VelComp.Vel.Y;
      const fallSpeed = player.SpeedsComp.FallSpeed;
      const pgvd = player.SpeedsComp.GroundedVelocityDecay;
      const pavd = player.SpeedsComp.AerialVelocityDecay;

      player.AddToPlayerPosition(pvx, pvy);

      //=================================
      //Apply velocty delay for next frame

      //if grounded, apply grounded velocity decay.
      if (grounded || ledgeGrab) {
        //if we are moving right
        if (pvx > 0) {
          pvx -= pgvd;
        }
        // if we are moving left
        if (pvx < 0) {
          pvx += pgvd;
        }
      }
      //if not grounded, or in ledgegrab
      if (!grounded && !ledgeGrab) {
        // if going right
        if (pvx > 0) {
          pvx -= pavd;
        }
        //if going left
        if (pvx < 0) {
          pvx += pavd;
        }
        // if we are falling faster than our set fallspeed
        if (pvy > fallSpeed) {
          pvy -= pavd;
        }
        //if we are flying upward
        if (pvy < 0) {
          pvy += pavd;
        }
      }

      //=================================

      // if we are moving slow enough, just set velocity to 0
      if (Math.abs(pvx) < 3) {
        pvx = 0;
      }

      player.VelComp.Vel.X = pvx;
      player.VelComp.Vel.Y = pvy;
    }
  }
}
