export class PlayerFlagsComponent {
  private facingRight: boolean = false;
  private fastFalling: boolean = false;
  private hitPauseFrames: number = 0;
  private intangabilityFrames: number = 0;
  private invincibilityFrames: number = 0;
  private superArmorFrames: number = 0;
  private disablePlatformDetection: number = 0;
  private disableLedgeDetection: number = 0;
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

  public DecrementInvincibilityFrames(): void {
    this.invincibilityFrames--;
  }

  public DecrementSuperArmorFrames(): void {
    this.superArmorFrames--;
  }

  public SetIntangabilityFrames(frames: number): void {
    this.intangabilityFrames = frames;
  }

  public SetInvincibilityFrames(frames: number): void {
    this.invincibilityFrames = frames;
  }

  public SetSuperArmorFrames(frames: number): void {
    this.superArmorFrames = frames;
  }

  public DecrementDisablePlatDetection(): void {
    this.disablePlatformDetection--;
  }

  public SetDisablePlatFrames(frameCount: number): void {
    this.disablePlatformDetection = frameCount;
  }

  public SetDisableLedgeDetectionFrames(frameCount: number): void {
    this.disableLedgeDetection = frameCount;
  }

  public DecrementDisableLedgeDetection(): void {
    this.disableLedgeDetection--;
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

  public ZeroDisableLedgeDetection(): void {
    this.disableLedgeDetection = 0;
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

  public get IsInvincible(): boolean {
    return this.invincibilityFrames > 0;
  }

  public get HasSuperArmor(): boolean {
    return this.superArmorFrames > 0;
  }

  public get IsPlatDetectDisabled(): boolean {
    return this.disablePlatformDetection > 0;
  }

  public get IsLedgeDetectDisabled(): boolean {
    return this.disableLedgeDetection > 0;
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

  public get IntangabilityFrames(): number {
    return this.intangabilityFrames;
  }

  public get InvincibilityFrames(): number {
    return this.invincibilityFrames;
  }

  public get SuperArmorFrames(): number {
    return this.superArmorFrames;
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
    this.disableLedgeDetection = history.disableLedgeDetectionFrames;
    this.velocityDecayActive = history.velocityDecayActive;
    this.invincibilityFrames = history.invincibilityFrames;
    this.superArmorFrames = history.superArmorFrames;
    this.shieldJump = history.shieldJump;
    this.lastTechFrame = history.lastTechFrame;
  }
}

export type FlagsHist = {
  facingRight: boolean;
  fasFalling: boolean;
  hitPauseFrames: number;
  intangabilityFrames: number;
  invincibilityFrames: number;
  superArmorFrames: number;
  disablePlatformDetectionFrames: number;
  disableLedgeDetectionFrames: number;
  velocityDecayActive: boolean;
  shieldJump: boolean;
  lastTechFrame: number;
};
