import { FSMStates } from '../../finiteStateMachines/player/PlayerStateCollections';
import { FSMState } from '../../finiteStateMachines/player/PlayerStateMachine';
import { StateId } from '../../finiteStateMachines/player/states/shared';
import { Idle } from '../../finiteStateMachines/player/states';

export type StateFrameRef = {
  readonly Frame: number;
};

export class FSMInfoComponent {
  private currentState: FSMState = Idle;
  private currentStateFrame: number = 0;
  private readonly frameLengths: Map<StateId, number>;

  public constructor(frameLengths: Map<StateId, number>) {
    this.frameLengths = frameLengths;
  }

  public get CurrentStateFrame(): number {
    return this.currentStateFrame;
  }

  public get CurrentState(): FSMState {
    return this.currentState;
  }

  public get CurrentStateId(): StateId {
    return this.currentState.StateId;
  }

  public set _db_currentStateFrame(frame: number) {
    this.currentStateFrame = frame;
  }

  public SetCurrentState(s: FSMState) {
    this.currentState = s;
  }

  public IncrementStateFrame(): void {
    this.currentStateFrame++;
  }

  public SetStateFrameToZero(): void {
    this.currentStateFrame = 0;
  }

  public GetFrameLengthForState(stateId: StateId): number | undefined {
    return this.frameLengths.get(stateId);
  }

  public GetCurrentStateFrameLength(): number | undefined {
    return this.frameLengths.get(this.CurrentState.StateId);
  }

  public set CompState(history: FSMInfoHist) {
    const state = FSMStates.get(history.stateId)!;
    this.currentState = state;
    this.currentStateFrame = history.stateFrame;
  }
}

export type FSMInfoHist = {
  stateId: StateId;
  stateFrame: number;
};
