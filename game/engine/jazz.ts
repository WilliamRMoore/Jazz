import { DefaultCharacterConfig } from '../character/default';
import { InputAction } from '../input/Input';
import { FlatVec } from './physics/vector';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from './entity/playerOrchestrator';
import { defaultStage, WallStage } from './stage/stageMain';
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
import { World } from './world/world';
import { PlayerGrabs } from './systems/grab';
import { GrabMeter } from './systems/grabMeter';
import { CharacterConfig } from '../character/shared';
import { WallSlide } from './systems/wallSlide';

export interface IJazz {
  get World(): World | undefined;
  Init(CharacterConfig: Array<CharacterConfig>): void;
  UpdateInputForCurrentFrame(ia: InputAction, pIndex: number): void;
  Tick(): void;
}

export type GameLoop = (w: World) => void;

export class Jazz implements IJazz {
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

export const DefaultGameLoop: GameLoop = (w: World) => {
  Flags(w);
  PlayerInput(w);
  Gravity(w);
  ApplyVelocity(w);
  ApplyVelocityDecay(w);
  PlayerCollisionDetection(w);
  PlatformDetection(w);
  StageCollisionDetection(w);
  WallSlide(w);
  LedgeGrabDetection(w);
  PlayerSensors(w);
  PlayerAttacks(w);
  ShieldRegen(w);
  GrabMeter(w);
  PlayerGrabs(w);
  OutOfBoundsCheck(w);
  RecordHistory(w);
};
