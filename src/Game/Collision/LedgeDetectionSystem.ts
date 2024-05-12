import { Player } from '../Player/Player';
import { IntersectsPolygons } from '../../Physics/Collisions';
import Stage from '../../classes/Stage';
import { StateMachine } from '../State/StateMachine';
import { InputAction } from '../../input/GamePadInput';
export class LedgeDetectionSystem {
  Players: Array<Player>;
  Stage: Stage;
  SMArray: Array<StateMachine>;

  constructor(
    players: Array<Player>,
    stage: Stage,
    smArr: Array<StateMachine>
  ) {
    this.Players = players;
    this.Stage = stage;
    this.SMArray = smArr;
  }

  public CheckForLedge() {
    const length = this.Players.length;
    const { left, right } = this.Stage.GetLedges();

    for (let i = 0; i < length; i++) {
      const p = this.Players[i];
      const ecbPoints = p.ECB.GetPoints();

      //If we aren't grounded, and if we are moving down (falling in the air)
      //We can only grab ledges when airborne and falling down.
      if (!p.Grounded && p.PlayerVelocity.Y > 0) {
        //if we are facing right, we shouldn't be able to grab the right hand ledge, We can only grab ledges we are facing.
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
            let inputAction = {} as InputAction;
            inputAction.Action = 'ledgeGrab';
            this.SMArray[i].ForceState(0, inputAction);
            p.UpdatePlayerPosition(
              left[0].X,
              left[0].Y + (ecbPoints.bottom.Y - ecbPoints.top.Y)
            );
          }
        }
        //if we are facing left, we shouldn't be able to grab the left hand ledge, We can only grab ledges we are facing.
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
            let inputAction = {} as InputAction;
            inputAction.Action = 'ledgeGrab';
            this.SMArray[i].ForceState(0, inputAction);
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
