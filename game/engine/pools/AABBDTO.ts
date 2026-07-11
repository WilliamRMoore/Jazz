import { FixedPoint } from '../math/fixedPoint';
import { ToFp } from '../utils';
import { IPooledObject } from './Pool';

export class AABBDTO implements IPooledObject {
  readonly minX: FixedPoint = ToFp(0);
  readonly minY: FixedPoint = ToFp(0);
  readonly width: FixedPoint = ToFp(0);
  readonly height: FixedPoint = ToFp(0);

  constructor() {}

  Zero() {
    this.minX.Zero();
    this.minY.Zero();
    this.width.Zero();
    this.height.Zero();
  }
}
