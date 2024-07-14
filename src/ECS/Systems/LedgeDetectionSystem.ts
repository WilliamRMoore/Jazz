import { IntersectsPolygons } from '../../Physics/Collisions';
import { FlatVec } from '../../Physics/FlatVec';
import { UnboxedStage } from '../Components/StageMain';
import { Entity } from '../ECS';
import { UnboxedPlayer } from '../Extensions/ECSBuilderExtensions';

export class LedgeDetectionSystem {
  LeftLedge: Array<FlatVec>;
  RightLedge: Array<FlatVec>;
  Players: Array<UnboxedPlayer>;

  constructor(stage: Entity, players: Array<Entity>) {
    players.forEach((p) => {
      this.Players.push(new UnboxedPlayer(p));
    });
    const unboxedStage = new UnboxedStage(stage);
    const { left, right } = unboxedStage.MainStage.GetLedges();
    this.LeftLedge = left;
    this.RightLedge = right;
  }

  public CheckLedgeCollision() {
    for (let i = 0; i < this.Players.length; i++) {
      const player = this.Players[i];
      if (!player.FlagsComp.IsGrounded() && player.VelComp.Vel.Y > 0) {
        if (player.FlagsComp.IsFacingRight()) {
          const rightResult = IntersectsPolygons(
            player.LedgeDetectorComp.GetRightSideDetectorVerts(),
            this.LeftLedge
          );
          const leftResult = IntersectsPolygons(
            player.LedgeDetectorComp.GetLeftSideDetectorVerts(),
            this.LeftLedge
          );
          if (rightResult.collision && !leftResult.collision) {
            // force player state into ledge grab
            player.UpdatePlayerPosition(
              this.LeftLedge[0].X,
              this.LeftLedge[0].Y +
                (player.ECBComp.Bottom().Y - player.ECBComp.Top().Y)
            );
          }
        }

        if (player.FlagsComp.IsFacingRight()) {
          const leftResult = IntersectsPolygons(
            player.LedgeDetectorComp.GetLeftSideDetectorVerts(),
            this.RightLedge
          );
          const rightResult = IntersectsPolygons(
            player.LedgeDetectorComp.GetRightSideDetectorVerts(),
            this.RightLedge
          );
          if (leftResult.collision && !rightResult.collision) {
            // forse player state into ledge grab
            player.UpdatePlayerPosition(
              this.RightLedge[1].X,
              this.RightLedge[1].Y +
                (player.ECBComp.Bottom().Y - player.ECBComp.Top().Y)
            );
          }
        }
      }
    }
  }
}
