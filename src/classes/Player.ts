import { ctx, gravity } from '../Globals/globals';
import { FlatVec, VectorAdder, VectorAllocator } from '../Physics/FlatVec';
import ECB, { ECBOffsets } from './ECB';

export class Player {
  Ground: boolean = false;
  MaxXVelocity: number;
  MinXVelocity: number;
  MaxYVelocity: number;
  MinYVelocity: number;
  VelocityDecay: number;
  playerPosition: FlatVec;
  playerVelocity: FlatVec;
  ECB: ECB;

  constructor() {
    this.playerVelocity = VectorAllocator();
    this.MaxXVelocity = 6;
    this.MaxYVelocity = 3000;
    this.MinXVelocity = -6;
    this.MinYVelocity = -20;
    this.VelocityDecay = 0.2;
  }

  draw() {
    this.ECB.draw();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(this.playerPosition.X, this.playerPosition.Y);
    ctx.lineTo(this.playerPosition.X + 10, this.playerPosition.Y);
    ctx.stroke();
    ctx.moveTo(this.playerPosition.X, this.playerPosition.Y);
    ctx.lineTo(this.playerPosition.X - 10, this.playerPosition.Y);
    ctx.stroke();
    ctx.moveTo(this.playerPosition.X, this.playerPosition.Y);
    ctx.lineTo(this.playerPosition.X, this.playerPosition.Y + 10);
    ctx.stroke();
    ctx.moveTo(this.playerPosition.X, this.playerPosition.Y);
    ctx.lineTo(this.playerPosition.X, this.playerPosition.Y - 10);
    ctx.stroke();
    ctx.closePath();
  }

  Move(v: FlatVec) {
    this.playerPosition = VectorAdder(this.playerPosition, v);
    this.ECB.Move(this.playerPosition);
  }

  MoveTo(p: FlatVec) {
    this.playerPosition = p;
    this.ECB.Move(p);
  }

  AddVelocity(v: FlatVec) {
    if (v.X > 0) {
      this.playerVelocity.X =
        this.playerVelocity.X + v.X < this.MaxXVelocity
          ? (this.playerVelocity.X += v.X)
          : (this.playerVelocity.X = this.MaxXVelocity);
    }
    if (v.X < 0) {
      this.playerVelocity.X =
        this.playerVelocity.X + v.X > this.MinXVelocity
          ? (this.playerVelocity.X += v.X)
          : (this.playerVelocity.X = this.MinXVelocity);
    }
    if (v.Y > 0) {
      this.playerVelocity.Y =
        this.playerVelocity.Y + v.Y < this.MaxYVelocity
          ? (this.playerVelocity.Y += v.Y)
          : (this.playerVelocity.Y = this.MaxYVelocity);
    }
    if (v.Y < 0) {
      this.playerVelocity.Y =
        this.playerVelocity.Y + v.Y > this.MinYVelocity
          ? (this.playerVelocity.Y += v.Y)
          : (this.playerVelocity.Y = this.MinYVelocity);
    }
  }

  ApplyVelocityDecay() {
    debugger;
    if (this.playerVelocity.X > 0) {
      this.playerVelocity.X -= this.VelocityDecay;
    }
    if (this.playerVelocity.X < 0) {
      this.playerVelocity.X += this.VelocityDecay;
    }
    if (this.playerVelocity.Y > 0) {
      this.playerVelocity.Y -= this.VelocityDecay;
    }
    if (this.playerVelocity.Y < 0) {
      this.playerVelocity.Y += this.VelocityDecay;
    }
    if (Math.abs(this.playerVelocity.X) < 0.5) {
      this.playerVelocity.X = 0;
    }
  }

  ApplyVelocity() {
    this.playerPosition.X += this.playerVelocity.X;
    this.playerPosition.Y += this.playerVelocity.Y;
  }

  Update() {
    // this.playerPosition.X += this.playerVelocity.X;
    // this.playerPosition.Y += this.playerVelocity.Y;
    this.ApplyVelocity();
    this.ApplyVelocityDecay();
    this.ApplyGravity();
    this.ECB.Move(this.playerPosition);
  }

  ApplyGravity() {
    if (this.Ground) {
      this.playerVelocity.Y = 0;
      return;
    }

    this.playerVelocity.Y += gravity;

    if (this.playerVelocity.Y >= this.MaxYVelocity) {
      this.playerVelocity.Y = this.MaxYVelocity;
    }
    // this.playerVelocity.Y < this.MaxYVelocity
    //   ? (this.playerVelocity.Y += gravity)
    //   : (this.playerVelocity.Y = this.MaxYVelocity);
  }
}

export function Create(): IPlayerBuilder {
  return new PlayerBuilderImplementation();
}

class PlayerBuilderImplementation implements IPlayerBuilder {
  player: Player;
  constructor() {
    this.player = new Player();
  }

  build(): Player {
    return this.player;
  }

  atPosition(position: FlatVec): ISpecifyECB {
    this.player.playerPosition = position;
    return this;
  }

  withECBOffsets(ecbOffsets: ECBOffsets) {
    this.player.ECB = new ECB(ecbOffsets);
    this.player.ECB.Move(this.player.playerPosition);
    return this;
  }
}

interface ISpecifyPosition {
  atPosition(position: FlatVec): ISpecifyECB;
}

interface ISpecifyECB {
  withECBOffsets(ecbOff: ECBOffsets): IPlayerBuilder;
}

interface IBuildPlayer {
  build(): Player;
}

interface IPlayerBuilder extends ISpecifyPosition, IBuildPlayer {}
