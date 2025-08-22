import { FlatVec } from '../physics/vector';
import { IPooledObject } from './Pool';

export class ClosestPointsResult implements IPooledObject {
  private c1X: number = 0;
  private c1Y: number = 0;
  private c2X: number = 0;
  private c2Y: number = 0;

  public Zero(): void {
    this.c1X = 0;
    this.c1Y = 0;
    this.c2X = 0;
    this.c2Y = 0;
  }

  public Set(c1X: number, c1Y: number, c2X: number, c2Y: number) {
    this.c1X = c1X;
    this.c1Y = c1Y;
    this.c2X = c2X;
    this.c2Y = c2Y;
  }

  public get C1X(): number {
    return this.c1X;
  }

  public get C1Y(): number {
    return this.c1Y;
  }

  public get C2X(): number {
    return this.c2X;
  }

  public get C2Y(): number {
    return this.c2Y;
  }
}
