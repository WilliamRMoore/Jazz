import { IntersectsPolygons } from '../../Physics/Collisions';
import {
  FlatVec,
  VectorAdder,
  VectorAllocator,
  VectorMultiplier,
  VectorNegator,
} from '../../Physics/FlatVec';
import { UnboxedStage } from '../Components/StageMain';
import { Entity } from '../ECS';
import { UnboxedPlayer } from '../Extensions/ECSBuilderExtensions';
import { LineSegmentIntersection } from '../../Physics/RayCast/RayCast';

export class StageCollisionSystem {
  private Stage: UnboxedStage;
  private Players = new Array<UnboxedPlayer>();
  private GroundedCorrrection: number = 0.01;
  private GroundedDetectDepth: number = -0.02;

  constructor(stage: Entity, playerEnts: Array<Entity>) {
    this.Stage = new UnboxedStage(stage);
    playerEnts.forEach((p) => this.Players.push(new UnboxedPlayer(p)));
  }

  public Detect(frameNumber: number) {
    const sverts = this.Stage.MainStage.GetVerticies();

    for (let index = 0; index < this.Players.length; index++) {
      const player = this.Players[index];
      const pVerts = player.ECBComp.GetVerticies();

      const res = IntersectsPolygons(pVerts, sverts);

      if (res.collision) {
        const move = VectorMultiplier(VectorNegator(res.normal!), res.depth!);
        move.Y += this.GroundedCorrrection;
        let resolution = VectorAdder(player.PosComp.Pos, move);

        if (Math.abs(res!.normal!.X) > 0 && res.normal!.Y > 0) {
          const fix = move.X <= 0 ? move.Y : -move.Y;
          move.X += fix;
          move.Y = 0;
          resolution = VectorAdder(player.PosComp.Pos, move);
        }

        player.StageColResComp.Set(resolution);

        player.UpdatePlayerPosition(resolution.X, resolution.Y);

        const ecbTestPoint = VectorAllocator(
          player.ECBComp.Bottom().X,
          player.ECBComp.Bottom().Y + this.GroundedDetectDepth
        );

        this.checkGround(
          ecbTestPoint,
          player.ECBComp.Bottom(),
          sverts[0],
          sverts[1]
        ) == true
          ? player.FlagsComp.Ground(frameNumber)
          : player.FlagsComp.Unground();
      }

      if (!res.collision) {
        player.FlagsComp.Unground();
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
