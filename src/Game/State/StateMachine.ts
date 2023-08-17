import { Player } from '../Player/Player';
import IState from './State';

export class StateMachine {
  private states = new Map<string, IState>();
  private currentState?: IState;
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  public AddState(name: string, config: IState) {
    this.states.set(name, config);
  }

  public SetState(name: string) {
    if (!this.states.has(name)) {
      // do something
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
  }
  public GetCurrentState() {
    return this.currentState;
  }

  public Update() {
    if (this.currentState && this.currentState.onUpdate) {
      this.currentState.onUpdate(1, this.player);
    }
  }
}
