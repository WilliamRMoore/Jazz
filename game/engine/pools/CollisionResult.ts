import { IPooledObject } from './Pool';

export interface ICollisionResult {
  SetCollisionTrue(x: number, y: number, depth: number): void;
  SetCollisionFalse(): void;
  get NormX(): number;
  get NormY(): number;
  get Collision(): boolean;
  get Depth(): number;
}

export class CollisionResult implements ICollisionResult, IPooledObject {
  private collision: boolean = false;
  private normX: number = 0;
  private normY: number = 0;
  private depth: number = 0;

  public SetCollisionTrue(x: number, y: number, depth: number): void {
    this.collision = true;
    this.normX = x;
    this.normY = y;
    this.depth = depth;
  }

  public SetCollisionFalse(): void {
    this.collision = false;
    this.normX = 0;
    this.normY = 0;
    this.depth = 0;
  }

  public get Collision(): boolean {
    return this.collision;
  }

  public get Depth(): number {
    return this.depth;
  }

  public get NormX(): number {
    return this.normX;
  }

  public get NormY(): number {
    return this.normY;
  }

  public Zero(): void {
    this.SetCollisionFalse();
  }
}
