export class InputStorageManager<Type> {
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

    throw new Error('Attempted to overwrite Local Input');
  }

  public StoreGuessedInput(input: Type, frame: number) {
    if (this.guessedInputStore[frame] === undefined) {
      this.guessedInputStore[frame] = input;
      return;
    }

    throw new Error('Attempted to overwrite Guessed Input');
  }

  public StoreRemoteInput(input: Type, frame: number) {
    if (this.remoteInputStore[frame] === undefined) {
      this.remoteInputStore[frame] = input;
      return;
    }

    throw new Error('Attempted to overwrite Remote Input');
  }

  public GetRemoteInputForFrame(frame: number) {
    return this.remoteInputStore[frame];
  }

  public GetLocalInputForFrame(frame: number) {
    return this.localInputStore[frame];
  }

  public GetGuessedInputForFrame(frame: number) {
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

      if (this.InvalidGuessedFrameSpec(guessed, real)) {
        return i - 1;
      }
    }
    return null;
  }
}
