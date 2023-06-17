import FlatTransform from './FlatTransform';
import { FlatVec, Transform, VectorAdder, VectorAllocator } from './FlatVec';

export class Box {
  private Position: FlatVec;
  private Velocity: FlatVec;
  private rotation: number = 0;
  private readonly verticies: FlatVec[];
  private transFormedVerts: FlatVec[];
  private transformUpdateRequired: boolean;
  public readonly Triangles: number[];
  readonly Area: number;
  readonly Width: number;
  readonly Height: number;

  readonly IsStatic: boolean;

  private constructor(
    position: FlatVec,
    area: number,
    width: number,
    height: number,
    isStatic: boolean
  ) {
    this.Position = position;
    this.Velocity = VectorAllocator();
    this.Area = area;
    this.Width = width;
    this.Height = height;
    this.IsStatic = isStatic;
    this.verticies = Box.CreateBoxVerticies(width, height);
    this.transFormedVerts = new Array<FlatVec>(this.verticies.length);
    this.transformUpdateRequired = true;
    this.Triangles = Box.CreateBoxTriangles();
  }

  Move(v: FlatVec) {
    this.Position = VectorAdder(this.Position, v);
    this.transformUpdateRequired = true;
  }

  MoveTo(v: FlatVec) {
    this.Position = v;
    this.transformUpdateRequired = true;
  }

  Rotate(amount: number) {
    this.rotation += amount;
    this.transformUpdateRequired = true;
  }

  GetPos() {
    return this.Position;
  }

  GetTransformVerticies() {
    if (this.transformUpdateRequired) {
      const transform = FlatTransform.CreateFromFlatVec(
        this.Position,
        this.rotation
      );
      for (let i = 0; i < this.verticies.length; i++) {
        const v = this.verticies[i];
        this.transFormedVerts[i] = Transform(v, transform);
      }
    }
    this.transformUpdateRequired = false;
    return this.transFormedVerts;
  }

  static Create(
    position: FlatVec,
    height: number,
    width: number,
    isStatic: boolean = false
  ) {
    let area = width * height;

    return new Box(position, area, width, height, isStatic);
  }

  private static CreateBoxVerticies(width: number, height: number) {
    const left = -width / 2;
    const right = left + width;
    const bottom = -height / 2;
    const top = bottom + height;

    const verticies = new Array<FlatVec>(4);
    verticies[0] = VectorAllocator(left, top);
    verticies[1] = VectorAllocator(right, top);
    verticies[2] = VectorAllocator(right, bottom);
    verticies[3] = VectorAllocator(left, bottom);

    return verticies;
  }

  private static CreateBoxTriangles() {
    const triangles = new Array<number>(6);
    triangles[0] = 0;
    triangles[1] = 1;
    triangles[2] = 2;
    triangles[3] = 0;
    triangles[4] = 2;
    triangles[5] = 3;

    return triangles;
  }
}
