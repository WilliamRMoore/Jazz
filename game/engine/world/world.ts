import { MainConfig, envConfig } from '../config/main-config';
import { ComponentHistory } from '../entity/componentHistory';
import { Player } from '../entity/playerOrchestrator';
import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { InputStore, RemoteInputManager } from '../managers/inputManager';
import { RollBackManager } from '../managers/rollBack';
import { Stage } from '../stage/stageMain';
import { InitPlayerHistory } from '../systems/history';
import {
  HistoryData,
  PlayerState,
  PoolContainer,
  StageWorldState,
} from './stateModules';

export class World {
  private localFrame = 0;
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
    const compHist = new ComponentHistory();
    compHist.BaseConfigValues.LedgeDetectorWidth =
      p.LedgeDetector.Width.AsNumber;
    compHist.BaseConfigValues.LedgeDetectorHeight =
      p.LedgeDetector.Height.AsNumber;
    compHist.BaseConfigValues.ShieldOffset = p.Shield.YOffsetConstant.AsNumber;
    p.HurtCircles.HurtCapsules.forEach((hc) =>
      compHist.BaseConfigValues.HurtCapsules.push(hc),
    );
    this.HistoryData.PlayerComponentHistories.push(compHist);
    InitPlayerHistory(p, this);
  }

  public SetStage(s: Stage) {
    this.StageData.Stages.push(s);
  }

  public GetComponentHistory(index: number): ComponentHistory | undefined {
    return this.HistoryData.PlayerComponentHistories[index];
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
  }
}

type NetworkPlayers = { pIndex: number; player: Player };
export function AddNetowrkedPlayers(
  w: World,
  local: NetworkPlayers,
  remote: NetworkPlayers,
) {
  if (local.pIndex < remote.pIndex) {
    w.SetPlayer(local.player);
    return setRemotePlayer(w, remote.player);
  } else {
    const rb = setRemotePlayer(w, remote.player);
    w.SetPlayer(local.player);
    return rb;
  }
}

function setRemotePlayer(world: World, remotePlayer: Player) {
  world.PlayerData.AddPlayer(remotePlayer);
  world.PlayerData.AddStateMachine(new StateMachine(remotePlayer, world));
  const remoteInputStore = new InputStore();
  const remoteInputManager = new RemoteInputManager(remoteInputStore);
  const rb = new RollBackManager(world.LocalFrameGet, remoteInputManager);
  world.PlayerData.AddInputStore(remoteInputManager, 0);
  const compHist = new ComponentHistory();
  compHist.BaseConfigValues.LedgeDetectorWidth =
    remotePlayer.LedgeDetector.Width.AsNumber;
  compHist.BaseConfigValues.LedgeDetectorHeight =
    remotePlayer.LedgeDetector.Height.AsNumber;
  compHist.BaseConfigValues.ShieldOffset =
    remotePlayer.Shield.YOffsetConstant.AsNumber;
  remotePlayer.HurtCircles.HurtCapsules.forEach((hc) =>
    compHist.BaseConfigValues.HurtCapsules.push(hc),
  );
  world.HistoryData.PlayerComponentHistories.push(compHist);

  return rb;
}
