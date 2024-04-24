import { InputAction } from '../../input/GamePadInput';
import { Player } from '../Player/Player';
import {
  idle,
  walk,
  jump,
  neutralFall,
  ledgeGrab,
  jumpSquat,
} from './CharacterStates/Test';
import IState from './State';

export class StateMachine {
  private states = new Map<string, IState>();
  private currentState?: IState;
  private currentStateFrame: number = 0;
  private player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  public AddState(name: string, config: IState): void {
    this.states.set(name, config);
  }

  public ForceStateForRollback(name: string, frame: number): void {
    //rollback: We are forcing a player to a previuously computed state,
    //At this point, the statemachine will have already run the states on enter/ exit method for the computed player state.
    //We do not need to run those in the force state for rollback method as a result.
    if (!this.states.has(name)) {
      return;
    }

    if (this.currentState?.name === name) {
      this.currentStateFrame = frame;
      return;
    }

    this.currentState = this.states.get(name)!;
    this.player.CurrentStateMachineState = this.currentState.name;
    this.currentStateFrame = frame;
  }

  public ForceState(name: string, frame: number): void {
    //TODO problem forcing state in rollback with default transitions, jumpsquat doesn't work.
    //need a rollback specific one, I think.
    //States are saved after at least one update. Forcing a state will never be with frame 0, will at least be 1.
    //Not true of other functions that use for state, need to specify one for rollback purposes only.
    // May need to save state at begining of frame instead of end using the PSHM.
    //Consider re-working logic loop.
    if (!this.states.has(name)) {
      return;
    }

    if (this.currentState?.name === name) {
      this.currentStateFrame = frame;
      return;
    }

    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit(this.player);
    }

    this.currentState = this.states.get(name)!;

    if (this.currentState.onEnter) {
      this.currentState.onEnter(this.player);
    }
    this.player.CurrentStateMachineState = this.currentState.name;
    this.currentStateFrame = frame;

    return;
  }

  public SetState(name: string): void {
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
      this.currentState.onEnter(this.player);
    }

    this.currentStateFrame = 0;
  }
  public GetCurrentState() {
    return this.currentState;
  }

  public Update(input: InputAction): void {
    if (
      this.currentState &&
      this.currentState.frameCount &&
      this.currentStateFrame >= this.currentState.frameCount
    ) {
      this.SetState(this.currentState.stateDefaultTransition);
      return;
    }

    if (this.currentState && this.currentState.onUpdate) {
      this.currentState.onUpdate(this.currentStateFrame, this.player, input);
    }

    this.currentStateFrame++;
    this.player.CurrentStateMachineStateFrame = this.currentStateFrame;
  }
}

export function InitSM(p: Player): StateMachine {
  const sm = new StateMachine(p);
  sm.AddState('idle', idle);
  sm.AddState('walk', walk);
  sm.AddState('jump', jump);
  sm.AddState('neutralFall', neutralFall);
  sm.AddState(ledgeGrab.name, ledgeGrab);
  sm.AddState(jumpSquat.name, jumpSquat);

  return sm;
}
