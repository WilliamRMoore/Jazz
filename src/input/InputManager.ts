export class InputManager<Type> {
  private readonly localInputs: Array<Type>;
  private readonly remoteInputs: Array<Type>;
  private readonly guessedInputs: Array<Type>;
  InvalidGuessedFrameSpec: (guessed: Type, Real: Type) => boolean;

  constructor(invalidGuessedFrameSpec: (v1: Type, v2: Type) => boolean) {
    this.localInputs = new Array<Type>();
    this.remoteInputs = new Array<Type>();
    this.guessedInputs = new Array<Type>();
    this.InvalidGuessedFrameSpec = invalidGuessedFrameSpec;
  }

  // TODO: Prevent overwriting inputs
  // Write test to makesure inputs can't be over written.
  UpdateLocalInputs(input: Type, frame: number) {
    if (this.localInputs[frame] === undefined) {
      this.localInputs[frame] = input;
      return;
    }

    throw new Error('Attempted to overwrite Local Input');
  }

  UpdateGuessedInputs(input: Type, frame: number) {
    if (this.guessedInputs[frame] === undefined) {
      this.guessedInputs[frame] = input;
      return;
    }

    throw new Error('Attempted to overwrite Guessed Input');
  }

  UpdateRemoteInputs(input: Type, frame: number) {
    if (this.remoteInputs[frame] === undefined) {
      this.remoteInputs[frame] = input;
      return;
    }

    throw new Error('Attempted to overwrite Remote Input');
  }

  GetRemoteInputForFrame(frame: number) {
    return this.remoteInputs[frame];
  }

  GetLocalInputForFrame(frame: number) {
    return this.localInputs[frame];
  }

  GetGuessedInputForFrame(frame: number) {
    return this.guessedInputs[frame];
  }

  //   RemoteOrGuessInputForFrame(frame: number){
  //     return this.
  //   }

  RetreiveFirstInvalidInputFrameNumber(lowerBound: number, upperBound: number) {
    for (let i = lowerBound; i <= upperBound; i++) {
      const guessed = this.guessedInputs[i];
      const real = this.remoteInputs[i];

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
