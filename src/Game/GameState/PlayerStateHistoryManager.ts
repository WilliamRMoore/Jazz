import { Player } from '../Player/Player';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { StateMachine } from '../State/StateMachine';
import { PlayerData, clonePlayerData } from './Clone';

export class PlayerStateHistoryManager {
  private readonly PlayerStateSnapShots: Array<Array<PlayerData>>;
  private readonly Players: Array<Player>;
  private readonly FSM: FrameStorageManager;
  //private readonly SM: StateMachine;

  constructor(
    players: Array<Player>,
    fsm: FrameStorageManager
    //sm: StateMachine
  ) {
    this.Players = players;
    this.FSM = fsm;
    this.PlayerStateSnapShots = new Array<Array<PlayerData>>(2);
    //this.SM = sm;
    for (let index = 0; index < this.Players.length; index++) {
      this.PlayerStateSnapShots[index] = new Array<PlayerData>(1000);
    }
  }

  RecordStateSnapShot() {
    debugger;
    let upperBound = this.Players.length;
    let currentFrame = this.FSM.LocalFrame;

    for (let index = 0; index < upperBound; index++) {
      const PlayerStateSnapShotHistory = this.PlayerStateSnapShots[index];
      PlayerStateSnapShotHistory[currentFrame] = clonePlayerData(
        this.Players[index]
      );
    }
  }
}
