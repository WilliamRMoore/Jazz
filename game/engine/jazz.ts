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
import { ShieldRegen } from './systems/shieldRegen';
import { StageCollisionDetection } from './systems/stageCollision';
import { TimedFlags } from './systems/timedFlags';
import { ApplyVelocity } from './systems/velocity';
import { ApplyVelocityDecay } from './systems/velocityDecay';
import { World } from './world/world';
import { PlayerGrabs } from './systems/grab';
import { GrabMeter } from './systems/grabMeter';
import { CharacterConfig } from '../character/shared';

export interface IJazz {
  get World(): World | undefined;
  Init(CharacterConfig: Array<CharacterConfig>): void;
  UpdateInputForCurrentFrame(ia: InputAction, pIndex: number): void;
  Tick(): void;
}

export class Jazz implements IJazz {
  private readonly world: World;
  private loop: (w: World) => void;

  constructor() {
    this.world = new World();
    this.loop = TestLoop;
  }

  public get World(): World {
    return this.world;
  }

  public Init(
    cc: Array<CharacterConfig>,
    positions: Array<FlatVec> | undefined = undefined
  ): void {
    const s = defaultStage();
    this.world.SetStage(s);
    const numberOfPlayers = cc.length;
    for (let i = 0; i < numberOfPlayers; i++) {
      this.AddPlayerEntity(cc[i], positions?.[i]);
    }

    RecordHistory(this.world);
  }

  public AddPlayerEntity(cc: CharacterConfig, pos: FlatVec | undefined) {
    const p = new Player(this.world.PlayerData.PlayerCount, cc);
    if (pos !== undefined) {
      SetPlayerInitialPositionRaw(p, pos.X.Raw, pos.Y.Raw);
    }
    this.world.SetPlayer(p);
  }

  public UpdateInputForCurrentFrame(ia: InputAction, pIndex: number) {
    this.world.PlayerData.InputStore(pIndex).StoreInputForFrame(
      this.world.LocalFrame,
      ia
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

function TestLoop(w: World) {
  PlayerInput(w);

  Gravity(w);

  ApplyVelocity(w);

  ApplyVelocityDecay(w);

  PlayerCollisionDetection(w);

  PlatformDetection(w);

  StageCollisionDetection(w);

  LedgeGrabDetection(w);

  PlayerSensors(w);

  PlayerAttacks(w);

  ShieldRegen(w);

  GrabMeter(w);

  PlayerGrabs(w);

  OutOfBoundsCheck(w);

  TimedFlags(w);

  RecordHistory(w);
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

  public Init(
    ccs: Array<CharacterConfig>,
    positions: Array<FlatVec> | undefined = undefined
  ): void {
    this.jazz.Init(ccs, positions);
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
