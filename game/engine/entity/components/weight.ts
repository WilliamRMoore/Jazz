import { FixedPoint } from '../../math/fixedPoint';

export class WeightComponent {
  public readonly Value: FixedPoint = new FixedPoint();

  constructor(weight: number) {
    this.Value.SetFromNumber(weight);
  }
}
