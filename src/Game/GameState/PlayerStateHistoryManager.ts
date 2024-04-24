import { Player } from '../Player/Player';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { StateMachine } from '../State/StateMachine';
import { PlayerData, clonePlayerData } from './Clone';
import { InputAction } from '../../input/GamePadInput';

export class PlayerStateHistoryManager {
  private readonly PlayerStateSnapShots: Array<Array<PlayerData>>;
  private readonly Players: Array<Player>;
  private readonly StateMachines: Array<StateMachine>;

  constructor(players: Array<Player>, stateMachines: Array<StateMachine>) {
    this.Players = players;
    this.PlayerStateSnapShots = new Array<Array<PlayerData>>(2);
    this.StateMachines = stateMachines;
    for (let index = 0; index < this.Players.length; index++) {
      this.PlayerStateSnapShots[index] = new Array<PlayerData>(1000);
    }
  }

  RecordStateSnapShot(currentFrame: number): void {
    const upperBound = this.Players.length;

    for (let index = 0; index < upperBound; index++) {
      const PlayerStateSnapShotHistory = this.PlayerStateSnapShots[index];
      PlayerStateSnapShotHistory[currentFrame] = clonePlayerData(
        this.Players[index]
      );
    }
  }

  GetStateSnapShot(frame: number, player: number): PlayerData | null {
    return this.PlayerStateSnapShots?.[player]?.[frame] ?? null;
  }

  SetPlayerStateToFrame(frame: number, playerIndex: number) {
    const p = this.Players[playerIndex];
    const PD = this.GetStateSnapShot(frame, playerIndex);
    if (PD) {
      p.SetPlayerState(PD);
      this.StateMachines[playerIndex].ForceStateForRollback(
        p.CurrentStateMachineState,
        p.CurrentStateMachineStateFrame
      );
    }
  }
}
