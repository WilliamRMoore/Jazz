import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { InputAction } from '../../input/Input';
import { InputStoreLocal } from '../engine-state-management/Managers';
import { ComponentHistory } from '../entity/componentHistory';
import { Player } from '../entity/playerOrchestrator';
import { Stage } from '../stage/stageMain';
import { PooledVector } from '../pools/PooledVector';
import { Pool } from '../pools/Pool';
import { CollisionResult } from '../pools/CollisionResult';
import { ProjectionResult } from '../pools/ProjectResult';
import { AttackResult } from '../pools/AttackResult';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { ActiveHitBubblesDTO } from '../pools/ActiveAttackBubbles';
import { DiamondDTO } from '../pools/ECBDiamonDTO';
import { InitPlayerHistory } from '../systems/history';
import { PlayerDebugAdapter } from '../debug/playerDebugger';

export type PlayerData = {
  PlayerCount: number;
  StateMachine: (playerId: number) => StateMachine;
  InputStore: (playerId: number) => InputStoreLocal<InputAction>;
  Player: (playerId: number) => Player;
  AddPlayer: (p: Player) => void;
  AddStateMachine: (sm: StateMachine) => void;
  AddInputStore: (is: InputStoreLocal<InputAction>) => void;
};

export type StageData = {
  Stage: Stage;
};

export type Pools = {
  ActiveHitBubbleDtoPool: Pool<ActiveHitBubblesDTO>;
  VecPool: Pool<PooledVector>;
  ColResPool: Pool<CollisionResult>;
  ProjResPool: Pool<ProjectionResult>;
  AtkResPool: Pool<AttackResult>;
  ClstsPntsResPool: Pool<ClosestPointsResult>;
  DiamondPool: Pool<DiamondDTO>;
  Zero: () => void;
};

export type HistoryData = {
  PlayerComponentHistories: Array<ComponentHistory>;
  RentedVecHistory: Array<number>;
  RentedColResHsitory: Array<number>;
  RentedProjResHistory: Array<number>;
  RentedAtkResHistory: Array<number>;
  RentedAtiveHitBubHistory: Array<number>;
};

class PlayerState implements PlayerData {
  private players: Array<Player> = [];
  private stateMachines: Array<StateMachine> = [];
  private inputStore: Array<InputStoreLocal<InputAction>> = [];

  public StateMachine(playerId: number): StateMachine {
    return this.stateMachines[playerId];
  }

  public InputStore(playerId: number): InputStoreLocal<InputAction> {
    return this.inputStore[playerId];
  }

  public Player(playerId: number): Player {
    return this.players[playerId];
  }

  public AddPlayer(p: Player): void {
    this.players.push(p);
  }

  public AddStateMachine(sm: StateMachine): void {
    this.stateMachines.push(sm);
  }

  public AddInputStore(is: InputStoreLocal<InputAction>): void {
    this.inputStore.push(is);
  }

  public get PlayerCount(): number {
    return this.players.length;
  }
}

class StageWorldState implements StageData {
  public Stage!: Stage;
}

class PoolContainer implements Pools {
  public readonly ActiveHitBubbleDtoPool: Pool<ActiveHitBubblesDTO>;
  public readonly VecPool: Pool<PooledVector>;
  public readonly ColResPool: Pool<CollisionResult>;
  public readonly ProjResPool: Pool<ProjectionResult>;
  public readonly AtkResPool: Pool<AttackResult>;
  public readonly ClstsPntsResPool: Pool<ClosestPointsResult>;
  public readonly DiamondPool: Pool<DiamondDTO>;

  constructor() {
    this.ActiveHitBubbleDtoPool = new Pool<ActiveHitBubblesDTO>(
      20,
      () => new ActiveHitBubblesDTO()
    );
    this.VecPool = new Pool<PooledVector>(500, () => new PooledVector());
    this.ColResPool = new Pool<CollisionResult>(
      100,
      () => new CollisionResult()
    );
    this.ProjResPool = new Pool<ProjectionResult>(
      200,
      () => new ProjectionResult()
    );
    this.AtkResPool = new Pool<AttackResult>(100, () => new AttackResult());
    this.ClstsPntsResPool = new Pool<ClosestPointsResult>(
      400,
      () => new ClosestPointsResult()
    );
    this.DiamondPool = new Pool<DiamondDTO>(50, () => new DiamondDTO());
  }
  public Zero(): void {
    this.ActiveHitBubbleDtoPool.Zero();
    this.VecPool.Zero();
    this.ColResPool.Zero();
    this.ProjResPool.Zero();
    this.AtkResPool.Zero();
    this.ClstsPntsResPool.Zero();
    this.DiamondPool.Zero();
  }
}

class History implements HistoryData {
  public readonly PlayerComponentHistories: Array<ComponentHistory> = [];
  public readonly RentedVecHistory: Array<number> = [];
  public readonly RentedColResHsitory: Array<number> = [];
  public readonly RentedProjResHistory: Array<number> = [];
  public readonly RentedAtkResHistory: Array<number> = [];
  public readonly RentedAtiveHitBubHistory: Array<number> = [];
}

export class World {
  private localFrame = 0;
  public readonly StageData: StageWorldState = new StageWorldState();
  public readonly PlayerData: PlayerState = new PlayerState();
  public readonly HistoryData: History = new History();
  private readonly FrameTimes: Array<number> = [];
  private readonly FrameTimeStamps: Array<number> = [];
  public readonly Pools: PoolContainer = new PoolContainer();

  public get PreviousFrame(): number {
    return this.localFrame === 0 ? 0 : this.localFrame - 1;
  }

  public get LocalFrame(): number {
    return this.localFrame;
  }

  public set LocalFrame(f: number) {
    this.localFrame = f;
    if (Number.isInteger(f) === false) {
      console.error(
        'World local frame was set to a number value other than an integer.'
      );
    }
  }

  public SetPlayer(p: Player): void {
    this.PlayerData.AddPlayer(p);
    this.PlayerData.AddStateMachine(new StateMachine(p, this));
    this.PlayerData.AddInputStore(new InputStoreLocal<InputAction>());
    const compHist = new ComponentHistory(p);
    compHist.StaticPlayerHistory.LedgeDetectorWidth =
      p.LedgeDetector.Width.AsNumber;
    compHist.StaticPlayerHistory.ledgDetecorHeight =
      p.LedgeDetector.Height.AsNumber;
    compHist.StaticPlayerHistory.ShieldOffset =
      p.Shield.YOffsetConstant.AsNumber;
    p.HurtCircles.HurtCapsules.forEach((hc) =>
      compHist.StaticPlayerHistory.HurtCapsules.push(hc)
    );
    this.HistoryData.PlayerComponentHistories.push(compHist);
    InitPlayerHistory(p, this);
  }

  public SetStage(s: Stage) {
    this.StageData.Stage = s;
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
  }
}
