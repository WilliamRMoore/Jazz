import { InputManager } from '../input/InputManager';

export class NetworkV2<Type> {
  private readonly MAX_ROLLBACK_FRAMES = 60;
  private readonly FRAME_ADVANTAGE_LIMIT = 3;
  private readonly INITIAL_FRAME = 0;
  private readonly InputManager: InputManager<Type>;
  private localFrame = this.INITIAL_FRAME;
  private remoteFrame = this.INITIAL_FRAME;
  private syncFrame = this.INITIAL_FRAME;
  private remoteFrameAdvantage = 0;

  constructor(inputManager: InputManager<Type>) {
    this.InputManager = inputManager;
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
      return true;
    }
    return false;
  }

  private DetermineSyncFrame() {
    let finalFrame =
      this.remoteFrame > this.localFrame ? this.localFrame : this.remoteFrame;
    let syncFrame = this.InputManager.RetreiveFirstInvalidInputFrameNumber(
      this.syncFrame,
      finalFrame
    );
    if (syncFrame == null) {
      return finalFrame;
    }
    return syncFrame;
  }
}
