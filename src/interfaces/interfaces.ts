import { Position } from '../classes/Position';

export interface IDrawable {
  draw(): void;
}

export interface ECBPoints {
  top: Position;
  right: Position;
  bottom: Position;
  left: Position;
}
