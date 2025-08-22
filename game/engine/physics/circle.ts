export class Circle {
  private radius: number;
  private x: number = 0;
  private y: number = 0;
  constructor(radius: number) {
    this.radius = radius;
  }

  public get Radius(): number {
    return this.radius;
  }

  public get X(): number {
    return this.x;
  }

  public get Y(): number {
    return this.y;
  }

  public SetXY(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public SetRadius(r: number) {
    this.radius = r;
  }
}
