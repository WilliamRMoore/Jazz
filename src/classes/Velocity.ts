export class Velocity {
  vx: number;
  vy: number;

  constructor(vx = 0, vy = 0) {
    this.vx = vx;
    this.vy = vy;
  }
}

// export class VelocityAllocator {
//   constructor() {}

//   allocate(vx = 0, vy = 0): Velocity {
//     return new Velocity(vx, vy);
//   }

export function allocateVelocty(vx = 0, vy = 0) {
  return new Velocity(vx, vy);
}
