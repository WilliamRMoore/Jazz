export class InputStorageManager<Type> implements IInputStorageManager<Type> {
  private readonly localInputStore: Array<Type>;
  private readonly remoteInputStore: Array<Type>;
  private readonly guessedInputStore: Array<Type>;
  InvalidGuessedFrameSpec: (guessed: Type, Real: Type) => boolean;

  constructor(invalidGuessedFrameSpec: (guessed: Type, real: Type) => boolean) {
    this.localInputStore = new Array<Type>();
    this.remoteInputStore = new Array<Type>();
    this.guessedInputStore = new Array<Type>();
    this.InvalidGuessedFrameSpec = invalidGuessedFrameSpec;
  }

  public StoreLocalInput(input: Type, frame: number) {
    if (this.localInputStore[frame] === undefined) {
      this.localInputStore[frame] = input;
      return;
    }
  }

  public StoreGuessedInput(input: Type, frame: number) {
    if (this.guessedInputStore[frame] === undefined) {
      this.guessedInputStore[frame] = input;
      return;
    }
  }

  public OverWriteGuessedInput(input: Type, frame: number) {
    this.guessedInputStore[frame] = input;
  }

  public StoreRemoteInput(input: Type, frame: number) {
    if (this.remoteInputStore[frame] === undefined) {
      this.remoteInputStore[frame] = input;
      return;
    }
  }

  public GetRemoteInputForFrame(frame: number): Type {
    return this.remoteInputStore[frame];
  }

  public GetLastRemoteInput(): Type {
    return this.remoteInputStore[this.remoteInputStore.length - 1];
  }

  public GetLocalInputForFrame(frame: number): Type {
    return this.localInputStore[frame];
  }

  public GetGuessedInputForFrame(frame: number): Type {
    return this.guessedInputStore[frame];
  }

  public ReturnFirstWrongGuess(
    lowerBound: number,
    upperBound: number
  ): number | null {
    for (let i = lowerBound; i <= upperBound; i++) {
      const guessed = this.guessedInputStore[i];
      const real = this.remoteInputStore[i];

      if (guessed === undefined) {
        continue;
      }

      if (real === undefined || this.InvalidGuessedFrameSpec(guessed, real)) {
        return i - 1;
      }
    }
    return null;
  }
}

export interface IInputStorageManager<Type> {
  StoreLocalInput(input: Type, frame: number): void;
  StoreGuessedInput(input: Type, frame: number): void;
  OverWriteGuessedInput(input: Type, frame: number): void;
  StoreRemoteInput(input: Type, frame: number): void;
  GetRemoteInputForFrame(frame: number): Type;
  GetLastRemoteInput(): Type;
  GetLocalInputForFrame(frame: number): Type;
  GetGuessedInputForFrame(frame: number): Type;
  ReturnFirstWrongGuess(lowerBound: number, upperBound: number): number | null;
}
