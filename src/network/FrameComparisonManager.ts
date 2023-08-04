import { InputStorageManager } from '../input/InputStorageManager';

export class FrameComparisonManager<Type> {
  private readonly InputStorageManager: InputStorageManager<Type>;
  private PreviousSyncFrame: number = 0;

  constructor(inputStorageManager: InputStorageManager<Type>) {
    this.InputStorageManager = inputStorageManager;
  }

  GetNextSyncFrame(localFrame: number, remoteFrame: number): number {
    let finalFrame = remoteFrame > localFrame ? localFrame : remoteFrame;
    let syncFrame =
      this.InputStorageManager.RetreiveFirstInvalidInputFrameNumber(
        this.PreviousSyncFrame,
        finalFrame
      );
    if (syncFrame == null) {
      this.PreviousSyncFrame = finalFrame;
      return finalFrame;
    }
    this.PreviousSyncFrame = syncFrame;
    return syncFrame;
  }

  ShouldRollBack(localFrame: number, remoteFrame: number): boolean {
    if (
      localFrame > this.PreviousSyncFrame &&
      remoteFrame > this.PreviousSyncFrame
    ) {
      return true;
    }
    return false;
  }
}
