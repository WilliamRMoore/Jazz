import { CharacterConfig } from '../../character/shared';
import { InputAction } from '../../input/Input';
import { PlayerSnapShot } from '../entity/componentHistory';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from '../entity/playerOrchestrator';
import { IJazz, Jazz } from '../jazz';
import { FlatVec } from '../physics/vector';
import { World } from '../world/world';
import { PlayerDebugAdapter } from './playerDebugger';

export interface IJazzDebugger extends IJazz {
  readonly playerDebuggers: Array<PlayerDebugAdapter>;
  AddPlayerEntity(cc: CharacterConfig, pos: FlatVec | undefined): void;
}

export class JazzDebugger implements IJazzDebugger {
  readonly playerDebuggers = new Array<PlayerDebugAdapter>();
  private jazz: Jazz;
  private world: World;
  private paused: boolean = false;
  private previousInput: InputAction | undefined = undefined;
  private advanceFrame: boolean = false;

  constructor() {
    this.jazz = new Jazz();
    this.world = this.jazz.World;
  }

  public AddPlayerEntity(cc: CharacterConfig, pos: FlatVec | undefined): void {
    const p = new Player(this.World.PlayerData.PlayerCount, cc);
    if (pos !== undefined) {
      SetPlayerInitialPositionRaw(p, pos.X.Raw, pos.Y.Raw);
    }
    this.jazz.World.SetPlayer(p);
    const pd = new PlayerDebugAdapter(p, this.world);
    this.playerDebuggers.push(pd);
  }

  public UpdateInputForCurrentFrame(ia: InputAction, pIndex: number): void {
    this.togglePause(ia);
    const frame = this.world.LocalFrame;
    if (this.paused) {
      if (this.advanceOneFrame(ia)) {
        this.advanceFrame = true;
        if (
          this.world.PlayerData.InputStore(pIndex).GetInputForFrame(frame) ===
          undefined
        ) {
          this.jazz.UpdateInputForCurrentFrame(ia, pIndex);
        }
      }
      this.previousInput = ia;
      return;
    }

    if (
      this.world.PlayerData.InputStore(pIndex).GetInputForFrame(frame) ===
      undefined
    ) {
      this.jazz.UpdateInputForCurrentFrame(ia, pIndex);
    }

    this.previousInput = ia;
  }

  public Init(
    ccs: Array<CharacterConfig>,
    positions: Array<FlatVec> | undefined = undefined
  ): void {
    this.jazz.Init(ccs, positions);
    const pl = this.world.PlayerData.PlayerCount;
    for (let i = 0; i < pl; i++) {
      const pd = new PlayerDebugAdapter(
        this.world.PlayerData.Player(i),
        this.world
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

function GetPlayerDataForFrame(
  pId: number,
  frame: number,
  w: World
): PlayerSnapShot {
  const hist = w.HistoryData.PlayerComponentHistories[pId];

  const r = {
    Shield: hist.ShieldHistory[frame],
    Position: hist.PositionHistory[frame],
    FSMInfo: hist.FsmInfoHistory[frame],
    Damage: hist.DamageHistory[frame],
    Velocity: hist.VelocityHistory[frame],
    Flags: hist.FlagsHistory[frame],
    PlayerHitStop: hist.PlayerHitStopHistory[frame],
    PlayerHitStun: hist.PlayerHitStunHistory[frame],
    LedgeDetector: hist.LedgeDetectorHistory[frame],
    Sensors: hist.SensorsHistory[frame],
    Ecb: hist.EcbHistory[frame],
    Jump: hist.JumpHistroy[frame],
    Attack: hist.AttackHistory[frame],
    Grab: hist.GrabHistory[frame],
    GrabMeter: hist.GrabMeterHistory[frame],
  } as PlayerSnapShot;

  return r;
}
