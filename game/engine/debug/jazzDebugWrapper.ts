import { CharacterConfig } from '../../character/shared';
import { InputAction } from '../input/Input';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from '../entity/playerOrchestrator';
import { FlatVec } from '../physics/vector';
import { World } from '../world/world';
import { PlayerDebugAdapter } from './playerDebugger';
import { IJazzLocal, JazzLocal } from '../jazz/jazzLocal';
import { SetPlayerToFrame } from '../jazz/jazzNetwork';

export interface IJazzDebugger extends IJazzLocal {
  readonly playerDebuggers: Array<PlayerDebugAdapter>;
  AddPlayerEntity(cc: CharacterConfig, pos: FlatVec | undefined): void;
}

export class JazzDebugger implements IJazzDebugger {
  readonly playerDebuggers = new Array<PlayerDebugAdapter>();
  public readonly jazz: JazzLocal;
  private world: World;
  private paused: boolean = false;
  private previousInput: InputAction | undefined = undefined;
  private advanceFrame: boolean = false;

  constructor() {
    this.jazz = new JazzLocal();
    this.world = this.jazz.World;
  }

  public AddPlayerEntity(
    cc: CharacterConfig,
    pos: FlatVec | undefined,
  ): PlayerDebugAdapter {
    const p = new Player(this.World.PlayerData.PlayerCount, cc);
    if (pos !== undefined) {
      SetPlayerInitialPositionRaw(p, pos.X.Raw, pos.Y.Raw);
    }
    this.jazz.World.SetPlayer(p);
    const pd = new PlayerDebugAdapter(p, this.world);
    this.playerDebuggers.push(pd);
    return pd;
  }

  public UpdateInputForCurrentFrame(ia: InputAction, pIndex: number): void {
    if (pIndex === 0) {
      this.togglePause(ia);
    }

    const frame = this.world.LocalFrame;
    if (this.paused) {
      if (pIndex === 0 && this.advanceOneFrame(ia)) {
        this.advanceFrame = true;
      }
      if (this.advanceFrame) {
        if (
          this.world.PlayerData.InputStore(pIndex).GetInputForFrame(frame) ===
          undefined
        ) {
          this.jazz.UpdateInputForCurrentFrame(ia, pIndex);
        }
      }
      if (pIndex === 0) {
        this.previousInput = ia;
      }
      return;
    }

    if (
      this.world.PlayerData.InputStore(pIndex).GetInputForFrame(frame) ===
      undefined
    ) {
      this.jazz.UpdateInputForCurrentFrame(ia, pIndex);
    }

    if (pIndex === 0) {
      this.previousInput = ia;
    }
  }

  public Init(
    ccs: Array<CharacterConfig>,
    positions: Array<FlatVec> | undefined = undefined,
  ): void {
    this.jazz.Init(ccs, positions);
    const pl = this.world.PlayerData.PlayerCount;
    for (let i = 0; i < pl; i++) {
      const pd = new PlayerDebugAdapter(
        this.world.PlayerData.Player(i),
        this.world,
      );
      this.playerDebuggers.push(pd);
    }
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

  public StepBackOneFrame(): void {
    if (this.world.LocalFrame <= 0) {
      return;
    }
    this.world.LocalFrame = this.world.LocalFrame - 1;
    const pl = this.world.PlayerData.PlayerCount;
    for (let i = 0; i < pl; i++) {
      const p = this.world.PlayerData.Player(i);
      SetPlayerToFrame(p, this.world.LocalFrame, this.world);
    }
  }

  public get World(): World {
    return this.jazz.World;
  }

  public get IsPaused(): boolean {
    return this.paused;
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
