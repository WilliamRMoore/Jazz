//import { gravity } from '../../Globals/globals';
import { FlatVec } from '../../Physics/FlatVec';
import { ECB } from '../ECB';

let gravity = 0.5;

export class Player {
  Grounded: boolean = false;
  MaxXVelocity: number;
  MinXVelocity: number;
  MaxYVelocity: number;
  MinYVelocity: number;
  GroundVelocityDecay: number;
  ArialVelocityDecay: number;
  PlayerPosition: FlatVec;
  PlayerVelocity: FlatVec;
  ECB: ECB;
  JumpVelocity: number;
  NumberOfJumps: number;
  JumpCount: number = 0;
  FacingRight: boolean;

  constructor(
    ecb: ECB,
    maxXV: number,
    maxYV: number,
    grndVDecay: number,
    arlVDecay: number,
    playerPosition: FlatVec,
    jumpVelocity: number,
    numOfJumps: number,
    facingRight: boolean = true
  ) {
    this.ECB = ecb;
    this.MaxXVelocity = maxXV;
    this.MaxYVelocity = maxYV;
    this.MinXVelocity = -maxXV;
    this.MinYVelocity = -maxYV;
    this.GroundVelocityDecay = grndVDecay;
    this.ArialVelocityDecay = arlVDecay;
    this.PlayerPosition = playerPosition;
    this.PlayerVelocity = new FlatVec(0, 0);
    this.JumpVelocity = jumpVelocity;
    this.NumberOfJumps = numOfJumps;
    this.FacingRight = facingRight;
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

  ApplyVelocityDecay() {
    if (this.Grounded) {
      if (this.PlayerVelocity.X > 0) {
        this.PlayerVelocity.X -= this.GroundVelocityDecay;
      }
      if (this.PlayerVelocity.X < 0) {
        this.PlayerVelocity.X += this.GroundVelocityDecay;
      }
      if (this.PlayerVelocity.Y > 0) {
        this.PlayerVelocity.Y -= this.GroundVelocityDecay;
      }
      if (this.PlayerVelocity.Y < 0) {
        this.PlayerVelocity.Y += this.GroundVelocityDecay;
      }
      if (Math.abs(this.PlayerVelocity.X) < 0.5) {
        this.PlayerVelocity.X = 0;
      }
    }
    if (!this.Grounded) {
      if (this.PlayerVelocity.X > 0) {
        this.PlayerVelocity.X -= this.ArialVelocityDecay;
      }
      if (this.PlayerVelocity.X < 0) {
        this.PlayerVelocity.X += this.ArialVelocityDecay;
      }
      if (this.PlayerVelocity.Y > 0) {
        this.PlayerVelocity.Y -= this.ArialVelocityDecay;
      }
      if (this.PlayerVelocity.Y < 0) {
        this.PlayerVelocity.Y += this.ArialVelocityDecay;
      }
      if (Math.abs(this.PlayerVelocity.X) < 0.5) {
        this.PlayerVelocity.X = 0;
      }
    }
  }

  ApplyVelocity() {
    this.PlayerPosition.X += this.PlayerVelocity.X;
    this.PlayerPosition.Y += this.PlayerVelocity.Y;
  }

  ApplyGravity() {
    if (this.Grounded) {
      this.PlayerVelocity.Y = 0;
      return;
    }

    this.PlayerVelocity.Y += gravity;

    if (this.PlayerVelocity.Y >= this.MaxYVelocity) {
      this.PlayerVelocity.Y = this.MaxYVelocity;
    }
  }
}
