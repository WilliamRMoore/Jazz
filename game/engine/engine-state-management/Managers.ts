import { InputAction } from '../../loops/Input';

export class FrameStorageManager {
  private readonly INITIAL_FRAME = 0;
  private syncFrame = 0;
  public LocalFrame = this.INITIAL_FRAME;
  public RemoteFrame = this.INITIAL_FRAME;
  public RemoteFrameAdvantage = 0;

  public get SyncFrame() {
    return this.syncFrame;
  }

  public SetSyncFrame(syncFrame: number) {
    this.syncFrame = syncFrame;
  }
}

export class InputStorageManagerNetworked<Type>
  implements IInputStorageManagerNetworked<Type>
{
  private readonly localInputStore: Array<Type>;
  private readonly remoteInputStore: Array<Type>;
  private readonly guessedInputStore: Array<Type>;
  InvalidGuessedFrameSpec: (guessed: Type, Real: Type) => boolean;

  constructor(invalidGuessedFrameSpec: (guessed: Type, real: Type) => boolean) {
    this.localInputStore = new Array<Type>(1000);
    this.remoteInputStore = new Array<Type>(1000);
    this.guessedInputStore = new Array<Type>(1000);
    this.InvalidGuessedFrameSpec = invalidGuessedFrameSpec;
  }

  public StoreLocalInput(input: Type, frame: number) {
    if (this.localInputStore[frame] === undefined) {
      this.localInputStore[frame] = input;
      return;
    }
  }

  public StoreGuessedInput(input: Type, frame: number) {
    if (this.guessedInputStore[frame] === undefined) {
      this.guessedInputStore[frame] = input;
      return;
    }
  }

  public OverWriteGuessedInput(input: Type, frame: number) {
    if (this.guessedInputStore[frame]) {
      this.guessedInputStore[frame] = input;
    }
  }

  public StoreRemoteInput(input: Type, frame: number) {
    if (this.remoteInputStore[frame] === undefined) {
      this.remoteInputStore[frame] = input;
      return;
    }
  }

  public GetRemoteInputForFrame(frame: number): Type {
    return this.remoteInputStore[frame];
  }

  public GetLastRemoteInput(): Type {
    return this.remoteInputStore[this.remoteInputStore.length - 1];
  }

  public GetLocalInputForFrame(frame: number): Type {
    return this.localInputStore[frame];
  }

  public GetGuessedInputForFrame(frame: number): Type {
    return this.guessedInputStore[frame];
  }

  public ReturnFirstWrongGuess(
    lowerBound: number,
    upperBound: number
  ): number | undefined {
    for (let i = lowerBound; i <= upperBound; i++) {
      const guessed = this.guessedInputStore[i];
      const real = this.remoteInputStore[i];

      if (guessed === undefined) {
        continue;
      }

      if (real === undefined || this.InvalidGuessedFrameSpec(guessed, real)) {
        return i - 1 < 0 ? 0 : i - 1;
      }
    }
    return undefined;
  }
}

export interface IInputStorageManagerNetworked<Type> {
  StoreLocalInput(input: Type, frame: number): void;
  StoreGuessedInput(input: Type, frame: number): void;
  OverWriteGuessedInput(input: Type, frame: number): void;
  StoreRemoteInput(input: Type, frame: number): void;
  GetRemoteInputForFrame(frame: number): Type;
  GetLastRemoteInput(): Type;
  GetLocalInputForFrame(frame: number): Type;
  GetGuessedInputForFrame(frame: number): Type;
  ReturnFirstWrongGuess(
    lowerBound: number,
    upperBound: number
  ): number | undefined;
}

export function InitISM<Type>(
  invalidSpec: (guessed: Type, real: Type) => boolean
) {
  const ISM = new InputStorageManagerNetworked<Type>(invalidSpec);
  return ISM;
}

export class InputStoreLocal<Type> implements IInputStoreLocal<Type> {
  private readonly P1localInputStore: Array<Type>;

  constructor() {
    this.P1localInputStore = new Array<Type>(1000);
  }

  StoreInputForFrame(frame: number, input: Type): void {
    this.P1localInputStore[frame] = input;
  }

  GetInputForFrame(frame: number): Type {
    return this.P1localInputStore[frame];
  }
}

export interface IInputStoreLocal<Type> {
  StoreInputForFrame(frame: number, input: Type): void;
  GetInputForFrame(frame: number): Type;
}

