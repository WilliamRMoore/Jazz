import { InputAction } from '../input/Input';
import { frameNumber } from '../entity/components/attack';
import { Player, SetPlayerPositionRaw } from '../entity/playerOrchestrator';
import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { StateId } from '../finite-state-machine/stateConfigurations/shared';
import { IInputStore } from '../managers/inputManager';
import { NumberToRaw } from '../math/fixedPoint';
import { World } from '../world/world';
import { PlayerHistoryTable } from '../world/stateModules';
import { PlayerStateHistory } from '../systems/history';

const ntr = NumberToRaw;

export class PlayerDebugAdapter {
  private world: World;
  private hist: PlayerHistoryTable;
  private player: Player;
  private pId: number;
  private stateMachine: StateMachine;
  private inputStore: IInputStore;

  constructor(p: Player, w: World) {
    this.player = p;
    this.world = w;
    this.stateMachine = w.PlayerData.StateMachine(p.ID);
    this.inputStore = w.PlayerData.InputStore(p.ID);
    this.hist = w.HistoryData.PlayerHistoryDB[p.ID];
    this.pId = p.ID;
  }

  public get Player(): Player | undefined {
    return this.player;
  }

  public ForceState(stateId: StateId) {
    this.stateMachine.ForceState(stateId);
  }

  public SetInputs(inputs: Map<frameNumber, InputAction>) {
    inputs.forEach((v, k) => {
      this.inputStore.StoreInputForFrame(k, v);
    });
  }

  public MoveTo(x: number, y: number) {
    SetPlayerPositionRaw(this.player, ntr(x), ntr(y));
  }

  public ForceStateFrame(frame: frameNumber) {
    this.player.FSMInfo._db_currentStateFrame = frame;
  }

  public LookLeft() {
    this.player.Flags.FaceLeft();
  }

  public LookRight() {
    this.player.Flags.FaceRight();
  }

  public set VelX(velX: number) {
    this.player.Velocity.X.SetFromRaw(ntr(velX));
  }

  public set VelY(velY: number) {
    this.player.Velocity.Y.SetFromRaw(ntr(velY));
  }

  public get LiveStateData(): PlayerStateHistory {
    const frame = this.world.LocalFrame > 0 ? this.world.LocalFrame - 1 : 0;
    return this.hist.get(frame);
  }
}
