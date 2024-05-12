export class FrameStorageManager implements IFrameStorageManager {
  private readonly INTIAL_FRAME = 0;

  private syncedFrame = this.INTIAL_FRAME;

  public LocalFrame = this.INTIAL_FRAME;
  public RemoteFrame = this.INTIAL_FRAME;
  public RemoteFrameAdvantage = 0;

  public GetSyncFrame(): number {
    return this.syncedFrame;
  }

  public SetCurrentSyncFrame(syncFrame: number) {
    this.syncedFrame = syncFrame;
  }
}

type SyncedFrames = {
  PreviousSyncFrame: number;
  CurrentSyncFrame: number;
};

export interface IFrameStorageManager {
  GetSyncFrame(): number;
  SetCurrentSyncFrame(syncFrame: number): void;
}
