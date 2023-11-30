import { Player } from '../Player/Player';
import Stage from '../../classes/Stage';
import { IntersectsPolygons } from '../../Physics/Collisions';
import {
  FlatVec,
  VectorAdder,
  VectorAllocator,
  VectorMultiplier,
  VectorNegator,
} from '../../Physics/FlatVec';
import { LineSegmentIntersection } from '../../Physics/RayCast/RayCast';

export class StageCollisionSystem {
  private readonly players: Array<Player>;
  private readonly stage: Stage;
  private GroundCorrection: number = 0.01;
  private GroundDetectDepth: number = -0.02;

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
        move.Y += this.GroundCorrection;

        let resolution = VectorAdder(player.PlayerPosition, move);

        player.UpdatePlayerPosition(resolution.X, resolution.Y);

        let ecbTestPoint = VectorAllocator(
          player.ECB.GetPoints().bottom.X,
          player.ECB.GetPoints().bottom.Y + this.GroundDetectDepth
        );

        player.Grounded = this.checkGround(
          ecbTestPoint,
          player.ECB.GetPoints().bottom,
          sverts[0],
          sverts[1]
        );
      }

      if (!res.collision) {
        player.Grounded = false;
      }
    }
  }

  private checkGround(
    start1: FlatVec,
    end1: FlatVec,
    start2: FlatVec,
    end2: FlatVec
  ) {
    let res = LineSegmentIntersection(
      start1.X,
      start1.Y,
      end1.X,
      end1.Y,
      start2.X,
      start2.Y,
      end2.X,
      end2.Y
    );

    if (res) {
      return true;
    } else {
      return false;
    }
  }
}
