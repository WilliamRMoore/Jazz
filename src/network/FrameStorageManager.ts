export class FrameStorageManager {
  private readonly INTIAL_FRAME = 0;

  private syncedFrame = {
    PreviousSyncFrame: 0,
    CurrentSyncFrame: 0,
  } as SyncedFrames;

  public LocalFrame = this.INTIAL_FRAME;
  public RemoteFrame = this.INTIAL_FRAME;
  public RemoteFrameAdvantage = 0;

  public GetSyncFrames(): SyncedFrames {
    return this.syncedFrame;
  }

  public SetCurrentSyncFrame(syncFrame: number) {
    this.syncedFrame.PreviousSyncFrame = this.syncedFrame.CurrentSyncFrame;
    this.syncedFrame.CurrentSyncFrame = syncFrame;
  }
}

type SyncedFrames = {
  PreviousSyncFrame: number;
  CurrentSyncFrame: number;
};

const FSM = new FrameStorageManager();

export { FSM };
