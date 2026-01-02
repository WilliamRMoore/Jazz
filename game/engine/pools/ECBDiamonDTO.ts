import { EcbHistoryDTO } from '../entity/components/ecb';
import { FlatVec } from '../physics/vector';
import { FillArrayWithFlatVec } from '../utils';
import { IPooledObject } from './Pool';

export class DiamondDTO implements EcbHistoryDTO, IPooledObject {
  readonly shape: Array<FlatVec>;

  constructor() {
    this.shape = new Array<FlatVec>(4);
    FillArrayWithFlatVec(this.shape);
  }

  public get Bottom(): FlatVec {
    return this.shape[0];
  }

  public get Left(): FlatVec {
    return this.shape[1];
  }

  public get Top(): FlatVec {
    return this.shape[2];
  }

  public get Right(): FlatVec {
    return this.shape[3];
  }

  public Zero() {
    for (let i = 0; i < this.shape.length; i++) {
      this.shape[i].X.Zero();
      this.shape[i].Y.Zero();
    }
  }
}
