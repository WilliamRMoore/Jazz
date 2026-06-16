export class PlayerFlagsComponent {
  private facingRight: boolean = false;
  private fastFalling: boolean = false;
  private hitPauseFrames: number = 0;
  private intangabilityFrames: number = 0;
  private disablePlatformDetection: number = 0;
  private velocityDecayActive: boolean = true;
  private shieldJump: boolean = false;
  private lastTechFrame: number = 0;

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

  public JumpFromShield(): void {
    this.shieldJump = true;
  }

  public ResetJumpFromShield(): void {
    this.shieldJump = false;
  }

  public SetLastTechFrame(frame: number): void {
    (this, (this.lastTechFrame = frame));
  }

  public ZeroTechLockOut(): void {
    this.lastTechFrame = 0;
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

  public get JumpedFromShield(): boolean {
    return this.shieldJump;
  }

  public get HitPauseFrames(): number {
    return this.hitPauseFrames;
  }

  public get DisablePlatDetectionFrames(): number {
    return this.disablePlatformDetection;
  }

  public GetIntangabilityFrames(): number {
    return this.intangabilityFrames;
  }

  public get LastTechFrame(): number {
    return this.lastTechFrame;
  }

  public HasNoVelocityDecay(): boolean {
    return !this.velocityDecayActive;
  }

  public set CompState(history: FlagsHist) {
    this.facingRight = history.facingRight;
    this.fastFalling = history.fasFalling;
    this.hitPauseFrames = history.hitPauseFrames;
    this.intangabilityFrames = history.intangabilityFrames;
    this.disablePlatformDetection = history.disablePlatformDetectionFrames;
    this.velocityDecayActive = history.velocityDecayActive;
    this.shieldJump = history.shieldJump;
    this.lastTechFrame = history.lastTechFrame;
  }
}

export type FlagsHist = {
  facingRight: boolean;
  fasFalling: boolean;
  hitPauseFrames: number;
  intangabilityFrames: number;
  disablePlatformDetectionFrames: number;
  velocityDecayActive: boolean;
  shieldJump: boolean;
  lastTechFrame: number;
};
