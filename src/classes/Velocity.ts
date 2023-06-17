export class Velocity {
  vx: number;
  vy: number;

  constructor(vx = 0, vy = 0) {
    this.vx = vx;
    this.vy = vy;
  }
}

export function allocateVelocty(vx = 0, vy = 0) {
  return new Velocity(vx, vy);
}
