import { Component, ComponentCollection, Entity } from '../../../ECS';

export class SpeedsComponent extends Component {
  static CompName = 'SpeedsComp';
  public readonly CompName = SpeedsComponent.CompName;
  //   private MaxXVelocity: number;
  //   private MaxYVelocity: number;
  //TODO: move this to be managed by the system, not the component. This is a universal value.

  public readonly GroundedVelocityDecay: number;
  public readonly AerialVelocityDecay: number;
  public readonly AerialSpeedInpulseLimit: number;
  public readonly MaxWalkSpeed: number;
  public readonly MaxRunSpeed: number;
  public readonly WalkSpeedMulitplier: number;
  public readonly RunSpeedMultiplier: number;
  public readonly FastFallSpeed: number;
  public readonly FallSpeed: number;

  EntId: number = -1;

  constructor(
    grndSpeedVelDecay: number,
    aerialVelocityDecay: number,
    aerialSpeedInpulseLimit: number,
    maxWalkSpeed: number,
    maxRunSpeed: number,
    walkSpeedMultiplier: number,
    runSpeedMultiplier: number,
    fastFallSpeed: number,
    fallSpeed: number
  ) {
    super();
    this.GroundedVelocityDecay = grndSpeedVelDecay;
    this.AerialVelocityDecay = aerialVelocityDecay;
    this.AerialSpeedInpulseLimit = aerialSpeedInpulseLimit;
    this.MaxWalkSpeed = maxWalkSpeed;
    this.MaxRunSpeed = maxRunSpeed;
    this.WalkSpeedMulitplier = walkSpeedMultiplier;
    this.RunSpeedMultiplier = runSpeedMultiplier;
    this.FastFallSpeed = fastFallSpeed;
    this.FallSpeed = fallSpeed;
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }
}

export class SpeedsComponentBuilder {
  private GroundedVelocityDecay: number;
  private AerialVelocityDecay: number;
  private AerialSpeedInpulseLimit: number;
  private MaxWalkSpeed: number;
  private MaxRunSpeed: number;
  private WalkSpeedMulitplier: number;
  private RunSpeedMultiplier: number;
  private FastFallSpeed: number;
  private FallSpeed: number;

  SetAerialSpeeds(
    aerialVelocityDecay: number,
    aerialSpeedImpulseLimit: number
  ) {
    this.AerialVelocityDecay = aerialVelocityDecay;
    this.AerialSpeedInpulseLimit = aerialSpeedImpulseLimit;
  }

  SetFallSpeeds(fastFallSpeed: number, fallSpeed: number) {
    this.FallSpeed = fallSpeed;
    this.FastFallSpeed = fastFallSpeed;
  }

  SetWalkSpeeds(maxWalkSpeed: number, walkSpeedMultiplier: number) {
    this.MaxWalkSpeed = maxWalkSpeed;
    this.WalkSpeedMulitplier = walkSpeedMultiplier;
  }

  SetRunSpeeds(maxRunSpeed: number, runSpeedMultiplier: number) {
    this.RunSpeedMultiplier = runSpeedMultiplier;
    this.MaxRunSpeed = maxRunSpeed;
  }

  Build() {
    return new SpeedsComponent(
      this.GroundedVelocityDecay,
      this.AerialVelocityDecay,
      this.AerialSpeedInpulseLimit,
      this.MaxWalkSpeed,
      this.MaxRunSpeed,
      this.WalkSpeedMulitplier,
      this.RunSpeedMultiplier,
      this.FastFallSpeed,
      this.FallSpeed
    );
  }
}

export function UnboxSpeedsComponent(
  comps: ComponentCollection
): SpeedsComponent | undefined {
  return comps.get(SpeedsComponent.CompName) as SpeedsComponent | undefined;
}
