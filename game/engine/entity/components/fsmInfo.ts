import { FSMState } from '../../finite-state-machine/PlayerStateMachine';
import { StateId } from '../../finite-state-machine/stateConfigurations/shared';
import { Idle } from '../../finite-state-machine/stateConfigurations/states';
import { IHistoryEnabled } from '../componentHistory';

export type FSMInfoSnapShot = {
  State: FSMState;
  StateFrame: number;
  frameLengths: Map<StateId, number>;
};

export class FSMInfoComponent implements IHistoryEnabled<FSMInfoSnapShot> {
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

  public get CurrentStatetId(): StateId {
    return this.currentState.StateId;
  }

  public set _currentStaeFrame(frame: number) {
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

  public SetFrameLength(stateId: StateId, frameLength: number): void {
    this.frameLengths.set(stateId, frameLength);
  }

  public SnapShot(): FSMInfoSnapShot {
    return {
      State: this.currentState,
      StateFrame: this.currentStateFrame,
      frameLengths: new Map(this.frameLengths),
    } as FSMInfoSnapShot;
  }

  public SetFromSnapShot(snapShot: FSMInfoSnapShot): void {
    this.currentState = snapShot.State;
    this.currentStateFrame = snapShot.StateFrame;
    for (const [key, value] of snapShot.frameLengths.entries()) {
      this.frameLengths.set(key, value);
    }
  }
}
