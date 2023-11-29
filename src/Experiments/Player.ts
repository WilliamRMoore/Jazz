import { ctx, gravity } from '../Globals/globals';
import { FlatVec, VectorAdder, VectorAllocator } from '../Physics/FlatVec';
//import { GetInputForFrame } from '../../input/GamePadInput';
import ECB, { ECBOffsets } from './ECB';
import StateMachine from './StateMachine';

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
  StateMachine = new StateMachine(this);
  JumpVelocity: number;
  currentStateFrame: number = 0;

  constructor() {
    this.playerVelocity = VectorAllocator();
    this.MaxXVelocity = 6;
    this.MaxYVelocity = 3000;
    this.MinXVelocity = -6;
    this.MinYVelocity = -20;
    this.VelocityDecay = 0.2;
    this.JumpVelocity = 12;

    this.StateMachine.addState('idle', {
      onEnter: this.onIdleEnter,
      onUpdate: this.onIdleUpdate,
    })
      .addState('run', {
        onEnter: this.onRunEnter,
        onUpdate: this.onRunUpdate,
        onExit: this.onRunExit,
      })
      .addState('jump', {
        onEnter: this.onJumpEnter,
        onUpdate: this.onJumpUpdate,
        onExit: this.onJumpExit,
      });

    this.StateMachine.setState('idle');
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

  Update(frame: number) {
    // if (GetInputForFrame(frame).Action == 'run') {
    //   this.StateMachine.setState('run');
    // } else if (GetInputForFrame(frame).Action == 'jump') {
    //   this.StateMachine.setState('jump');
    // } else {
    //   this.StateMachine.setState('idle');
    // }
    // this.StateMachine.update(frame);
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
  }

  private onIdleEnter() {
    this.currentStateFrame = 0;
    console.log('in idle');
  }

  private onIdleUpdate(frame: number) {
    this.ApplyVelocity();
    this.ApplyVelocityDecay();
    this.ApplyGravity();
    this.ECB.Move(this.playerPosition);

    this.currentStateFrame += 1;

    console.log(`In Idle for ${this.currentStateFrame}`);
  }

  private onRunEnter() {
    this.currentStateFrame = 0;
    console.log('Entering run');
  }

  private onRunUpdate(frame: number) {
    // const input = GetInputForFrame(frame);
    // this.AddVelocity(VectorAllocator(input.LXAxsis, input.LYAxsis));
    // this.ApplyVelocity();
    // this.ApplyVelocityDecay();
    // this.ApplyGravity();
    // this.ECB.Move(this.playerPosition);
    // this.currentStateFrame += 1;
  }

  private onRunExit() {
    console.log('Exiting Run state');
  }

  private onJumpEnter() {
    this.currentStateFrame = 0;
    console.log('Entering Jump State');
    this.Ground = false;
  }

  private onJumpUpdate(frame: number) {
    // const input = GetInputForFrame(frame);
    // const prevInput = GetInputForFrame(frame - 1);
    // if (input.Action == 'jump' && prevInput.Action != 'jump') {
    //   this.AddVelocity(VectorAllocator(input.LXAxsis, -this.JumpVelocity));
    // } else {
    //   this.AddVelocity(VectorAllocator(input.LXAxsis, 0));
    // }
    // this.ApplyVelocity();
    // this.ApplyVelocityDecay();
    // this.ApplyGravity();
    // this.ECB.Move(this.playerPosition);
    // this.currentStateFrame += 1;
  }

  private onJumpExit() {
    console.log('Exiting Jump State');
  }

  // public Run() {
  //   this.StateMachine.setState('run');
  // }
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
