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

  public GetLocalFrameNumber(): number {
    return this.FSM.LocalFrame;
  }

  public IncrementLocalFrameNumber() {
    this.FSM.LocalFrame++;
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
