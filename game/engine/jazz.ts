import { DefaultCharacterConfig } from '../character/default';
import { InputAction } from '../input/Input';
import { FlatVec } from './physics/vector';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from './entity/playerOrchestrator';
import { defaultStage } from './stage/stageMain';
import { PlayerAttacks } from './systems/attack';
import { Gravity } from './systems/gravity';
import { RecordHistory } from './systems/history';
import { LedgeGrabDetection } from './systems/ledgeGrabDetection';
import { OutOfBoundsCheck } from './systems/outOfBounds';
import { PlatformDetection } from './systems/platformCollision';
import { PlayerCollisionDetection } from './systems/playerCollision';
import { PlayerInput } from './systems/playerInput';
import { PlayerSensors } from './systems/sensors';
import { SheildRegen } from './systems/shieldRegen';
import { StageCollisionDetection } from './systems/stageCollision';
import { TimedFlags } from './systems/timedFlags';
import { ApplyVelocity } from './systems/velocity';
import { ApplyVelocityDecay } from './systems/velocityDecay';
import { World } from './world/world';
import { PlayerGrabs } from './systems/grab';
import { GrabMeter } from './systems/grabMeter';

export interface IJazz {
  get World(): World | undefined;
  Init(numberOfPlayers: number, positions: Array<FlatVec>): void;
  UpdateInputForCurrentFrame(ia: InputAction, pIndex: number): void;
  Tick(): void;
}

export class Jazz implements IJazz {
  private readonly world: World;

  constructor() {
    this.world = new World();
  }

  public get World(): World {
    return this.world;
  }

  public Init(numberOfPlayers: number, positions: Array<FlatVec>): void {
    for (let i = 0; i < numberOfPlayers; i++) {
      const pos = positions[i];
      const charConfig = new DefaultCharacterConfig();
      const p = new Player(i, charConfig);
      this.world.SetPlayer(p);
      SetPlayerInitialPositionRaw(p, pos.X.Raw, pos.Y.Raw);
    }
    const s = defaultStage();
    this.world.SetStage(s);
  }

  public UpdateInputForCurrentFrame(ia: InputAction, pIndex: number) {
    this.world.PlayerData.InputStore(pIndex).StoreInputForFrame(
      this.world.localFrame,
      ia
    );
  }

  public Tick() {
    let frameTimeStart = performance.now();

    this.logic();

    let frameTimeDelta = performance.now() - frameTimeStart;

    const world = this.World;
    world.SetFrameTimeForFrame(world.localFrame, frameTimeDelta);
    world.SetFrameTimeStampForFrame(world.localFrame, frameTimeStart);
    world.Pools.Zero();
    world.localFrame++;
  }

  private logic() {
    const world = this.world;
    const frame = world.localFrame;
    const playerData = world.PlayerData;
    const playerCount = playerData.PlayerCount;
    const stageData = world.StageData;
    const historyData = world.HistoryData;
    const pools = world.Pools;

    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const player = playerData.Player(playerIndex);
      player?.ECB.UpdatePreviousECB();
    }

    SheildRegen(world);

    TimedFlags(world);

    PlayerInput(world);

    Gravity(world);

    ApplyVelocity(world);

    ApplyVelocityDecay(world);

    PlayerCollisionDetection(world);

    PlatformDetection(world);

    StageCollisionDetection(world);

    LedgeGrabDetection(world);

    PlayerSensors(world);

    PlayerAttacks(world);

    GrabMeter(world);

    PlayerGrabs(world);

    OutOfBoundsCheck(playerData, stageData);

    RecordHistory(world, playerData, historyData, frame);
  }
}

export class JazzDebugger implements IJazz {
  private jazz: Jazz;
  private paused: boolean = false;
  private previousInput: InputAction | undefined = undefined;
  private advanceFrame: boolean = false;

  constructor() {
    this.jazz = new Jazz();
  }

  public UpdateInputForCurrentFrame(ia: InputAction, pIndex: number): void {
    this.togglePause(ia);

    if (this.paused) {
      if (this.advanceOneFrame(ia)) {
        this.advanceFrame = true;
        this.jazz.UpdateInputForCurrentFrame(ia, pIndex);
      }
      this.previousInput = ia;
      return;
    }

    this.jazz.UpdateInputForCurrentFrame(ia, pIndex);
    this.previousInput = ia;
  }

  public Init(numberOfPlayers: number, positions: Array<FlatVec>): void {
    this.jazz.Init(numberOfPlayers, positions);
  }

  public Tick(): void {
    if (this.paused && this.advanceFrame) {
      this.advanceFrame = false;
      this.jazz.Tick();
      return;
    }

    if (!this.paused) {
      this.jazz.Tick();
    }
  }

  public get World(): World {
    return this.jazz.World;
  }

  private togglePause(ia: InputAction): void {
    const PausedPreviouisInput = this.previousInput?.Start ?? false;
    const PausedCurrentInput = ia.Start ?? false;

    if (PausedPreviouisInput === false && PausedCurrentInput) {
      this.paused = !this.paused;
    }
  }

  private advanceOneFrame(ia: InputAction): boolean {
    const selectPressed = ia.Select ?? false;
    const selectHeld = this.previousInput?.Select ?? false;

    return selectPressed && !selectHeld;
  }
}
