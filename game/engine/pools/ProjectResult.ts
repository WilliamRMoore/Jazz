import { IPooledObject } from './Pool';

export class ProjectionResult implements IProjectionResult, IPooledObject {
  private min: number;
  private max: number;
  constructor(x: number = 0, y: number = 0) {
    this.min = x;
    this.max = y;
  }

  public get Max(): number {
    return this.max;
  }

  public get Min(): number {
    return this.min;
  }

  public SetMinMax(min: number, max: number): void {
    this.min = min;
    this.max = max;
  }

  public Zero() {
    this.min = 0;
    this.max = 0;
  }
}

export interface IProjectionResult {
  get Max(): number;
  get Min(): number;
  SetMinMax(x: number, y: number): void;
}
