import { Player } from '../Player/Player';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { StateMachine } from '../State/StateMachine';
import { PlayerData, clonePlayerData } from './Clone';

export class PlayerStateHistoryManager {
  private readonly PlayerStateSnapShots: Array<Array<PlayerData>>;
  private readonly Players: Array<Player>;
  private readonly FSM: FrameStorageManager;
  private readonly StateMachines: Array<StateMachine>;

  constructor(
    players: Array<Player>,
    stateMachines: Array<StateMachine>,
    fsm: FrameStorageManager
  ) {
    this.Players = players;
    this.FSM = fsm;
    this.PlayerStateSnapShots = new Array<Array<PlayerData>>(2);
    this.StateMachines = stateMachines;
    for (let index = 0; index < this.Players.length; index++) {
      this.PlayerStateSnapShots[index] = new Array<PlayerData>(1000);
    }
  }

  RecordStateSnapShot(): void {
    const upperBound = this.Players.length;
    const currentFrame = this.FSM.LocalFrame;

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

  SetPlayerStateToFrame(frame: number) {
    const upperBound = this.Players.length;

    for (let i = 0; i < upperBound; i++) {
      const p = this.Players[i];
      const pd = this.GetStateSnapShot(frame, i);
      p.SetPlayerState(pd);
      const sm = this.StateMachines[i];
      sm.ForceState(
        p.CurrentStateMachineState,
        p.CurrentStateMachineStateFrame
      );
    }
  }
}

// export function SetPlayerState(pd: PlayerData, p: Player) {

// }
