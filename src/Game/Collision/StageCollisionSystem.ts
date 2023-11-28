import { Player } from '../Player/Player';
import Stage from '../../classes/Stage';
import { IntersectsPolygons } from '../../Physics/Collisions';
import {
  FlatVec,
  VectorAdder,
  VectorMultiplier,
  VectorNegator,
} from '../../Physics/FlatVec';
import { LineSegmentIntersection } from '../../Physics/RayCast/RayCast';
export class StageCollisionSystem {
  private readonly players: Array<Player>;
  private readonly stage: Stage;
  private lastFrameCollision: boolean = false;

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
        move.Y += 0.5;

        //check to see if current position and previous position intersect the ground
        if (!this.lastFrameCollision) {
          player.Grounded = this.checkGround(
            player.PreviousPlayerPosition,
            player.PlayerPosition,
            sverts[0],
            sverts[1]
          );
        }

        //A collision resolution call back should be passed here instead of the hard coded logic.
        // Need to update all of the bounding boxes to the player postion,
        // since it was modified by our collision resolution.
        player.PlayerPosition = VectorAdder(player.PlayerPosition, move);

        player.ECB.MoveToPosition(
          player.PlayerPosition.X,
          player.PlayerPosition.Y
        );
        player.ECB.Update();
        player.LedgeDetector.MoveTo(
          player.PlayerPosition.X,
          player.PlayerPosition.Y
        );

        this.lastFrameCollision = true;
      }

      if (!res.collision) {
        this.lastFrameCollision = false;
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
