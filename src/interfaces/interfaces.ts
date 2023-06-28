import { FlatVec } from '../Physics/FlatVec';

export interface IDrawable {
  draw(): void;
}

export interface ECBPoints {
  top: FlatVec;
  right: FlatVec;
  bottom: FlatVec;
  left: FlatVec;
}
