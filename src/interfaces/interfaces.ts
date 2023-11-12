import { FlatVec } from '../Physics/FlatVec';

export interface IDrawable {
  draw(ctx: CanvasRenderingContext2D): void;
}

export interface ECBPoints {
  top: FlatVec;
  right: FlatVec;
  bottom: FlatVec;
  left: FlatVec;
}
