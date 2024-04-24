import { FrameStorageManager } from './FrameStorageManager';
import {
  FrameComparisonManager,
  IFrameComparisonManager,
} from './FrameComparisonManager';
import { IRollBackManager, RollBackManager } from './rollBackManager';
import {
  IInputStorageManager,
  InputStorageManager,
} from '../input/InputStorageManager';

export class SyncroManager<Type> {
  private readonly FSM: FrameStorageManager;
  private readonly ISM: IInputStorageManager<Type>;
  private readonly FCM: IFrameComparisonManager<Type>;
  private readonly RBM: IRollBackManager<Type>;
  private readonly guessToRealCopy: (i: Type, frame: number) => Type;
  private readonly DefaultInputFactory: (
    frameAdvantage: number,
    frame: number
  ) => Type;

  constructor(
    fsm: FrameStorageManager,
    ism: IInputStorageManager<Type>,
    fcm: IFrameComparisonManager<Type>,
    rbm: IRollBackManager<Type>,
    guessToRealCopy: (i: Type, frame: number) => Type,
    defaultInputFactory: (frameAdvantage: number, frame: number) => Type
  ) {
    this.FSM = fsm;
    this.ISM = ism;
    this.FCM = fcm;
    this.RBM = rbm;
    this.guessToRealCopy = guessToRealCopy;
    this.DefaultInputFactory = defaultInputFactory;
  }

  public GetLocalInput(frame: number) {
    return this.ISM.GetLocalInputForFrame(frame);
  }

  public GetLocalFrameNumber(): number {
    return this.FSM.LocalFrame;
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

  public IncrementLocalFrameNumber() {
    this.FSM.LocalFrame++;
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

  public GetLocalFrameAdvantage(): number {
    return this.FCM.GetLocalFrameAdvantage();
  }

  public GetCurrentSyncFrame(): number {
    return this.FCM.GetCurrentSyncFrame();
  }

  public UpdateNextSyncFrame() {
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

  public StoreGuessedInput(input: Type, frame: number) {
    this.ISM.StoreGuessedInput(input, frame);
  }

  public GetRemoteInputForFrame(frame: number): Type {
    return this.ISM.GetRemoteInputForFrame(frame);
  }

  public ShouldStall(): boolean {
    return this.FCM.ShouldStall();
  }

  public GetRemoteInputForLoopFrame(frame: number) {
    let remoteInput = this.ISM.GetRemoteInputForFrame(frame);
    if (remoteInput != null && remoteInput != undefined) {
      return remoteInput;
    }

    let guess = this.ISM.GetLastRemoteInput();

    if (guess != null && guess != undefined) {
      let copy = this.guessToRealCopy(guess, frame);
      this.ISM.StoreGuessedInput(copy, frame);
      return copy;
    }

    return this.DefaultInputFactory(0, frame);
  }

  public GetRemoteInputForRollBack(frame: number) {
    let remoteInput = this.ISM.GetRemoteInputForFrame(frame);

    if (remoteInput != undefined && remoteInput != null) {
      this.ISM.OverWriteGuessedInput(remoteInput, frame);
      return remoteInput;
    }

    return this.ISM.GetGuessedInputForFrame(frame);
  }

  public GetGuessedInputForFrame(frame: number) {
    return this.ISM.GetGuessedInputForFrame(frame);
  }

  public OverWriteGuessedInputForFrame(input: Type, frame: number) {
    this.ISM.OverWriteGuessedInput(input, frame);
  }

  public ShouldRollBack() {
    return this.RBM.ShouldRollBack();
  }
}

export function initSynchroManager<Type>(
  fsm: FrameStorageManager,
  ism: InputStorageManager<Type>,
  defaultInputFactory: (frameAdvantage: number, frame: number) => Type,
  guessToRealCopy: (item: Type, frame: number) => Type
) {
  const FCM = new FrameComparisonManager(ism, fsm);
  const RBM = new RollBackManager<Type>(FCM, fsm);

  const syncMan = new SyncroManager<Type>(
    fsm,
    ism,
    FCM,
    RBM,
    guessToRealCopy,
    defaultInputFactory
  );
  return syncMan;
}
