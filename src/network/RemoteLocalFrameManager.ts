export class RemoteLocalFrameManager {
  private readonly INTIAL_FRAME = 0;
  private localFrame = this.INTIAL_FRAME;
  private remoteFrame = this.INTIAL_FRAME;

  public SetLocalFrame(frame: number) {
    this.localFrame = frame;
  }

  public SetRemoteFrame(frame: number) {
    this.remoteFrame = frame;
  }

  public GetLocalFrame(): number {
    return this.localFrame;
  }

  public GetRemoteFrame(): number {
    return this.remoteFrame;
  }

  public GetLocalFrameAdvantage(): number {
    return this.localFrame - this.remoteFrame;
  }

  public GetRemoteFrameAdvantage(): number {
    return this.remoteFrame - this.localFrame;
  }
}