export class FrameComparisonManager<Type>
  implements IFrameComparisonManager<Type>
{
  private readonly maxRollBackFrames = 10000;
  private readonly frameAdvantageLimit = 4;
  private readonly inputStorageManager: InputStorageManagerNetworked<Type>;
  private readonly frameStorageManager: FrameStorageManager;

  constructor(
    inputStorageManager: InputStorageManagerNetworked<Type>,
    frameStorageManager: FrameStorageManager
  ) {
    this.inputStorageManager = inputStorageManager;
    this.frameStorageManager = frameStorageManager;
  }

  UpdateNextSyncFrame(): void {
    let finalFrame =
      this.frameStorageManager.RemoteFrame > this.frameStorageManager.LocalFrame
        ? this.frameStorageManager.LocalFrame
        : this.frameStorageManager.RemoteFrame;

    let syncFrame = this.inputStorageManager.ReturnFirstWrongGuess(
      this.frameStorageManager.SyncFrame + 1,
      finalFrame
    );

    if (syncFrame === undefined) {
      this.frameStorageManager.SetSyncFrame(finalFrame);
      return;
    }
    this.frameStorageManager.SetSyncFrame(syncFrame);
  }

  public GetCurrentSyncFrame(): number {
    return this.frameStorageManager.SyncFrame;
  }

  public IsWithinFrameAdvatnage(): boolean {
    let localFrameAdvantage = this.GetLocalFrameAdvantage();
    let frameAdvantageDifference =
      localFrameAdvantage - this.frameStorageManager.RemoteFrameAdvantage;
    return (
      localFrameAdvantage < this.maxRollBackFrames &&
      frameAdvantageDifference <= this.frameAdvantageLimit
    );
  }

  public ShouldStall(): boolean {
    return !this.IsWithinFrameAdvatnage();
  }

  public GetFrameAdvantageDifference(): number {
    return (
      this.GetLocalFrameAdvantage() -
      this.frameStorageManager.RemoteFrameAdvantage
    );
  }

  public GetLocalFrameAdvantage(): number {
    return (
      this.frameStorageManager.LocalFrame - this.frameStorageManager.RemoteFrame
    );
  }
}

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

export class SyncroManager<Type> {
  private readonly FSM: FrameStorageManager;
  private readonly ISM: IInputStorageManagerNetworked<Type>;
  private readonly FCM: IFrameComparisonManager<Type>;
  private readonly RBM: IRollBackManager<Type>;
  private readonly guessToRealCopy: (i: Type, frame: number) => Type;
  private readonly DefaultInputFactory: (
    frameAdvantage: number,
    frame: number
  ) => Type;

  constructor(
    fsm: FrameStorageManager,
    ism: IInputStorageManagerNetworked<Type>,
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

  public get LocalFrameNumber(): number {
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

  public GetRemoteInputForFrame(frame: number) {
    let remoteInput = this.ISM.GetRemoteInputForFrame(frame);
    if (remoteInput !== undefined) {
      return remoteInput;
    }

    let guess = this.ISM.GetLastRemoteInput();

    if (guess !== undefined) {
      let copy = this.guessToRealCopy(guess, frame);
      this.ISM.StoreGuessedInput(copy, frame);
      return copy;
    }

    return this.DefaultInputFactory(0, frame);
  }

  public GetRemoteInputForRollBack(frame: number) {
    let remoteInput = this.ISM.GetRemoteInputForFrame(frame);

    if (remoteInput !== undefined) {
      this.ISM.OverWriteGuessedInput(remoteInput, frame);
      return remoteInput;
    }

    return this.ISM.GetGuessedInputForFrame(frame);
  }

  public ShouldRollBack() {
    return this.RBM.ShouldRollBack();
  }
}

export const InputActionInvalidSpec = (
  guessed: InputAction,
  real: InputAction
) => {
  return (
    guessed.Action === real.Action &&
    guessed.LXAxis === real.LXAxis &&
    guessed.LYAxis === real.LYAxis &&
    guessed.RXAxis === real.RXAxis &&
    guessed.RYAxis === real.RYAxis
  );
};

export interface IFrameComparisonManager<Type> {
  UpdateNextSyncFrame(): void;
  GetCurrentSyncFrame(): number;
  IsWithinFrameAdvatnage(): boolean;
  GetFrameAdvantageDifference(): number;
  GetLocalFrameAdvantage(): number;
  ShouldStall(): boolean;
}

export function InitSynchroManager<Type>(
  fsm: FrameStorageManager,
  ism: InputStorageManagerNetworked<Type>,
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
