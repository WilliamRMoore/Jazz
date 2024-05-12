import { InputStorageManager } from '../input/InputStorageManager';
import { FrameStorageManager } from './FrameStorageManager';

export class FrameComparisonManager<Type>
  implements IFrameComparisonManager<Type>
{
  private readonly MAX_ROLLBACK_FRAMES = 10000;
  private readonly FRAME_ADVANTAGE_LIMIT = 1;
  private readonly InputStorageManager: InputStorageManager<Type>;
  private readonly FrameStorageManager: FrameStorageManager;

  constructor(
    inputStorageManager: InputStorageManager<Type>,
    frameStorageManager: FrameStorageManager
  ) {
    this.InputStorageManager = inputStorageManager;
    this.FrameStorageManager = frameStorageManager;
  }

  UpdateNextSyncFrame(): void {
    let finalFrame =
      this.FrameStorageManager.RemoteFrame > this.FrameStorageManager.LocalFrame
        ? this.FrameStorageManager.LocalFrame
        : this.FrameStorageManager.RemoteFrame;

    let syncFrame = this.InputStorageManager.ReturnFirstWrongGuess(
      this.FrameStorageManager.GetSyncFrame() + 1,
      finalFrame
    );

    if (syncFrame == null) {
      this.FrameStorageManager.SetCurrentSyncFrame(finalFrame);
      return;
    }
    this.FrameStorageManager.SetCurrentSyncFrame(syncFrame);
  }

  GetCurrentSyncFrame(): number {
    return this.FrameStorageManager.GetSyncFrame();
  }

  IsWithinFrameAdvatnage(): boolean {
    let localFrameAdvantage = this.GetLocalFrameAdvantage();
    let frameAdvantageDifference =
      localFrameAdvantage - this.FrameStorageManager.RemoteFrameAdvantage;
    return (
      localFrameAdvantage < this.MAX_ROLLBACK_FRAMES &&
      frameAdvantageDifference <= this.FRAME_ADVANTAGE_LIMIT
    );
  }

  ShouldStall(): boolean {
    return !this.IsWithinFrameAdvatnage();
  }

  GetFrameAdvantageDifference(): number {
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

export interface IFrameComparisonManager<Type> {
  UpdateNextSyncFrame(): void;
  // GetPreviousSyncFrame(): number;
  GetCurrentSyncFrame(): number;
  IsWithinFrameAdvatnage(): boolean;
  GetFrameAdvantageDifference(): number;
  GetLocalFrameAdvantage(): number;
  ShouldStall(): boolean;
}
