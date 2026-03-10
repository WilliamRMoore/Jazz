import { InputAction } from '../input/Input';
import { RemoteInputManager } from './inputManager';

export class PIDController {
  // These "Gains" need tuning. Start small!
  private kP: number;
  private kI: number;
  private kD: number;

  private integral = 0;
  private lastError = 0;
  // Sensible starting values for a 60Hz game loop with a +/- 0.1Hz adjustment range.
  // kP: Provides proportional response to the current error.
  // kI: Corrects small, persistent errors over time (clock drift).
  // kD: Dampens the response to prevent overshooting and oscillation.
  constructor(p = 0.02, i = 0.0005, d = 0.01) {
    this.kP = p;
    this.kI = i;
    this.kD = d;
  }

  public update(error: number): number {
    this.integral += error;

    // Cap the integral to prevent "windup" (runaway speed changes)
    this.integral = Math.max(Math.min(this.integral, 10), -10);

    const derivative = error - this.lastError;
    this.lastError = error;

    return this.kP * error + this.kI * this.integral + this.kD * derivative;
  }
}

export class RollBackManager {
  private localFrame: () => number;
  private remoteInput: RemoteInputManager;
  private remoteFrameAdvantage = 0;
  private maxRollBackFrames = 90;
  private maxFrameAdvantage = 4;
  private syncFrame = 0;
  private pidController: PIDController;

  constructor(localFrame: () => number, remoteInput: RemoteInputManager) {
    this.localFrame = localFrame;
    this.remoteInput = remoteInput;
    this.pidController = new PIDController();
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

  public GetTargetLoopSpeed(): number {
    const nominalSpeed = 60;
    const minSpeed = 59.9;
    const maxSpeed = 60.1;

    // If we are outside the frame advantage window, we will likely stall.
    // The game loop should handle stalling; here we just return the nominal speed
    // as clock adjustment is not the right tool for large desyncs.
    if (!this.IsWithInFrameAdvantage) {
      return nominalSpeed;
    }

    // The "error" is how far our frame advantage is from the remote's.
    // A positive error means we are further ahead and should slow down.
    // A negative error means we are falling behind and should speed up.
    const error = this.frameAdvantageDifference;

    // The PID controller calculates an adjustment value.
    // We subtract it because a positive error (ahead) needs to decrease the speed.
    const adjustment = this.pidController.update(error);
    const targetSpeed = nominalSpeed - adjustment;

    // Clamp the speed to the desired min/max range.
    return Math.max(minSpeed, Math.min(targetSpeed, maxSpeed));
  }
}
