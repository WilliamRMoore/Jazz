import { Player } from '../Player/Player';
import { IntersectsPolygons } from '../../Physics/Collisions';
import Stage from '../../classes/Stage';
import { StateMachine } from '../State/StateMachine';
export class LedgeDetectionSystem {
  Players: Array<Player>;
  Stage: Stage;
  SM: StateMachine;

  constructor(players: Array<Player>, stage: Stage, sm: StateMachine) {
    this.Players = players;
    this.Stage = stage;
    this.SM = sm;
  }

  public CheckForLedge() {
    const length = this.Players.length;
    const { left, right } = this.Stage.GetLedges();

    for (let i = 0; i < length; i++) {
      const p = this.Players[i];
      const ecbPoints = p.ECB.GetPoints();

      if (!p.Grounded && p.PlayerVelocity.Y > 0) {
        if (p.FacingRight) {
          let rightResult = IntersectsPolygons(
            p.LedgeDetector.GetRightSideDetector(),
            left
          );
          let leftResult = IntersectsPolygons(
            p.LedgeDetector.GetLeftSideDetector(),
            left
          );
          if (rightResult.collision && !leftResult.collision) {
            this.SM.ForceState('ledgeGrab');
            p.UpdatePlayerPosition(
              left[0].X,
              left[0].Y + (ecbPoints.bottom.Y - ecbPoints.top.Y)
            );
          }
        }

        if (!p.FacingRight) {
          let leftResult = IntersectsPolygons(
            p.LedgeDetector.GetLeftSideDetector(),
            right
          );
          let rightResult = IntersectsPolygons(
            p.LedgeDetector.GetRightSideDetector(),
            right
          );

          if (leftResult.collision && !rightResult.collision) {
            this.SM.ForceState('ledgeGrab');
            p.UpdatePlayerPosition(
              right[1].X,
              right[1].Y + (ecbPoints.bottom.Y - ecbPoints.top.Y)
            );
          }
        }
      }
    }
  }
}
