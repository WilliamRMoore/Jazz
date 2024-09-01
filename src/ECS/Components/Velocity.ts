import { FlatVec, VectorAllocator } from '../../Physics/FlatVec';
import { Component, ComponentCollection, Entity } from '../ECS';

export class VelocityComponent extends Component {
  static CompName = 'VelComp';
  public readonly CompName = VelocityComponent.CompName;
  public readonly Vel: FlatVec;

  constructor() {
    super();
    this.Vel = VectorAllocator();
  }

  Attach(ent: Entity): void {
    this.EntId = ent.ID;
  }

  public AddCalmpedXImpulse(clamp: number, x: number) {
    const upperBound = Math.abs(clamp);
    const lowerBound = -Math.abs(clamp);
    const pvx = this.Vel.X;

    if (x > 0 && pvx < upperBound) {
      this.Vel.X += Math.min(x, upperBound - pvx);
      return;
    }

    if (x < 0 && pvx > lowerBound) {
      this.Vel.X += Math.max(x, lowerBound - pvx);
      return;
    }
  }
}

export function UnboxVelocityComponent(
  comps: ComponentCollection
): VelocityComponent | undefined {
  return comps.get(VelocityComponent.CompName) as VelocityComponent | undefined;
}
