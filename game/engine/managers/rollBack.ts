import { InputAction, NewInputAction } from '../input/Input';
import { RemoteInputManager } from './inputManager';

export class RollBackManager {
  private localFrame: () => number;
  private remoteInput: RemoteInputManager;
  private remoteFrameAdvantage = 0;
  private maxRollBackFrames = 90;
  private maxFrameAdvantage = 4;
  private syncFrame = 0;

  constructor(localFrame: () => number, remoteInput: RemoteInputManager) {
    this.localFrame = localFrame;
    this.remoteInput = remoteInput;
  }

  public get LocalFrameAdvantage(): number {
    return this.localFrame() - this.remoteInput.LastRemoteFrame;
  }

  public get SyncFrame(): number {
    return this.syncFrame;
  }

  private get frameAdvantageDifference(): number {
    return this.LocalFrameAdvantage - this.remoteFrameAdvantage;
  }

  public RollBackMode(onOff: boolean) {
    this.remoteInput.RollBackMode(onOff);
  }

  public SetRemoteInputForFrame(
    frame: number,
    remoteFrameAdvantage: number,
    input: InputAction,
  ): void {
    this.remoteInput.StoreInputForFrame(frame, input);
    this.remoteFrameAdvantage = remoteFrameAdvantage;
  }

  public UpdateSyncFrame(): void {
    let finalFrame =
      this.remoteInput.LastRemoteFrame > this.localFrame()
        ? this.localFrame()
        : this.remoteInput.LastRemoteFrame;
    let syncFrame = this.remoteInput.LastSyncedInputIndex(
      this.syncFrame + 1,
      finalFrame,
    );
    if (syncFrame < 0) {
      this.syncFrame = finalFrame;
      return;
    }
    this.syncFrame = syncFrame;
  }

  // Used to determine if we stall
  public get IsWithInFrameAdvantage(): boolean {
    const diff = this.frameAdvantageDifference;
    return (
      this.LocalFrameAdvantage < this.maxRollBackFrames &&
      diff <= this.maxFrameAdvantage
    );
  }

  public get ShouldRollBack(): boolean {
    const csf = this.syncFrame;
    return this.localFrame() > csf && this.remoteInput.LastRemoteFrame > csf;
  }
}
