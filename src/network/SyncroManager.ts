import { FrameStorageManager } from './FrameStorageManager';
import { IFrameComparisonManager } from './FrameComparisonManager';
import { IRollBackManager } from './rollBackManager';
import { IInputStorageManager } from '../input/InputStorageManager';

export class SyncroManager<Type> {
  private readonly FSM: FrameStorageManager;
  private readonly ISM: IInputStorageManager<Type>;
  private readonly FCM: IFrameComparisonManager<Type>;
  private readonly RBM: IRollBackManager<Type>;
  private readonly DefaultInputFactory: (
    frameAdvantage: number,
    frame: number
  ) => Type;

  constructor(
    fsm: FrameStorageManager,
    ism: IInputStorageManager<Type>,
    fcm: IFrameComparisonManager<Type>,
    rbm: IRollBackManager<Type>,
    defaultInputFactory: (frameAdvantage: number, frame: number) => Type
  ) {
    this.FSM = fsm;
    this.ISM = ism;
    this.FCM = fcm;
    this.RBM = rbm;
    this.DefaultInputFactory = defaultInputFactory;
  }

  public SetRemoteFrameNumber(frame: number) {
    this.FSM.RemoteFrame = frame;
  }

  public SetRemoteFrameAdvantage(frameAdv: number) {
    this.FSM.RemoteFrameAdvantage = frameAdv;
  }

  public SetLocalFrameNumber(frame: number) {
    this.FSM.LocalFrame = frame;
  }

  public GetSyncFrames() {
    return this.FSM.GetSyncFrames();
  }

  public SetCurrentSyncFrames(syncFrame: number) {
    this.FSM.SetCurrentSyncFrame(syncFrame);
  }

  public GetFrameAdvantageDifference(): number {
    return this.FCM.GetFrameAdvantageDifference();
  }

  public GetCurrentSyncFrame(): number {
    return this.FCM.GetCurrentSyncFrame();
  }

  public UpdateNextSynFrame() {
    this.FCM.UpdateNextSyncFrame();
  }

  public IsWithinFrameAdvantage(): boolean {
    return this.FCM.IsWithinFrameAdvatnage();
  }

  public StoreRemoteInput(remoteInput: Type, frame: number) {
    this.ISM.StoreRemoteInput(remoteInput, frame);
  }

  public StoreLocalInput(localInput: Type, frame: number) {
    this.ISM.StoreLocalInput(localInput, frame);
  }

  public GetRemoteInputForFrame(frame: number): Type {
    return this.ISM.GetRemoteInputForFrame(frame);
  }

  public GetOrGuessRemoteInputForFrame(frame: number): Type {
    let remoteInput = this.ISM.GetRemoteInputForFrame(frame);

    if (remoteInput === undefined || remoteInput === null) {
      remoteInput = this.ISM.GetLastRemoteInput();
      if (remoteInput !== undefined) {
        this.ISM.StoreGuessedInput(remoteInput, frame);
        return remoteInput;
      }

      remoteInput = this.DefaultInputFactory(
        this.FSM.RemoteFrameAdvantage,
        frame
      );

      this.ISM.StoreGuessedInput(remoteInput, frame);
    }

    return remoteInput;
  }

  public ShouldRollBack() {
    return this.RBM.ShouldRollBack();
  }
}
