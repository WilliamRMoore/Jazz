import { envConfig, MainConfig } from '../config/main-config';
import { PlayerDebugAdapter } from '../debug/playerDebugger';
import { Player } from '../entity/playerOrchestrator';
import { StateMachine } from '../finiteStateMachines/player/PlayerStateMachine';
import { InputStore, RemoteInputManager } from '../managers/inputManager';
import { RollBackManager } from '../managers/rollBack';
import { Stage } from '../stage/stageMain';
import { InitPlayerHistory } from '../systems/history';
import {
  createEmptyHistoryData,
  HistoryData,
  PlayerState,
  PoolContainer,
  StageWorldState
} from './stateModules';

export class World {
  private localFrame = 0;
  public readonly DebugAdapters: Array<PlayerDebugAdapter> = [];
  public readonly StageData: StageWorldState = new StageWorldState();
  public readonly PlayerData: PlayerState = new PlayerState();
  public readonly HistoryData: HistoryData = new HistoryData();
  private readonly FrameTimes: Array<number> = [];
  private readonly FrameTimeStamps: Array<number> = [];
  public readonly Pools: PoolContainer;
  public LocalFrameGet = () => this.localFrame;

  constructor(mc: MainConfig | undefined = undefined) {
    if (mc === undefined) {
      mc = envConfig as MainConfig;
    }
    this.Pools = new PoolContainer(mc);
  }

  public get PreviousFrame(): number {
    return this.localFrame < 1 ? 0 : this.localFrame - 1;
  }

  public get LocalFrame(): number {
    return this.localFrame;
  }

  public set LocalFrame(f: number) {
    this.localFrame = f;
  }

  public SetPlayer(p: Player): void {
    this.PlayerData.AddPlayer(p);
    this.PlayerData.AddStateMachine(new StateMachine(p, this));
    this.PlayerData.AddInputStore(new InputStore(), this.localFrame);
    const pdb = createEmptyHistoryData();
    this.HistoryData.PlayerHistoryDB.push(pdb);
    InitPlayerHistory(p, this);
    this.DebugAdapters.push(new PlayerDebugAdapter(p, this));
  }

  public SetStage(s: Stage) {
    this.StageData.Stages.push(s);
  }

  public GetFrameTimeForFrame(frame: number): number | undefined {
    return this.FrameTimes[frame];
  }

  public SetFrameTimeForFrame(frame: number, frameTime: number): void {
    this.FrameTimes[frame] = frameTime;
  }

  public SetFrameTimeStampForFrame(frame: number, timeStamp: number): void {
    this.FrameTimeStamps[frame] = timeStamp;
  }

  public GetFrameTimeStampForFrame(frame: number): number {
    return this.FrameTimeStamps[frame];
  }

  public GetRentedVecsForFrame(frame: number): number {
    return this.HistoryData.RentedVecHistory[frame];
  }

  public GetRentedColResForFrame(frame: number): number {
    return this.HistoryData.RentedColResHsitory[frame];
  }

  public GetRentedProjResForFrame(frame: number): number {
    return this.HistoryData.RentedProjResHistory[frame];
  }

  public GetRentedAtkResForFrame(frame: number): number {
    return this.HistoryData.RentedAtkResHistory[frame];
  }

  public GetRentedActiveHitBubblesForFrame(frame: number): number {
    return this.HistoryData.RentedAtiveHitBubHistory[frame];
  }

  public GetRentedClosestPointsForFrame(frame: number): number {
    return this.HistoryData.RentedClosestPoints[frame];
  }

  public GetRentedECBDtosForFrame(frame: number): number {
    return this.HistoryData.RentedECBDtos[frame];
  }

  public GetRentedAABBDtosForFrame(frame: number): number {
    return this.HistoryData.RentedAABBDtos[frame];
  }

  public SetPoolHistory(): void {
    const frame = this.LocalFrame;
    const histDat = this.HistoryData;
    const pools = this.Pools;
    histDat.RentedVecHistory[frame] = pools.VecPool.ActiveCount;
    histDat.RentedColResHsitory[frame] = pools.ColResPool.ActiveCount;
    histDat.RentedProjResHistory[frame] = pools.ProjResPool.ActiveCount;
    histDat.RentedAtkResHistory[frame] = pools.AtkResPool.ActiveCount;
    histDat.RentedAtiveHitBubHistory[frame] =
      pools.ActiveHitBubbleDtoPool.ActiveCount;
    histDat.RentedClosestPoints[frame] = pools.ClstsPntsResPool.ActiveCount;
    histDat.RentedECBDtos[frame] = pools.DiamondPool.ActiveCount;
    histDat.RentedAABBDtos[frame] = pools.AABBDTOPool.ActiveCount;
  }

  public AddNetworkedPlayers(
    local: NetworkPlayers,
    remote: NetworkPlayers
  ) {
    if (local.pIndex < remote.pIndex) {
      this.SetPlayer(local.player);
      return this.setRemotePlayer(remote.player);
    } else {
      const rb = this.setRemotePlayer(remote.player);
      this.SetPlayer(local.player);
      return rb;
    }
  }

  private setRemotePlayer(remotePlayer: Player) {
    this.PlayerData.AddPlayer(remotePlayer);
    this.PlayerData.AddStateMachine(new StateMachine(remotePlayer, this));
    const remoteInputStore = new InputStore();
    const remoteInputManager = new RemoteInputManager(remoteInputStore);
    const rb = new RollBackManager(this.LocalFrameGet, remoteInputManager);
    this.PlayerData.AddInputStore(remoteInputManager, 0);
    const pdb = createEmptyHistoryData();
    this.HistoryData.PlayerHistoryDB.push(pdb);
    InitPlayerHistory(remotePlayer, this);
    this.DebugAdapters.push(new PlayerDebugAdapter(remotePlayer, this));
    return rb;
  }
}

export type NetworkPlayers = { pIndex: number; player: Player };
