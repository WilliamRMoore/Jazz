import { FlatVec, VectorAllocator, VectorAdder } from './FlatVec';

export const ShapeType = {
  Circle: 0,
  Box: 1,
};

export class FlatBody {
  private Position: FlatVec;
  private Velocity: FlatVec;

  readonly Area: number;
  readonly Radius: number;
  readonly Width: number;
  readonly Height: number;

  readonly IsStatic: boolean;
  readonly ShapeType: number;

  private constructor(
    position: FlatVec,
    area: number,
    radius: number,
    width: number,
    height: number,
    isStatic: boolean,
    shapeType: number
  ) {
    this.Position = position;
    this.Velocity = VectorAllocator();
    this.Area = area;
    this.Radius = radius;
    this.Width = width;
    this.Height = height;
    this.IsStatic = isStatic;
    this.ShapeType = shapeType;
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

  static CreateCircleBody(
    radius: number,
    position: FlatVec,
    isStatic: boolean = false
  ) {
    let area = radius * radius * Math.PI;

    return new FlatBody(
      position,
      area,
      radius,
      0,
      0,
      isStatic,
      ShapeType.Circle
    );
  }

  static CreateBoxBody(
    position: FlatVec,
    height: number,
    width: number,
    isStatic: boolean = false
  ) {
    let area = width * height;

    return new FlatBody(
      position,
      area,
      0,
      width,
      height,
      isStatic,
      ShapeType.Box
    );
  }
}
