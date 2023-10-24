import { Player } from '../Player/Player';
import Stage from '../../classes/Stage';
import { IntersectsPolygons } from '../../Physics/Collisions';
import {
  VectorAdder,
  VectorMultiplier,
  VectorNegator,
} from '../../Physics/FlatVec';

export class StageCollisionSystem {
  private readonly players: Array<Player>;
  private readonly stage: Stage;

  constructor(players: Array<Player>, stage: Stage) {
    this.players = players;
    this.stage = stage;
  }

  public handle() {
    const sverts = this.stage.GetVerticies();

    for (let index = 0; index < this.players.length; index++) {
      const player = this.players[index];
      const pverts = player.ECB.GetVerticies();

      const res = IntersectsPolygons(pverts, sverts);

      if (res.collision) {
        const move = VectorMultiplier(VectorNegator(res.normal!), res.depth!);

        player.PlayerPosition = VectorAdder(player.PlayerPosition, move);

        player.Grounded = true;
        player.ECB.MoveToPosition(
          player.PlayerPosition.X,
          player.PlayerPosition.Y
        );
        player.ECB.Update();
      }

      if (!res.collision) {
        player.Grounded = false;
      }
    }
  }
}
