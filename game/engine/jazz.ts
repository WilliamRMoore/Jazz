import { InputAction } from './input/Input';
import { FlatVec } from './physics/vector';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from './entity/playerOrchestrator';
import { defaultStage, Stage, WallStage } from './stage/stageMain';
import { PlayerAttacks } from './systems/attack';
import { Gravity } from './systems/gravity';
import { RecordHistory } from './systems/history';
import { LedgeGrabDetection } from './systems/ledgeGrabDetection';
import { OutOfBoundsCheck } from './systems/outOfBounds';
import { PlatformDetection } from './systems/platformCollision';
import { PlayerCollisionDetection } from './systems/playerCollision';
import { PlayerInput } from './systems/playerInput';
import { PlayerSensors } from './systems/sensors';
import { ShieldRegen } from './systems/shieldRegen';
import { StageCollisionDetection } from './systems/stageCollision';
import { Flags } from './systems/flags';
import { ApplyVelocity } from './systems/velocity';
import { ApplyVelocityDecay } from './systems/velocityDecay';
import { AddNetowrkedPlayers, World } from './world/world';
import { PlayerGrabs } from './systems/grab';
import { GrabMeter } from './systems/grabMeter';
import { CharacterConfig } from '../character/shared';
import { WallKick } from './systems/wallKick';
import { RollBackManager } from './managers/rollBack';
import { IInputStore } from './managers/inputManager';

export interface IJazzLocal {
  get World(): World | undefined;
  Init(CharacterConfig: Array<CharacterConfig>): void;
  UpdateInputForCurrentFrame(ia: InputAction, pIndex: number): void;
  Tick(): void;
}

export type GameLoop = (w: World) => void;

export class JazzLocal implements IJazzLocal {
  private readonly world: World;
  private loop: GameLoop;

  constructor(customLoop?: GameLoop) {
    this.world = new World();
    this.loop = customLoop || DefaultGameLoop;
  }

  public get World(): World {
    return this.world;
  }

  public Init(
    cc: Array<CharacterConfig>,
    positions: Array<FlatVec> | undefined = undefined,
  ): void {
    const s = defaultStage();
    const s2 = WallStage();
    this.world.SetStage(s);
    this.world.SetStage(s2);
    const numberOfPlayers = cc.length;
    for (let i = 0; i < numberOfPlayers; i++) {
      this.addPlayerEntity(cc[i], positions?.[i]);
    }
  }

  private addPlayerEntity(cc: CharacterConfig, pos: FlatVec | undefined) {
    const p = new Player(this.world.PlayerData.PlayerCount, cc);
    if (pos !== undefined) {
      SetPlayerInitialPositionRaw(p, pos.X.Raw, pos.Y.Raw);
    }
    this.world.SetPlayer(p);
  }

  public UpdateInputForCurrentFrame(ia: InputAction, pIndex: number) {
    this.world.PlayerData.InputStore(pIndex).StoreInputForFrame(
      this.world.LocalFrame,
      ia,
    );
  }

  public Tick() {
    const world = this.World;
    world.Pools.Zero();
    let frameTimeStart = performance.now();

    this.loop(this.World);

    let frameTimeDelta = performance.now() - frameTimeStart;

    world.SetFrameTimeForFrame(world.LocalFrame, frameTimeDelta);
    world.SetFrameTimeStampForFrame(world.LocalFrame, frameTimeStart);
    world.LocalFrame++;
  }
}

export class JazzNetwork {
  public readonly World: World;
  private localInputStore!: IInputStore;
  private rollBack!: RollBackManager;
  private loop: GameLoop;
  private localPlayer: { pIndex: number; player: Player } | undefined;
  private remotePlayer: { pIndex: number; player: Player } | undefined;
  private getLocalInput!: () => InputAction;
  private sendLocalInput!: (ia: InputAction) => void;

  constructor() {
    this.World = new World();
    this.loop = DefaultGameLoop;
  }

  SetStage(s: Stage) {
    this.World.SetStage(s);
  }

  SetLocalPlayer(
    cc: CharacterConfig,
    pos: FlatVec,
    pIndex: number,
    getLocalInput: () => InputAction,
    sendLocalInput: (ia: InputAction) => void,
  ) {
    const p = new Player(pIndex, cc);
    SetPlayerInitialPositionRaw(p, pos.X.Raw, pos.Y.Raw);
    this.localPlayer = { pIndex: pIndex, player: p };
    this.getLocalInput = getLocalInput;
    this.sendLocalInput = sendLocalInput;
  }

  SetRemotePlayer(cc: CharacterConfig, pos: FlatVec, pIndex: number) {
    const p = new Player(pIndex, cc);
    SetPlayerInitialPositionRaw(p, pos.X.Raw, pos.Y.Raw);
    this.remotePlayer = { pIndex: pIndex, player: p };
  }

  init() {
    if (this.localPlayer === undefined || this.remotePlayer === undefined) {
      console.error('Did not set players before initiliazing');
    }
    const rb = AddNetowrkedPlayers(
      this.World,
      this.localPlayer!,
      this.remotePlayer!,
    );
    this.rollBack = rb;
    this.localInputStore = this.World.PlayerData.InputStore(
      this.localPlayer!.pIndex,
    );
  }

  public Tick() {
    const rb = this.rollBack;
    rb.UpdateSyncFrame();

    if (!rb.IsWithInFrameAdvantage) {
      //clock alignment?

      return;
    }
    const localIa = this.getLocalInput();
    this.localInputStore.StoreInputForFrame(this.World.LocalFrame, localIa);
    this.sendLocalInput(localIa);
    // send our input here
    if (rb.ShouldRollBack) {
      this.rollback();
    }
    this.tickLoop();
  }

  private rollback() {
    let from = this.rollBack.SyncFrame;
    const to = this.World.LocalFrame;
    const pc = this.World.PlayerData.PlayerCount;
    this.World.LocalFrame = from;
    for (let i = 0; i < pc; i++) {
      const hist = this.World.HistoryData.PlayerComponentHistories[i];
      const p = this.World.PlayerData.Player(i);
      hist.SetPlayerToFrame(p, from);
    }
    this.rollBack.RollBackMode(true);
    from++;
    while (from < to) {
      this.tickLoop();
      from++;
    }
    this.rollBack.RollBackMode(false);
  }

  private tickLoop() {
    const world = this.World;
    world.Pools.Zero();
    let frameTimeStart = performance.now();

    this.loop(this.World);

    let frameTimeDelta = performance.now() - frameTimeStart;

    world.SetFrameTimeForFrame(world.LocalFrame, frameTimeDelta);
    world.SetFrameTimeStampForFrame(world.LocalFrame, frameTimeStart);
    world.LocalFrame++;
  }

  public AddRemoteInputForFrame(
    frame: number,
    frameAdvantage: number,
    ia: InputAction,
  ) {
    this.rollBack.SetRemoteInputForFrame(frame, frameAdvantage, ia);
  }

  public _rollBackManager(): RollBackManager {
    return this.rollBack;
  }
}

export const DefaultGameLoop: GameLoop = (w: World) => {
  Flags(w);
  PlayerInput(w);
  Gravity(w);
  ApplyVelocity(w);
  ApplyVelocityDecay(w);
  PlayerCollisionDetection(w);
  PlatformDetection(w);
  StageCollisionDetection(w);
  WallKick(w);
  LedgeGrabDetection(w);
  PlayerSensors(w);
  PlayerAttacks(w);
  ShieldRegen(w);
  GrabMeter(w);
  PlayerGrabs(w);
  OutOfBoundsCheck(w);
  RecordHistory(w);
};
