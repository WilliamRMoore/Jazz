import { DefaultCharacterConfig } from '../character/default';
import { InputAction } from '../input/Input';
import { FlatVec } from './physics/vector';
import { Player } from './player/playerOrchestrator';
import { defaultStage } from './stage/stageMain';
import {
  ApplyVelocty,
  Gravity,
  TimedFlags,
  LedgeGrabDetection,
  OutOfBoundsCheck,
  PlayerAttacks,
  PlayerCollisionDetection,
  PlayerInput,
  RecordHistory,
  StageCollisionDetection,
  PlayerSensors,
  ApplyVeloctyDecay,
  PlatformDetection,
} from './systems/systems';
import { World } from './world/world';

export interface IJazz {
  get World(): World | undefined;
  Init(numberOfPlayers: number, positions: Array<FlatVec>): void;
  Tick(): void;
  UpdateInputForCurrentFrame(ia: InputAction, pIndex: number): void;
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
      p.SetPlayerInitialPosition(pos.X, pos.Y);
    }
    const s = defaultStage();
    this.world.SetStage(s);
  }

  public Tick() {
    let frameTimeStart = performance.now();

    this.tick();

    let frameTimeDelta = performance.now() - frameTimeStart;

    const world = this.World;
    world.SetFrameTimeForFrame(world.localFrame, frameTimeDelta);
    world.SetFrameTimeStampForFrame(world.localFrame, frameTimeStart);
    world.Pools.Zero();
    world.localFrame++;
  }

  public UpdateInputForCurrentFrame(ia: InputAction, pIndex: number) {
    this.UpdateInput(pIndex, ia, this.world.localFrame);
  }

  private UpdateInput(
    pIndex: number,
    inputAction: InputAction,
    frameNumber: number
  ) {
    this.world.PlayerData.InputStore(pIndex).StoreInputForFrame(
      frameNumber,
      inputAction
    );
  }

  private tick() {
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

    PlayerInput(playerData, world);

    Gravity(playerData, stageData);

    ApplyVelocty(playerData);

    ApplyVeloctyDecay(playerData, stageData);

    PlayerCollisionDetection(playerData, pools);

    LedgeGrabDetection(playerData, stageData, pools);

    PlatformDetection(playerData, stageData, frame);

    StageCollisionDetection(playerData, stageData, pools);

    PlayerSensors(world, playerData, pools);

    PlayerAttacks(playerData, historyData, pools, frame);

    OutOfBoundsCheck(playerData, stageData);

    TimedFlags(playerData);

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

  UpdateInputForCurrentFrame(ia: InputAction, pIndex: number): void {
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
