import { FixedPoint } from '../../math/fixedPoint';

export class SpeedsComponent {
  public readonly GroundedVelocityDecayRaw: number;
  public readonly AerialVelocityDecayRaw: number;
  public readonly AirDogeSpeedRaw: number;
  public readonly DodeRollSpeedRaw: number;
  public readonly GetUpRollForwardSpeedRaw: number;
  public readonly GetUpRollBackSpeedRaw: number;
  public readonly ArielVelocityMultiplierRaw: number;
  public readonly AerialSpeedInpulseLimitRaw: number;
  public readonly MaxWalkSpeedRaw: number;
  public readonly MaxRunSpeedRaw: number;
  public readonly WalkSpeedMulitplierRaw: number;
  public readonly RunSpeedMultiplierRaw: number;
  public readonly FastFallSpeedRaw: number;
  public readonly FallSpeedRaw: number;
  public readonly GravityRaw: number;
  public readonly DashMultiplierRaw: number;
  public readonly MaxDashSpeedRaw: number;
  public readonly WallKickVelocityXRaw: number;
  public readonly WallKickVelocityYRaw: number;

  // Might need a general Aerial speed limit for each character

  constructor(
    grndSpeedVelDecay: FixedPoint,
    aerialVelocityDecay: FixedPoint,
    aerialSpeedInpulseLimit: FixedPoint,
    aerialVelocityMultiplier: FixedPoint,
    airDodgeSpeed: FixedPoint,
    dodgeRollSpeed: FixedPoint,
    getUpRollRightSpeed: FixedPoint,
    getUpRollLeftSpeed: FixedPoint,
    maxWalkSpeed: FixedPoint,
    maxRunSpeed: FixedPoint,
    walkSpeedMultiplier: FixedPoint,
    runSpeedMultiplier: FixedPoint,
    fastFallSpeed: FixedPoint,
    fallSpeed: FixedPoint,
    dashMultiplier: FixedPoint,
    maxDashSpeed: FixedPoint,
    gravity: FixedPoint,
    wallKickVelocityX: FixedPoint,
    wallKickVelocityY: FixedPoint
  ) {
    this.GroundedVelocityDecayRaw = grndSpeedVelDecay.Raw;
    this.AerialVelocityDecayRaw = aerialVelocityDecay.Raw;
    this.AerialSpeedInpulseLimitRaw = aerialSpeedInpulseLimit.Raw;
    this.ArielVelocityMultiplierRaw = aerialVelocityMultiplier.Raw;
    this.AirDogeSpeedRaw = airDodgeSpeed.Raw;
    this.DodeRollSpeedRaw = dodgeRollSpeed.Raw;
    this.GetUpRollForwardSpeedRaw = getUpRollRightSpeed.Raw;
    this.GetUpRollBackSpeedRaw = getUpRollLeftSpeed.Raw;
    this.MaxWalkSpeedRaw = maxWalkSpeed.Raw;
    this.MaxRunSpeedRaw = maxRunSpeed.Raw;
    this.WalkSpeedMulitplierRaw = walkSpeedMultiplier.Raw;
    this.RunSpeedMultiplierRaw = runSpeedMultiplier.Raw;
    this.FastFallSpeedRaw = fastFallSpeed.Raw;
    this.FallSpeedRaw = fallSpeed.Raw;
    this.DashMultiplierRaw = dashMultiplier.Raw;
    this.MaxDashSpeedRaw = maxDashSpeed.Raw;
    this.GravityRaw = gravity.Raw;
    this.WallKickVelocityXRaw = wallKickVelocityX.Raw;
    this.WallKickVelocityYRaw = wallKickVelocityY.Raw;
  }
}

