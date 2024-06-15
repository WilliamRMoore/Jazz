import { IntersectsPolygons } from '../../Physics/Collisions';
import {
  VectorAdder,
  VectorMultiplier,
  VectorNegator,
} from '../../Physics/FlatVec';
import { StageMainComponent, UnboxxedStage } from '../Components/StageMain';
import { ComponentCollection, ECS, EcsExtension, Entity } from '../ECS';
import { UnboxedPlayer } from '../Extensions/ECSBuilderExtensions';

export class StageCollisionSystem {
  private Stage: UnboxxedStage;
  private Players = new Array<UnboxedPlayer>();
  private GroundedCorrrection: number = 0.01;
  private GroundedDetectDepth: number = -0.02;

  constructor(stage: Entity, playerEnts: Array<Entity>) {
    this.Stage = new UnboxxedStage(stage);
    playerEnts.forEach((p) => this.Players.push(new UnboxedPlayer(p)));
  }

  public Detect() {
    const sverts = this.Stage.MainStage.GetVerticies();

    for (let index = 0; index < this.Players.length; index++) {
      const player = this.Players[index];
      const pVerts = player.ECBComp.GetVerticies();

      const res = IntersectsPolygons(pVerts, sverts);

      if (res.collision) {
        const move = VectorMultiplier(VectorNegator(res.normal!), res.depth!);
        let resolution = VectorAdder(player.PosComp.Pos, move);

        if (Math.abs(res!.normal!.X) > 0 && res.normal!.Y > 0) {
          const fix = move.X <= 0 ? move.Y : -move.Y;
          move.X += fix;
          move.Y = 0;
          resolution = VectorAdder(player.PosComp.Pos, move);
        }
        player.StageColResComp.Set(resolution);
      }

      // if (!res.collision) {
      // }
    }
  }

  public Resolve() {
    const sverts = this.Stage.MainStage.GetVerticies();
    for (let index = 0; index < this.Players.length; index++) {
      const player = this.Players[index];

      if (player.StageColResComp.DidCollisionOccure()) {
        const res = player.StageColResComp.GetResolution();
        player.PosComp.Pos.X = res.X;
        player.PosComp.Pos.Y = res.Y;
        player.ECBComp.MoveToPosition(res.X, res.Y);
        player.ECBComp.Update();
      }
    }
  }
}
