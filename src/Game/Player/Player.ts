//import { gravity } from '../../Globals/globals';
import { FlatVec, VectorAllocator } from '../../Physics/FlatVec';
import { ECB } from '../ECB';

export class Player {
  Grounded: boolean = false;
  MaxXVelocity: number;
  MinXVelocity: number;
  MaxYVelocity: number;
  MinYVelocity: number;
  GroundVelocityDecay: number;
  ArialVelocityDecay: number;
  PreviousPlayerPosition: FlatVec;
  PlayerPosition: FlatVec;
  PlayerVelocity: FlatVec;
  ECB: ECB;
  LedgeDetector: LedgeDetector;
  JumpVelocity: number;
  NumberOfJumps: number;
  JumpCount: number = 0;
  FacingRight: boolean;
  MaxWalkSpeed: number;
  MaxRunSpeed: number;
  AirSpeedInpulseLimit: number;
  FastFallSpeed: number;
  FallSpeed: number;

  constructor(
    ecb: ECB,
    maxXV: number,
    maxYV: number,
    grndVDecay: number,
    arlVDecay: number,
    playerPosition: FlatVec,
    jumpVelocity: number,
    numOfJumps: number,
    facingRight: boolean = true,
    maxWalkSpeed: number,
    maxRunSpeed: number,
    airSpeedInpulseLimit: number = 10,
    fastFallSpeed: number = 15,
    fallSpeed: number = -1
  ) {
    this.ECB = ecb;
    this.MaxXVelocity = maxXV;
    this.MaxYVelocity = maxYV;
    this.MinXVelocity = -maxXV;
    this.MinYVelocity = -maxYV;
    this.GroundVelocityDecay = grndVDecay;
    this.ArialVelocityDecay = arlVDecay;
    this.PreviousPlayerPosition = new FlatVec(
      playerPosition.X,
      playerPosition.Y
    );
    this.PlayerPosition = playerPosition;
    this.PlayerVelocity = new FlatVec(0, 0);
    this.JumpVelocity = jumpVelocity;
    this.NumberOfJumps = numOfJumps;
    this.FacingRight = facingRight;
    this.MaxWalkSpeed = maxWalkSpeed;
    this.MaxRunSpeed = maxRunSpeed;
    this.AirSpeedInpulseLimit = airSpeedInpulseLimit;
    this.FastFallSpeed = fastFallSpeed;
    this.FallSpeed = fallSpeed < 1 ? this.AirSpeedInpulseLimit : fallSpeed;
    this.LedgeDetector = new LedgeDetector(
      playerPosition.X,
      playerPosition.Y - 50,
      30,
      70
    );
    this.ECB.MoveToPosition(this.PlayerPosition.X, this.PlayerPosition.Y);
    this.ECB.Update();
  }

  AddVelocity(v: FlatVec) {
    if (v.X > 0) {
      this.PlayerVelocity.X =
        this.PlayerVelocity.X + v.X < this.MaxXVelocity
          ? (this.PlayerVelocity.X += v.X)
          : (this.PlayerVelocity.X = this.MaxXVelocity);
    }
    if (v.X < 0) {
      this.PlayerVelocity.X =
        this.PlayerVelocity.X + v.X > this.MinXVelocity
          ? (this.PlayerVelocity.X += v.X)
          : (this.PlayerVelocity.X = this.MinXVelocity);
    }
    if (v.Y > 0) {
      this.PlayerVelocity.Y =
        this.PlayerVelocity.Y + v.Y < this.MaxYVelocity
          ? (this.PlayerVelocity.Y += v.Y)
          : (this.PlayerVelocity.Y = this.MaxYVelocity);
    }
    if (v.Y < 0) {
      this.PlayerVelocity.Y =
        this.PlayerVelocity.Y + v.Y > this.MinYVelocity
          ? (this.PlayerVelocity.Y += v.Y)
          : (this.PlayerVelocity.Y = this.MinYVelocity);
    }
  }
}

type LedgeDetectorBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};
class LedgeDetector {
  YOffset: number;
  Front: LedgeDetectorBox;
  constructor(
    x: number,
    y: number,
    height: number,
    width: number,
    yOffset: number = -130
  ) {
    this.Front = { x, y, width, height } as LedgeDetectorBox;
    this.YOffset = yOffset;
  }

  MoveTo(x: number, y: number) {
    this.Front.x = x;
    this.Front.y = y + this.YOffset;
  }

  GetVerticies() {
    const vertArr = new Array<FlatVec>();
    vertArr.push(VectorAllocator(this.Front.x, this.Front.y));
    vertArr.push(
      VectorAllocator(this.Front.x + this.Front.width, this.Front.y)
    );
    vertArr.push(
      VectorAllocator(
        this.Front.x + this.Front.width,
        this.Front.y + this.Front.height
      )
    );
    vertArr.push(
      VectorAllocator(this.Front.x, this.Front.y + this.Front.height)
    );

    vertArr.push(
      VectorAllocator(this.Front.x - this.Front.width, this.Front.y)
    );
    vertArr.push(VectorAllocator(this.Front.x, this.Front.y));
    vertArr.push(
      VectorAllocator(this.Front.x, this.Front.y + this.Front.height)
    );
    vertArr.push(
      VectorAllocator(
        this.Front.x - this.Front.width,
        this.Front.y + this.Front.height
      )
    );

    return vertArr;
  }
}

export function AddClampedXImpulseToPlayer(
  player: Player,
  clamp: number,
  x: number
) {
  const upperBound = Math.abs(clamp);
  const lowerBound = -Math.abs(clamp);
  const pvx = player.PlayerVelocity.X;

  if (x > 0 && pvx < upperBound) {
    let test = pvx + x;
    if (test < upperBound) {
      player.PlayerVelocity.X += x;
    }
    if (test > upperBound) {
      player.PlayerVelocity.X += upperBound - pvx;
    }
    return;
  }

  if (x < 0 && pvx > lowerBound) {
    let test = pvx + x;
    if (test > lowerBound) {
      player.PlayerVelocity.X += x;
    }
    if (test < lowerBound) {
      player.PlayerVelocity.X += lowerBound - pvx;
    }
    return;
  }
}

export function AddClampedYImpulseToPlayer(
  player: Player,
  clamp: number,
  y: number
) {
  const upperBound = Math.abs(clamp);
  const lowerBound = -Math.abs(clamp);
  const pvy = player.PlayerVelocity.Y;

  // going down
  if (y > 0 && pvy < upperBound) {
    let test = pvy + y;
    if (test < upperBound) {
      player.PlayerVelocity.Y += y;
    }
    if (test > upperBound) {
      player.PlayerVelocity.Y += upperBound - pvy;
    }
  }
}