export class SpeedsComponentConfigBuilder {
  private readonly groundedVelocityDecay: FixedPoint = new FixedPoint();
  private readonly aerialVelocityDecay: FixedPoint = new FixedPoint();
  private readonly aerialSpeedInpulseLimit: FixedPoint = new FixedPoint();
  private readonly aerialSpeedMultiplier: FixedPoint = new FixedPoint();
  private readonly airDodgeSpeed: FixedPoint = new FixedPoint();
  private readonly dodgeRollSpeed: FixedPoint = new FixedPoint();
  private readonly getUpRollForwardSpeed: FixedPoint = new FixedPoint();
  private readonly getUpRollBackSpeed: FixedPoint = new FixedPoint();
  private readonly maxWalkSpeed: FixedPoint = new FixedPoint();
  private readonly maxRunSpeed: FixedPoint = new FixedPoint();
  private readonly dashMutiplier: FixedPoint = new FixedPoint();
  private readonly maxDashSpeed: FixedPoint = new FixedPoint();
  private readonly walkSpeedMulitplier: FixedPoint = new FixedPoint();
  private readonly runSpeedMultiplier: FixedPoint = new FixedPoint();
  private readonly fastFallSpeed: FixedPoint = new FixedPoint();
  private readonly fallSpeed: FixedPoint = new FixedPoint();
  private readonly gravity: FixedPoint = new FixedPoint();
  private readonly wallKcikVelocityX: FixedPoint = new FixedPoint();
  private readonly wallKcikVelocityY: FixedPoint = new FixedPoint();

  constructor() {}

  SetAerialSpeeds(
    aerialVelocityDecay: number,
    aerialSpeedImpulseLimit: number,
    aerialSpeedMultiplier: number
  ) {
    this.aerialVelocityDecay.SetFromNumber(aerialVelocityDecay);
    this.aerialSpeedInpulseLimit.SetFromNumber(aerialSpeedImpulseLimit);
    this.aerialSpeedMultiplier.SetFromNumber(aerialSpeedMultiplier);
  }

  SetDodgeSpeeds(airDodgeSpeed: number, dodgeRollSpeed: number): void {
    this.airDodgeSpeed.SetFromNumber(airDodgeSpeed);
    this.dodgeRollSpeed.SetFromNumber(dodgeRollSpeed);
  }

  SetGetUpRollSpeeds(
    getUpRollForwardSpeed: number,
    getUpRollBackSpeed: number
  ): void {
    this.getUpRollForwardSpeed.SetFromNumber(getUpRollForwardSpeed);
    this.getUpRollBackSpeed.SetFromNumber(getUpRollBackSpeed);
  }

  SetWallKickVelocity(x: number, y: number): void {
    this.wallKcikVelocityX.SetFromNumber(x);
    this.wallKcikVelocityY.SetFromNumber(y);
  }

  SetFallSpeeds(
    fastFallSpeed: number,
    fallSpeed: number,
    gravity: number = 1
  ): void {
    this.fallSpeed.SetFromNumber(fallSpeed);
    this.fastFallSpeed.SetFromNumber(fastFallSpeed);
    this.gravity.SetFromNumber(gravity);
  }

  SetWalkSpeeds(maxWalkSpeed: number, walkSpeedMultiplier: number): void {
    this.maxWalkSpeed.SetFromNumber(maxWalkSpeed);
    this.walkSpeedMulitplier.SetFromNumber(walkSpeedMultiplier);
  }

  SetRunSpeeds(maxRunSpeed: number, runSpeedMultiplier: number): void {
    this.runSpeedMultiplier.SetFromNumber(runSpeedMultiplier);
    this.maxRunSpeed.SetFromNumber(maxRunSpeed);
  }

  SetDashSpeeds(dashMultiplier: number, maxDashSpeed: number): void {
    this.dashMutiplier.SetFromNumber(dashMultiplier);
    this.maxDashSpeed.SetFromNumber(maxDashSpeed);
  }

  SetGroundedVelocityDecay(groundedVelocityDecay: number): void {
    this.groundedVelocityDecay.SetFromNumber(groundedVelocityDecay);
  }

  Build(): SpeedsComponent {
    return new SpeedsComponent(
      this.groundedVelocityDecay,
      this.aerialVelocityDecay,
      this.aerialSpeedInpulseLimit,
      this.aerialSpeedMultiplier,
      this.airDodgeSpeed,
      this.dodgeRollSpeed,
      this.getUpRollForwardSpeed,
      this.getUpRollBackSpeed,
      this.maxWalkSpeed,
      this.maxRunSpeed,
      this.walkSpeedMulitplier,
      this.runSpeedMultiplier,
      this.fastFallSpeed,
      this.fallSpeed,
      this.dashMutiplier,
      this.maxDashSpeed,
      this.gravity,
      this.wallKcikVelocityX,
      this.wallKcikVelocityY
    );
  }
}
