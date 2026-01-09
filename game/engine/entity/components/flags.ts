import { IHistoryEnabled } from '../componentHistory';

export type FlagsSnapShot = {
  FacingRight: boolean;
  FastFalling: boolean;
  HitPauseFrames: number;
  IntangabilityFrames: number;
  DisablePlatDetection: number;
  VeloctyDecay: boolean;
};

export class PlayerFlagsComponent implements IHistoryEnabled<FlagsSnapShot> {
  private facingRight: boolean = false;
  private fastFalling: boolean = false;
  private hitPauseFrames: number = 0;
  private intangabilityFrames: number = 0;
  private disablePlatformDetection: number = 0;
  private velocityDecayActive: boolean = true;

  public FaceRight(): void {
    this.facingRight = true;
  }

  public FaceLeft(): void {
    this.facingRight = false;
  }

  public ChangeDirections(): void {
    this.facingRight = !this.facingRight;
  }

  public FastFallOn(): void {
    this.fastFalling = true;
  }

  public FastFallOff(): void {
    this.fastFalling = false;
  }

  public VelocityDecayOff(): void {
    this.velocityDecayActive = false;
  }

  public VelocityDecayOn(): void {
    this.velocityDecayActive = true;
  }

  public SetHitPauseFrames(frames: number): void {
    this.hitPauseFrames = frames;
  }

  public DecrementHitPause(): void {
    this.hitPauseFrames--;
  }

  public DecrementIntangabilityFrames(): void {
    this.intangabilityFrames--;
  }

  public SetIntangabilityFrames(frames: number): void {
    this.intangabilityFrames = frames;
  }

  public DecrementDisablePlatDetection(): void {
    this.disablePlatformDetection--;
  }

  public SetDisablePlatFrames(frameCount: number): void {
    this.disablePlatformDetection = frameCount;
  }

  public ZeroIntangabilityFrames(): void {
    this.intangabilityFrames = 0;
  }

  public ZeroHitPauseFrames(): void {
    this.hitPauseFrames = 0;
  }

  public ZeroDisablePlatDetection(): void {
    this.disablePlatformDetection = 0;
  }

  public get IsFastFalling(): boolean {
    return this.fastFalling;
  }

  public get IsFacingRight(): boolean {
    return this.facingRight;
  }

  public get IsFacingLeft(): boolean {
    return !this.facingRight;
  }

  public get IsVelocityDecayActive(): boolean {
    return this.velocityDecayActive;
  }

  public get IsInHitPause(): boolean {
    return this.hitPauseFrames > 0;
  }

  public get IsIntangible(): boolean {
    return this.intangabilityFrames > 0;
  }

  public get IsPlatDetectDisabled(): boolean {
    return this.disablePlatformDetection > 0;
  }

  public GetIntangabilityFrames(): number {
    return this.intangabilityFrames;
  }

  public HasNoVelocityDecay(): boolean {
    return !this.velocityDecayActive;
  }

  public SnapShot(): FlagsSnapShot {
    return {
      FacingRight: this.facingRight,
      FastFalling: this.fastFalling,
      HitPauseFrames: this.hitPauseFrames,
      IntangabilityFrames: this.intangabilityFrames,
      DisablePlatDetection: this.disablePlatformDetection,
      VeloctyDecay: this.velocityDecayActive,
    } as FlagsSnapShot;
  }

  public SetFromSnapShot(snapShot: FlagsSnapShot): void {
    this.fastFalling = snapShot.FastFalling;
    this.facingRight = snapShot.FacingRight;
    this.hitPauseFrames = snapShot.HitPauseFrames;
    this.intangabilityFrames = snapShot.IntangabilityFrames;
    this.disablePlatformDetection = snapShot.DisablePlatDetection;
    this.velocityDecayActive = snapShot.VeloctyDecay;
  }
}
