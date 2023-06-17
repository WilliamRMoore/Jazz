import { FlatVec, VectorAdder, VectorAllocator } from './FlatVec';

export class Circle {
  private Position: FlatVec;
  private Velocity: FlatVec;
  readonly Area: number;
  readonly Radius: number;
  readonly IsStatic: boolean;

  constructor(
    position: FlatVec,
    area: number,
    radius: number,
    isStatic: boolean
  ) {
    this.Position = position;
    this.Velocity = VectorAllocator();
    this.Area = area;
    this.Radius = radius;
    this.IsStatic = isStatic;
  }

  Move(v: FlatVec) {
    this.Position = VectorAdder(this.Position, v);
  }

  MoveTo(v: FlatVec) {
    this.Position = v;
  }

  GetPos() {
    return this.Position;
  }

  static Create(radius: number, position: FlatVec, isStatic: boolean = false) {
    let area = radius * radius * Math.PI;
    return new Circle(position, area, radius, isStatic);
  }
}
