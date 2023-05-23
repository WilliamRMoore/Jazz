export interface Position {
  x: number;
  y: number;
}

export interface IDrawable {
  draw(): void;
}

export interface ECBPoints {
  top: Position;
  right: Position;
  bottom: Position;
  left: Position;
}
