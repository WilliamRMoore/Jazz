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

      if (!p.Grounded && p.PlayerVelocity.Y > 0) {
        if (p.FacingRight) {
          let result = IntersectsPolygons(
            p.LedgeDetector.GetRightSideDetector(),
            left
          );
          if (result.collision) {
            console.log('Ledge Detected');
            this.SM.ForceState('ledgeGrab');
            p.PlayerPosition.X = left[0].X;
            p.PlayerPosition.Y = left[0].Y + 100;
          }
        }

        if (!p.FacingRight) {
          let result = IntersectsPolygons(
            p.LedgeDetector.GetLeftSideDetector(),
            right
          );
          if (result.collision) {
            console.log('Ledge Detected');
            this.SM.ForceState('ledgeGrab');
            p.PlayerPosition.X = right[1].X;
            p.PlayerPosition.Y = right[1].Y + 100;
          }
        }
      }
    }
  }
}
