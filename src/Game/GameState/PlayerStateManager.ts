import { Player } from '../Player/Player';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { FlatVec } from '../../Physics/FlatVec';
import { ECB, ECBPoints } from '../ECB';
import { StateMachine } from '../State/StateMachine';

class PlayerStateManager {
  private readonly Players: Array<Player>;
  private readonly FSM: FrameStorageManager;
  private readonly SM: StateMachine;

  constructor(
    players: Array<Player>,
    fsm: FrameStorageManager,
    sm: StateMachine
  ) {
    this.Players = players;
    this.FSM = fsm;
    this.SM = sm;
  }

  RecordStateSnapShot() {
    let upperBound = this.Players.length - 1;

    for (let index = 0; index < upperBound; index++) {
      const p = this.Players[index];
      const pEcbPos = p.ECB.GetPosition();
      const pEcbPoints = p.ECB.GetPoints();

      let pState = {
        Grounded: p.Grounded,
        PlayerPosition: { x: p.PlayerPosition.X, y: p.PlayerPosition.Y },
        PlayerVelocity: { x: p.PlayerVelocity.X, y: p.PlayerVelocity.Y },
        ECBPosition: { x: pEcbPos.X, y: pEcbPos.Y },
        ECBPoints: {
          top: { X: pEcbPoints.top.X, Y: pEcbPoints.top.Y },
          right: { X: pEcbPoints.right.X, Y: pEcbPoints.right.Y },
          bottom: { X: pEcbPoints.bottom.X, Y: pEcbPoints.bottom.Y },
          left: { X: pEcbPoints.left.X, Y: pEcbPoints.left.Y },
        },
        JumpCount: p.JumpCount,
        FacingRight: p.FacingRight,
        ActionState: '', // How do we get this???
      } as playerState;
    }
  }
}

type playerState = {
  Grounded: boolean;
  PlayerPosition: { x: number; y: number };
  PlayerVelocity: { x: number; y: number };
  ECBPosition: { x: number; y: number };
  ECBPoints: ECBPoints;
  JumpCount: number;
  FacingRight: boolean;
  ActionState: string;
};
