import { FlatVec, VectorAllocator } from '../FlatVec';

export class Boundry {
  private Start: FlatVec;
  private End: FlatVec;
  constructor(x1: number = 0, y1: number = 0, x2: number = 0, y2: number = 0) {
    this.Start = VectorAllocator(x1, y1);
    this.End = VectorAllocator(x2, y2);
  }

  public GetStart() {
    return this.Start;
  }

  public GetStartX(): number {
    return this.Start.X;
  }

  public GetStartY(): number {
    return this.Start.Y;
  }

  public GetEnd(): FlatVec {
    return this.End;
  }

  public GetEndX(): number {
    return this.End.X;
  }

  public GetEndY(): number {
    return this.End.Y;
  }
}
