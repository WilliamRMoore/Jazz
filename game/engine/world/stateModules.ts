import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { InputAction, NewInputAction } from '../input/Input';
import { ComponentHistory } from '../entity/componentHistory';
import { Player } from '../entity/playerOrchestrator';
import { DeathBoundry, Stage } from '../stage/stageMain';
import { PooledVector } from '../pools/PooledVector';
import { Pool } from '../pools/Pool';
import { CollisionResult } from '../pools/CollisionResult';
import { ProjectionResult } from '../pools/ProjectResult';
import { AttackResult } from '../pools/AttackResult';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { ActiveHitBubblesDTO } from '../pools/ActiveAttackBubbles';
import { DiamondDTO } from '../pools/ECBDiamonDTO';
import { frameNumber } from '../entity/components/attack';
import { MainConfig } from '../config/main-config';
import { IInputStore } from '../managers/inputManager';

export type PlayerData = {
  PlayerCount: number;
  StateMachine: (playerId: number) => StateMachine;
  InputStore: (playerId: number) => IInputStore;
  Player: (playerId: number) => Player;
  AddPlayer: (p: Player) => void;
  AddStateMachine: (sm: StateMachine) => void;
  AddInputStore: (is: IInputStore, currentFrame: frameNumber) => void;
};

export type StageData = {
  Stages: Stage[];
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

export type IHistoryData = {
  PlayerComponentHistories: Array<ComponentHistory>;
  RentedVecHistory: Array<number>;
  RentedColResHsitory: Array<number>;
  RentedProjResHistory: Array<number>;
  RentedAtkResHistory: Array<number>;
  RentedAtiveHitBubHistory: Array<number>;
  RentedClosestPoints: Array<number>;
  RentedECBDtos: Array<number>;
};

export class PlayerState implements PlayerData {
  private players: Array<Player> = [];
  private stateMachines: Array<StateMachine> = [];
  private inputStore: Array<IInputStore> = [];

  public StateMachine(playerId: number): StateMachine {
    return this.stateMachines[playerId];
  }

  public InputStore(playerId: number): IInputStore {
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

  public AddInputStore(is: IInputStore, currentFrame: frameNumber): void {
    for (let i = 0; i <= currentFrame; i++) {
      is.StoreInputForFrame(i, NewInputAction());
    }
    this.inputStore.push(is);
  }

  public get PlayerCount(): number {
    return this.players.length;
  }
}

export class StageWorldState implements StageData {
  public DeathBoundry: DeathBoundry = new DeathBoundry(-100, 1180, -100, 2020);
  public Stages: Stage[] = [];
}

export class PoolContainer implements Pools {
  public readonly ActiveHitBubbleDtoPool: Pool<ActiveHitBubblesDTO>;
  public readonly VecPool: Pool<PooledVector>;
  public readonly ColResPool: Pool<CollisionResult>;
  public readonly ProjResPool: Pool<ProjectionResult>;
  public readonly AtkResPool: Pool<AttackResult>;
  public readonly ClstsPntsResPool: Pool<ClosestPointsResult>;
  public readonly DiamondPool: Pool<DiamondDTO>;

  constructor(mc: MainConfig) {
    this.ActiveHitBubbleDtoPool = new Pool<ActiveHitBubblesDTO>(
      mc.get('PoolSizes.ActiveHitBubblesDTOCount') as number,
      () => new ActiveHitBubblesDTO(),
    );
    this.VecPool = new Pool<PooledVector>(
      mc.get('PoolSizes.PooledVectorCount') as number,
      () => new PooledVector(),
    );
    this.ColResPool = new Pool<CollisionResult>(
      mc.get('PoolSizes.CollisionResultCount') as number,
      () => new CollisionResult(),
    );
    this.ProjResPool = new Pool<ProjectionResult>(
      mc.get('PoolSizes.ProjectionResultCount') as number,
      () => new ProjectionResult(),
    );
    this.AtkResPool = new Pool<AttackResult>(
      mc.get('PoolSizes.AttackResultCount') as number,
      () => new AttackResult(),
    );
    this.ClstsPntsResPool = new Pool<ClosestPointsResult>(
      mc.get('PoolSizes.ClosestPointsResultCount') as number,
      () => new ClosestPointsResult(),
    );
    this.DiamondPool = new Pool<DiamondDTO>(
      mc.get('PoolSizes.DiamondDTOCount') as number,
      () => new DiamondDTO(),
    );
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

export class HistoryData implements IHistoryData {
  public readonly PlayerComponentHistories: Array<ComponentHistory> = [];
  public readonly RentedVecHistory: Array<number> = [];
  public readonly RentedColResHsitory: Array<number> = [];
  public readonly RentedProjResHistory: Array<number> = [];
  public readonly RentedAtkResHistory: Array<number> = [];
  public readonly RentedAtiveHitBubHistory: Array<number> = [];
  public readonly RentedClosestPoints: Array<number> = [];
  public readonly RentedECBDtos: Array<number> = [];
}
