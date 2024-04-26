import { InputAction } from '../../input/GamePadInput';
import { Player } from '../Player/Player';
import {
  idle,
  walk,
  neutralFall,
  ledgeGrab,
  jumpSquat,
  dash,
  run,
  turnRun,
  stopRun,
  startWalk,
  ariealJump,
  groundedJump,
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

  public SetinitialState(name: string) {
    if (!this.states.has(name)) {
      return;
    }

    if (this.currentState) {
      return;
    }

    this.currentState = this.states.get(name)!;
    this.player.CurrentStateMachineState = this.currentState.name;

    //if our new current state has an onEnter, call it.
    if (this.currentState.onEnter) {
      this.currentState.onEnter(this.player, {
        Action: name,
        LXAxsis: 0,
        LYAxsis: 0,
        RXAxis: 0,
        RYAxsis: 0,
      });
    }

    // set the current statreframe to 0.
    this.currentStateFrame = 0;
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

  public ForceState(frame: number, inputAction: InputAction): void {
    //TODO problem forcing state in rollback with default transitions, jumpsquat doesn't work.
    //need a rollback specific one, I think.
    //States are saved after at least one update. Forcing a state will never be with frame 0, will at least be 1.
    //Not true of other functions that use for state, need to specify one for rollback purposes only.
    // May need to save state at begining of frame instead of end using the PSHM.
    //Consider re-working logic loop.
    let name = inputAction.Action;

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
      this.currentState.onEnter(this.player, inputAction);
    }
    this.player.CurrentStateMachineState = this.currentState.name;
    this.currentStateFrame = frame;

    return;
  }

  private setToDefault(name: string, inputAction: InputAction) {
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
    this.player.CurrentStateMachineState = this.currentState.name;

    //if our new current state has an onEnter, call it.
    if (this.currentState.onEnter) {
      this.currentState.onEnter(this.player, inputAction);
    }

    // set the current statreframe to 0.
    this.currentStateFrame = 0;
  }

  public SetState(inputAction: InputAction): void {
    let name = inputAction.Action;
    if (name == 'default') {
      if (this.currentState && this.currentState.onDefaultInput) {
        name = this.currentState.onDefaultInput(inputAction);
        this.setToDefault(name, inputAction);
        return;
      }
    }

    //If we don't have the state, return.
    if (!this.states.has(name)) {
      return;
    }
    //If current state is state we are tying to set to, return.
    if (this.currentState?.name === name) {
      return;
    }
    //if current state has transitions, and those transisision(whitelist) don't include what we are tying to set to, return.
    if (
      this.currentState?.tranisitions &&
      !this.currentState.tranisitions.includes(name)
    ) {
      return;
    }

    //If we have a current state, and it has an on exit, call on exit before setting new state.
    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit(this.player);
    }

    this.currentState = this.states.get(name)!;
    this.player.CurrentStateMachineState = this.currentState.name;

    //if our new current state has an onEnter, call it.
    if (this.currentState.onEnter) {
      this.currentState.onEnter(this.player, inputAction);
    }

    // set the current statreframe to 0.
    this.currentStateFrame = 0;
  }

  public GetCurrentState() {
    return this.currentState;
  }

  public Update(inputAction: InputAction): void {
    if (
      this.currentState &&
      this.currentState.frameCount &&
      this.currentStateFrame >= this.currentState.frameCount
    ) {
      this.setToDefault(this.currentState.stateDefaultTransition, inputAction);
      return;
    }

    if (this.currentState && this.currentState.onUpdate) {
      this.currentState.onUpdate(
        this.currentStateFrame,
        this.player,
        inputAction
      );
    }

    this.currentStateFrame++;
    this.player.CurrentStateMachineStateFrame = this.currentStateFrame;
  }
}

export function InitSM(p: Player): StateMachine {
  const sm = new StateMachine(p);
  sm.AddState(idle.name, idle);
  sm.AddState(startWalk.name, startWalk);
  sm.AddState(walk.name, walk);
  sm.AddState(dash.name, dash);
  sm.AddState(run.name, run);
  sm.AddState(ariealJump.name, ariealJump);
  sm.AddState(groundedJump.name, groundedJump);
  sm.AddState(jumpSquat.name, jumpSquat);
  sm.AddState(neutralFall.name, neutralFall);
  // sm.AddState(ledgeGrab.name, ledgeGrab);
  // sm.AddState(turnRun.name, turnRun);
  //sm.AddState(stopRun.name, stopRun);
  sm.SetinitialState('grounded-idle');
  return sm;
}
