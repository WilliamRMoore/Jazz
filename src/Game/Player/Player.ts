//import { gravity } from '../../Globals/globals';
import { FlatVec, VectorAllocator } from '../../Physics/FlatVec';
import { DefaultECB, ECB } from '../ECB';
import {
  LedgeDetectorBoxData,
  LedgeDetectorData,
  PlayerData,
} from '../GameState/Clone';

export class Player {
  Grounded: boolean = false;
  LedgeGrab: boolean = false;
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
  CurrentStateMachineState: string = '';
  CurrentStateMachineStateFrame: number = 0;

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

  UpdatePlayerPosition(x: number, y: number) {
    this.PlayerPosition.X = x;
    this.PlayerPosition.Y = y;
    this.ECB.MoveToPosition(x, y);
    this.ECB.Update();
    this.LedgeDetector.MoveTo(x, y);
  }

  AddToPlayersPosition(vx: number, vy: number) {
    this.PlayerPosition.X += vx;
    this.PlayerPosition.Y += vy;
    this.ECB.MoveToPosition(this.PlayerPosition.X, this.PlayerPosition.Y);
    this.ECB.Update();
    this.LedgeDetector.MoveTo(this.PlayerPosition.X, this.PlayerPosition.Y);
  }

  SetPlayerState(pd: PlayerData) {
    this.Grounded = pd.Grounded;
    this.LedgeGrab = pd.LedgeGrab;
    this.FacingRight = pd.FacingRight;
    this.CurrentStateMachineState = pd.CurrentStateMachineState;
    this.CurrentStateMachineStateFrame = pd.CurrentStateMachineStateFrame;

    this.PreviousPlayerPosition.X = pd.PreviousePlayerPosition.X;
    this.PreviousPlayerPosition.Y = pd.PreviousePlayerPosition.Y;

    this.PlayerPosition.X = pd.PlayerPosition.X;
    this.PlayerPosition.Y = pd.PlayerPosition.Y;

    this.PlayerVelocity.X = pd.PlayerVelocity.X;
    this.PlayerVelocity.Y = pd.PlayerVelocity.Y;

    this.ECB.SetECBState(pd.ECBData);
    this.LedgeDetector.SetLedgeDetectorData(pd.LedgeDetectorData);
  }
}

export type LedgeDetectorBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class LedgeDetector {
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

  GetRightSideDetector() {
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

    return vertArr;
  }

  GetLeftSideDetector() {
    const vertArr = new Array<FlatVec>();
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

  SetLedgeDetectorData(data: LedgeDetectorData) {
    this.YOffset = data.YOffset;
    this.SetLedgeDetectorBoxData(data.Front);
  }

  private SetLedgeDetectorBoxData(data: LedgeDetectorBoxData) {
    this.Front.x = data.x;
    this.Front.y = data.y;
    this.Front.height = data.height;
    this.Front.width = data.width;
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

export function InitPlayer(position: FlatVec, faceRight = true) {
  const ECB = DefaultECB();
  const maxXVelocity = 1000;
  const maxYVelocity = 1000;
  const groundDecay = 0.8;
  const arialDecay = 0.8;
  const playerPosition = position;
  const jumpVelocity = 20;
  const numberOfJumps = 2;
  const facingRight = faceRight;
  const maxWalkSpeed = 12;
  const maxRunSpeed = 18;
  const arialImpulseLimit = 18;
  const P = new Player(
    ECB,
    maxXVelocity,
    maxYVelocity,
    groundDecay,
    arialDecay,
    playerPosition,
    jumpVelocity,
    numberOfJumps,
    facingRight,
    maxWalkSpeed,
    maxRunSpeed,
    arialImpulseLimit
  );
  P.Grounded = false;
  return P;
}
