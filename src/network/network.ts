class Network<Type> {
  private readonly MAX_ROLLBACK_FRAMES = 60;
  private readonly FRAME_ADVANTAGE_LIMIT = 3;
  private readonly INITIAL_FRAME = 0;

  private localFrame = this.INITIAL_FRAME;
  private remoteFrame = this.INITIAL_FRAME;
  private syncFrame = this.INITIAL_FRAME;
  private remoteFrameAdvantage = 0;

  private readonly localInputBufer: Array<Type>;
  private readonly guessedRemoteInputBufer: Array<Type>;
  private readonly remoteInputBufer: Array<Type>;

  private readonly comparer: (v1: Type, v2: Type) => boolean;

  constructor(
    localInputsBuffer: Array<Type>,
    remmoteInputsBuffer: Array<Type>,
    guessedRemoteInputsBuffer: Array<Type>,
    comparer: (v1: Type, v2: Type) => boolean
  ) {
    this.localInputBufer = localInputsBuffer;
    this.remoteInputBufer = remmoteInputsBuffer;
    this.guessedRemoteInputBufer = guessedRemoteInputsBuffer;
    this.comparer = comparer;
  }

  RollBack(): boolean {
    if (this.localFrame > this.syncFrame && this.remoteFrame > this.syncFrame) {
      return true;
    }
    return false;
  }

  TimeSynced(): boolean {
    let localFrameAdvantage = this.localFrame - this.remoteFrame;
    let frameAdvantageDifference =
      localFrameAdvantage - this.remoteFrameAdvantage;
    return (
      localFrameAdvantage < this.MAX_ROLLBACK_FRAMES &&
      frameAdvantageDifference <= this.FRAME_ADVANTAGE_LIMIT
    );
  }

  UpdateRemoteFrame(remoteFrame: number) {
    this.remoteFrame = remoteFrame;
    this.remoteFrameAdvantage = this.localFrame - remoteFrame;
  }

  UpdateLocalFrame(localFrame: number) {
    this.localFrame = localFrame;
  }

  UpdateSynchronization() {
    this.syncFrame = this.DetermineSyncFrame();
    if (this.RollBack()) {
      console.log('ROLLING BACK!');
    }
  }

  private DetermineSyncFrame() {
    let finalFrame =
      this.remoteFrame > this.localFrame ? this.localFrame : this.remoteFrame;
    for (let i = this.syncFrame; i <= finalFrame; i++) {
      const guessed = this.guessedRemoteInputBufer[i];
      const real = this.remoteInputBufer[i];

      if (guessed === undefined) {
        continue;
      }

      if (this.comparer(guessed, real)) {
        return i - 1;
      }
    }
    return finalFrame;
  }
}
