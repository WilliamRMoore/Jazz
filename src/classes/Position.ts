export class PositionAllocator {
  constructor() {}

  allocate(x = 0, y = 0): Position {
    return new Position(x, y);
  }
}

export class Position {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
