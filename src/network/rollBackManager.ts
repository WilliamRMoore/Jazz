import { FrameComparisonManager } from './FrameComparisonManager';
import { FrameStorageManager } from './FrameStorageManager';

export class RollBackManager<Type> implements IRollBackManager<Type> {
  private readonly FrameComparisonManager: FrameComparisonManager<Type>;
  private readonly RemoteLocalFrameManager: FrameStorageManager;

  constructor(
    frameComparisonManager: FrameComparisonManager<Type>,
    remoteLocalFrameManager: FrameStorageManager
  ) {
    this.FrameComparisonManager = frameComparisonManager;
    this.RemoteLocalFrameManager = remoteLocalFrameManager;
  }

  ShouldRollBack(): boolean {
    if (
      this.RemoteLocalFrameManager.LocalFrame >
        this.FrameComparisonManager.GetCurrentSyncFrame() &&
      this.RemoteLocalFrameManager.RemoteFrame >
        this.FrameComparisonManager.GetCurrentSyncFrame()
    ) {
      return true;
    }
    return false;
  }
}

export interface IRollBackManager<Type> {
  ShouldRollBack(): boolean;
}
