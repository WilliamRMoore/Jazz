import { InputAction } from '../../input/GamePadInput';
import { InputStorageManager } from '../../input/InputStorageManager';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { Player } from '../Player/Player';
import IState from './State';

export class StateMachine {
  private states = new Map<string, IState>();
  private currentState?: IState;
  private currentStateFrame: 0;
  private player: Player;
  private ISM: InputStorageManager<InputAction>;
  private FSM: FrameStorageManager;

  constructor(
    player: Player,
    ism: InputStorageManager<InputAction>,
    fsm: FrameStorageManager
  ) {
    this.player = player;
    this.ISM = ism;
    this.FSM = fsm;
  }

  public AddState(name: string, config: IState) {
    this.states.set(name, config);
  }

  public SetState(name: string) {
    if (!this.states.has(name)) {
      // do something
      return;
    }

    if (this.currentState?.name === name) {
      return;
    }

    //TODO: check for tranisitions

    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit(this.player);
    }
    this.currentState = this.states.get(name)!;

    if (this.currentState.onEnter) {
      this.currentState.onEnter(this.player);
    }

    this.currentStateFrame = 0;
  }
  public GetCurrentState() {
    return this.currentState;
  }

  public Update() {
    if (
      this.currentState &&
      this.currentState.frameCount &&
      this.currentStateFrame >= this.currentState.frameCount
    ) {
      this.SetState(this.currentState.stateDefaultTransition);
      return;
    }

    if (this.currentState && this.currentState.onUpdate) {
      this.currentState.onUpdate(
        this.currentStateFrame,
        this.player,
        this.ISM.GetLocalInputForFrame(this.FSM.LocalFrame)
      );
    }

    this.currentStateFrame++;
  }
}
