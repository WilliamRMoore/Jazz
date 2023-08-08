import { InputStorageManager } from '../input/InputStorageManager';
import { FrameStorageManager } from './FrameStorageManager';

export class FrameComparisonManager<Type> {
  // private readonly MAX_ROLLBACK_FRAMES = 60;
  private readonly FRAME_ADVANTAGE_LIMIT = 3;
  private readonly InputStorageManager: InputStorageManager<Type>;
  private readonly FrameStorageManager: FrameStorageManager;

  constructor(
    inputStorageManager: InputStorageManager<Type>,
    frameStorageManager: FrameStorageManager
  ) {
    this.InputStorageManager = inputStorageManager;
    this.FrameStorageManager = frameStorageManager;
  }

  UpdateNextSyncFrame() {
    let finalFrame =
      this.FrameStorageManager.RemoteFrame > this.FrameStorageManager.LocalFrame
        ? this.FrameStorageManager.LocalFrame
        : this.FrameStorageManager.RemoteFrame;

    let syncFrame = this.InputStorageManager.ReturnFirstWrongGuess(
      this.FrameStorageManager.GetSyncFrames().PreviousSyncFrame,
      finalFrame
    );

    if (syncFrame == null) {
      this.FrameStorageManager.SetCurrentSyncFrame(finalFrame);
      return;
    }

    this.FrameStorageManager.SetCurrentSyncFrame(syncFrame);
  }

  GetPreviousSyncFrame(): number {
    return this.FrameStorageManager.GetSyncFrames().PreviousSyncFrame;
  }

  GetCurrentSyncFrame(): number {
    return this.FrameStorageManager.GetSyncFrames().CurrentSyncFrame;
  }

  IsWithinFrameAdvatnage(): boolean {
    let localFrameAdvantage = this.GetLocalFrameAdvantage();
    let frameAdvantageDifference =
      localFrameAdvantage - this.FrameStorageManager.RemoteFrameAdvantage;
    return (
      //localFrameAdvantage < this.MAX_ROLLBACK_FRAMES &&
      frameAdvantageDifference <= this.FRAME_ADVANTAGE_LIMIT
    );
  }

  GetFrameAdvantageDifference() {
    return (
      this.GetLocalFrameAdvantage() -
      this.FrameStorageManager.RemoteFrameAdvantage
    );
  }

  GetLocalFrameAdvantage(): number {
    return (
      this.FrameStorageManager.LocalFrame - this.FrameStorageManager.RemoteFrame
    );
  }
}
