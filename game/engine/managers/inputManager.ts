import { frameNumber } from '../entity/components/attack';
import { InputAction, NewInputAction } from '../input/Input';

export class InputStore implements IInputStore {
  private readonly store: Array<InputAction>;

  constructor() {
    this.store = new Array<InputAction>(100_000);
  }

  StoreInputForFrame(frame: number, input: InputAction): void {
    this.store[frame] = input;
  }

  GetInputForFrame(frame: number): InputAction {
    frame = frame >= 0 ? frame : 0;
    return this.store[frame];
  }
}

export interface IInputStore {
  StoreInputForFrame(frame: number, input: InputAction): void;
  GetInputForFrame(frame: number): InputAction;
}

export class RemoteInputManager implements IInputStore {
  private readonly store: InputStore;
  private readonly guessedInputStore: Map<frameNumber, InputAction> = new Map();
  private lastRemoteFrame: number = -1;

  constructor(remoteInputStore: InputStore) {
    this.store = remoteInputStore;
  }

  public RollBackMode(onOff: boolean) {
    if (onOff) {
      this.GetInputForFrame = this.getInputForRollBackFrame;
    } else {
      this.GetInputForFrame = this.getInputForFrame;
    }
  }

  public GetInputForFrame: (frame: number) => InputAction = (frame: number) =>
    this.getInputForFrame(frame);

  private getInputForFrame(frame: number): InputAction {
    const realInput = this.store.GetInputForFrame(frame);
    if (realInput !== undefined) {
      return realInput;
    }

    const guessedInput = this.guessedInputStore.get(frame);
    if (guessedInput !== undefined) {
      return guessedInput;
    }

    const lastInput = this.store.GetInputForFrame(this.lastRemoteFrame);
    const copy = NewInputAction();
    copy.Action = lastInput.Action;
    copy.LTVal.SetFromFp(lastInput.LTVal);
    copy.RTVal.SetFromFp(lastInput.RTVal);
    copy.LXAxis.SetFromFp(lastInput.LXAxis);
    copy.LYAxis.SetFromFp(lastInput.LYAxis);
    copy.RXAxis.SetFromFp(lastInput.RXAxis);
    copy.RYAxis.SetFromFp(lastInput.RYAxis);

    this.guessedInputStore.set(frame, copy);
    return lastInput;
  }

  private getInputForRollBackFrame(frame: number): InputAction {
    const remote = this.store.GetInputForFrame(frame);
    if (remote !== undefined) {
      this.guessedInputStore.set(frame, remote);
      return remote;
    }
    return this.guessedInputStore.get(frame)!;
  }

  public StoreInputForFrame(frame: number, input: InputAction): void {
    this.store.StoreInputForFrame(frame, input);
    if (frame > this.lastRemoteFrame) {
      this.lastRemoteFrame = frame;
    }
  }

  public LastSyncedInputIndex(lowerBound: number, upperBound: number) {
    for (let i = lowerBound; i <= upperBound; i++) {
      const guess = this.guessedInputStore.get(i);
      if (guess === undefined) {
        continue;
      }
      const real = this.store.GetInputForFrame(i);
      if (real === undefined || InvalidGuess(guess, real)) {
        return i < 1 ? 0 : i - 1;
      }
    }
    return -1;
  }

  public get LastRemoteFrame(): number {
    return this.lastRemoteFrame;
  }
}

function InvalidGuess(guessed: InputAction, real: InputAction) {
  return !(
    guessed.Action === real.Action &&
    guessed.LTVal.Raw === real.LTVal.Raw &&
    guessed.RTVal.Raw === real.RTVal.Raw &&
    guessed.LXAxis.Raw === real.LXAxis.Raw &&
    guessed.LYAxis.Raw === real.LYAxis.Raw &&
    guessed.RXAxis.Raw === real.RXAxis.Raw &&
    guessed.RYAxis.Raw === real.RYAxis.Raw
  );
}
