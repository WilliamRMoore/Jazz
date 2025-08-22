import { StateMachine } from '../player/finite-state-machine/PlayerStateMachine';
import { InputAction } from '../../input/Input';
import { InputStoreLocal } from '../engine-state-management/Managers';
import { ComponentHistory } from '../player/playerComponents';
import { Player } from '../player/playerOrchestrator';
import { Stage } from '../stage/stageComponents';
import { PooledVector } from '../pools/PooledVector';
import { Pool } from '../pools/Pool';
import { CollisionResult } from '../pools/CollisionResult';
import { ProjectionResult } from '../pools/ProjectResult';
import { AttackResult } from '../pools/AttackResult';
import { ClosestPointsResult } from '../pools/ClosestPointsResult';
import { ActiveHitBubblesDTO } from '../pools/ActiveAttackHitBubbles';

export class World {
  private players: Array<Player> = [];
  private stage?: Stage;
  private stateMachines: Array<StateMachine> = [];
  public readonly ActiveHitBubbleDtoPool: Pool<ActiveHitBubblesDTO>;
  public readonly VecPool: Pool<PooledVector>;
  public readonly ColResPool: Pool<CollisionResult>;
  public readonly ProjResPool: Pool<ProjectionResult>;
  public readonly AtkResPool: Pool<AttackResult>;
  public readonly ClstsPntsResPool: Pool<ClosestPointsResult>;
  public localFrame = 0;
  private readonly InputStore: Array<InputStoreLocal<InputAction>> = [];
  private readonly PlayerComponentHistories: Array<ComponentHistory> = [];
  private readonly RentedVecHistory: Array<number> = [];
  private readonly RentedColResHsitory: Array<number> = [];
  private readonly RentedProjResHistory: Array<number> = [];
  private readonly RentedAtkResHistory: Array<number> = [];
  private readonly RentedAtiveHitBubHistory: Array<number> = [];
  private readonly FrameTimes: Array<number> = [];
  private readonly FrameTimeStamps: Array<number> = [];

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
  }

  public SetPlayer(p: Player): void {
    this.players?.push(p);
    this.stateMachines.push(new StateMachine(p, this));
    this.InputStore.push(new InputStoreLocal<InputAction>());
    const compHist = new ComponentHistory();
    compHist.StaticPlayerHistory.LedgeDetectorWidth = p.LedgeDetector.Width;
    compHist.StaticPlayerHistory.ledgDetecorHeight = p.LedgeDetector.Height;
    p.HurtBubbles.HurtCapsules.forEach((hc) =>
      compHist.StaticPlayerHistory.HurtCapsules.push(hc)
    );
    this.PlayerComponentHistories.push(compHist);
  }

  public SetStage(s: Stage) {
    this.stage = s;
  }

  public GetPlayer(index: number): Player | undefined {
    return this.players[index];
  }

  public GetStateMachine(index: number): StateMachine | undefined {
    return this.stateMachines[index];
  }

  public GetComponentHistory(index: number): ComponentHistory | undefined {
    return this.PlayerComponentHistories[index];
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
    return this.RentedVecHistory[frame];
  }

  public GetRentedColResForFrame(frame: number): number {
    return this.RentedColResHsitory[frame];
  }

  public GetRentedProjResForFrame(frame: number): number {
    return this.RentedProjResHistory[frame];
  }

  public GetRentedAtkResForFrame(frame: number): number {
    return this.RentedAtkResHistory[frame];
  }

  public GetRentedActiveHitBubblesForFrame(frame: number): number {
    return this.RentedAtiveHitBubHistory[frame];
  }

  public SetPoolHistory(): void {
    const frame = this.localFrame;
    this.RentedVecHistory[frame] = this.VecPool.ActiveCount;
    this.RentedColResHsitory[frame] = this.ColResPool.ActiveCount;
    this.RentedProjResHistory[frame] = this.ProjResPool.ActiveCount;
    this.RentedAtkResHistory[frame] = this.AtkResPool.ActiveCount;
    this.RentedAtiveHitBubHistory[frame] =
      this.ActiveHitBubbleDtoPool.ActiveCount;
  }

  public get Stage(): Stage {
    return this.stage!;
  }

  public get Players(): Array<Player> {
    return this.players;
  }

  public get StateMachines(): Array<StateMachine> {
    return this.stateMachines;
  }

  public get ComponentHistories(): Array<ComponentHistory> {
    return this.PlayerComponentHistories;
  }

  public GetPlayerPreviousInput(playerId: number): InputAction | undefined {
    const localFrame = this.localFrame;
    return this.InputStore[playerId].GetInputForFrame(
      localFrame - 1 >= 0 ? localFrame - 1 : 0
    );
  }

  public GetPlayerCurrentInput(playerId: number): InputAction | undefined {
    return this.InputStore[playerId].GetInputForFrame(this.localFrame);
  }

  public GetPlayeInputForFrame(
    playerId: number,
    frame: number
  ): InputAction | undefined {
    return this.InputStore[playerId].GetInputForFrame(frame);
  }

  public GetInputManager(playerIndex: number): InputStoreLocal<InputAction> {
    return this.InputStore[playerIndex];
  }

  public get PlayerCount(): number {
    return this.players.length;
  }
}
