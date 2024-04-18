import { InputAction, InputActionPacket } from '../../input/GamePadInput';
import { InputStorageManager } from '../../input/InputStorageManager';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { Player } from '../Player/Player';
import IState from './State';

export class StateMachine {
  private states = new Map<string, IState>();
  private currentState?: IState;
  private currentStateFrame: number = 0;
  private player: Player;
  private ISM: InputStorageManager<InputActionPacket<InputAction>>;
  private FSM: FrameStorageManager;

  constructor(
    player: Player,
    ism: InputStorageManager<InputActionPacket<InputAction>>,
    fsm: FrameStorageManager
  ) {
    this.player = player;
    this.ISM = ism;
    this.FSM = fsm;
  }

  public AddState(name: string, config: IState) {
    this.states.set(name, config);
  }

  public ForceState(name: string, frame: number = 0) {
    if (!this.states.has(name)) {
      return;
    }

    if (this.currentState?.name === name) {
      return;
    }

    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit(this.player);
    }

    this.currentState = this.states.get(name)!;

    if (this.currentState.onEnter) {
      this.currentState.onEnter(
        this.player,
        this.ISM.GetLocalInputForFrame(this.FSM.LocalFrame).input
      );
    }
    this.player.CurrentStateMachineState = this.currentState.name;
    this.currentStateFrame = frame;
  }

  public SetState(name: string) {
    if (!this.states.has(name)) {
      // do something
      return;
    }

    if (this.currentState?.name === name) {
      return;
    }

    if (
      this.currentState?.tranisitions &&
      !this.currentState.tranisitions.includes(name)
    ) {
      return;
    }

    //TODO: check for tranisitions

    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit(this.player);
    }

    this.currentState = this.states.get(name)!;
    this.player.CurrentStateMachineState = this.currentState.name;

    if (this.currentState.onEnter) {
      this.currentState.onEnter(
        this.player,
        this.ISM.GetLocalInputForFrame(this.FSM.LocalFrame).input
      );
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
        this.ISM.GetLocalInputForFrame(this.FSM.LocalFrame).input
      );
    }

    this.currentStateFrame++;
    this.player.CurrentStateMachineStateFrame = this.currentStateFrame;
  }
}
