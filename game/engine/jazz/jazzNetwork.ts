import { CharacterConfig } from '../../character/shared';
import {
  Player,
  SetPlayerInitialPositionRaw,
} from '../entity/playerOrchestrator';
import { InputAction } from '../input/Input';
import { IInputStore } from '../managers/inputManager';
import { RollBackManager } from '../managers/rollBack';
import { FlatVec } from '../physics/vector';
import { Stage } from '../stage/stageMain';
import { SetPlayerToFrame } from '../world/stateModules';
import { World, AddNetowrkedPlayers } from '../world/world';
import { DefaultGameLoop } from './jazzGameLoops';
import { GameLoop } from './jazzLocal';

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
      const p = this.World.PlayerData.Player(i);
      this.setPlayerToFrame(p, from);
    }
    this.rollBack.RollBackMode(true);
    from++;
    while (from < to) {
      this.tickLoop();
      from++;
    }
    this.rollBack.RollBackMode(false);
  }

  private setPlayerToFrame(p: Player, frameNumber: number) {
    SetPlayerToFrame(p, frameNumber, this.World);
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
