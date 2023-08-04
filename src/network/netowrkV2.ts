import { InputStorageManager } from '../input/InputStorageManager';
import { FrameComparisonManager } from './FrameComparisonManager';
import { RemoteLocalFrameManager } from './RemoteLocalFrameManager';

export class NetworkV2<Type> {
  private readonly MAX_ROLLBACK_FRAMES = 60;
  private readonly FRAME_ADVANTAGE_LIMIT = 3;
  private readonly INITIAL_FRAME = 0;
  private readonly InputManager: InputStorageManager<Type>;
  private localFrame = this.INITIAL_FRAME;
  private remoteFrame = this.INITIAL_FRAME;
  private syncFrame = this.INITIAL_FRAME;
  private remoteFrameAdvantage = 0;

  constructor(inputManager: InputStorageManager<Type>) {
    this.InputManager = inputManager;
  }

  ShouldRollBack(): boolean {
    if (this.localFrame > this.syncFrame && this.remoteFrame > this.syncFrame) {
      return true;
    }
    return false;
  }

  IsTimeSynced(): boolean {
    let localFrameAdvantage = this.localFrame - this.remoteFrame;
    let frameAdvantageDifference =
      localFrameAdvantage - this.remoteFrameAdvantage;
    return (
      localFrameAdvantage < this.MAX_ROLLBACK_FRAMES &&
      frameAdvantageDifference <= this.FRAME_ADVANTAGE_LIMIT
    );
  }

  UpdateRemoteFrame(remoteFrame: number) {
    this.remoteFrame = remoteFrame;
    this.remoteFrameAdvantage = this.localFrame - remoteFrame;
  }

  UpdateLocalFrame(localFrame: number) {
    this.localFrame = localFrame;
  }

  UpdateSynchronization() {
    this.syncFrame = this.DetermineSyncFrame();
    if (this.ShouldRollBack()) {
      console.log('ROLLING BACK!');
      return true;
    }
    return false;
  }

  private DetermineSyncFrame(): number {
    let finalFrame =
      this.remoteFrame > this.localFrame ? this.localFrame : this.remoteFrame;
    let syncFrame = this.InputManager.RetreiveFirstInvalidInputFrameNumber(
      this.syncFrame,
      finalFrame
    );
    if (syncFrame == null) {
      return finalFrame;
    }
    return syncFrame;
  }
}

export class NetworkV3<Type> {
  private readonly MAX_ROLLBACK_FRAMES = 60;
  private readonly FRAME_ADVANTAGE_LIMIT = 3;
  //private readonly INITIAL_FRAME = 0;

  // private readonly InputManager: InputStorageManager<Type>;
  private readonly FrameComparisonManager: FrameComparisonManager<Type>;
  private readonly RemoteLocalFrameManager: RemoteLocalFrameManager;

  //private syncFrame = this.INITIAL_FRAME;
  //private remoteFrameAdvantage = 0;

  constructor(
    //inputManager: InputStorageManager<Type>,
    frameComparisonManager: FrameComparisonManager<Type>,
    remoteLocalFrameManager: RemoteLocalFrameManager
  ) {
    //this.InputManager = inputManager;
    this.FrameComparisonManager = frameComparisonManager;
    this.RemoteLocalFrameManager = remoteLocalFrameManager;
  }

  AreFramesSynced(): boolean {
    let localFrameAdvantage =
      this.RemoteLocalFrameManager.GetLocalFrameAdvantage();
    let frameAdvantageDifference =
      localFrameAdvantage -
      this.RemoteLocalFrameManager.GetRemoteFrameAdvantage();
    return (
      localFrameAdvantage < this.MAX_ROLLBACK_FRAMES &&
      frameAdvantageDifference <= this.FRAME_ADVANTAGE_LIMIT
    );
  }

  ShouldRollBack() {
    this.FrameComparisonManager.GetNextSyncFrame(
      this.RemoteLocalFrameManager.GetLocalFrame(),
      this.RemoteLocalFrameManager.GetRemoteFrame()
    );
    return this.FrameComparisonManager.ShouldRollBack(
      this.RemoteLocalFrameManager.GetLocalFrame(),
      this.RemoteLocalFrameManager.GetRemoteFrame()
    );
  }
}
