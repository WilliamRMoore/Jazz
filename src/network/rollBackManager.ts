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
    const csf = this.FrameComparisonManager.GetCurrentSyncFrame();
    if (
      this.RemoteLocalFrameManager.LocalFrame > csf &&
      this.RemoteLocalFrameManager.RemoteFrame > csf
    ) {
      return true;
    }
    return false;
  }
}

export interface IRollBackManager<Type> {
  ShouldRollBack(): boolean;
}
