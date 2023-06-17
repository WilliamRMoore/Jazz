import { FlatVec } from './FlatVec';

export default class FlatTransform {
  readonly PositionX: number;
  readonly PositionY: number;
  readonly Sin: number = 0;
  readonly Cos: number = 0;

  static readonly Zero = this.CreateFromNumber(0, 0, 0);

  constructor(x: number, y: number, angle: number) {
    this.PositionX = x;
    this.PositionY = y;
    this.Sin = Math.sin(angle);
    this.Cos = Math.cos(angle);
  }

  static CreateFromNumber(x: number, y: number, angle: number) {
    return new FlatTransform(x, y, angle);
  }

  static CreateFromFlatVec(position: FlatVec, angle: number) {
    return new FlatTransform(position.X, position.Y, angle);
  }
}
