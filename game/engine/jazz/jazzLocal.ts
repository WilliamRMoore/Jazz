import { CharacterConfig } from '../../character/shared';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from '../entity/playerOrchestrator';
import { InputAction } from '../input/Input';
import { FlatVec } from '../physics/vector';
import { defaultStage, Stage, WallStage } from '../stage/stageMain';
import { World } from '../world/world';
import { DefaultGameLoop } from './jazzGameLoops';
import { IJazzEngine, GameLoop } from './IJazzEngine';

export class JazzLocal implements IJazzEngine {
  private readonly world: World;
  private loop: GameLoop;

  constructor(customLoop?: GameLoop) {
    this.world = new World();
    this.loop = customLoop || DefaultGameLoop;
  }

  public get World(): World {
    return this.world;
  }

  public SetPlayer(cc: CharacterConfig, pos: FlatVec) {
    const p = new Player(this.World.PlayerData.PlayerCount, cc);
    SetPlayerInitialPositionRaw(p, pos.X.Raw, pos.Y.Raw);
    this.World.SetPlayer(p);
  }

  public SetStage(s: Stage) {
    this.World.SetStage(s);
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
    this.world.StorePlayerInput(pIndex, ia);
  }

  public Tick() {
    this.world.Tick(this.loop);
  }
}
