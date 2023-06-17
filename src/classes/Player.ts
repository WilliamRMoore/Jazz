import ECB, { ECBOffsets } from './ECB';
import PlayerPosition from './PlayerPosition';
import { Position } from './Position';
import { Velocity, allocateVelocty } from './Velocity';

export class Player {
  playerPosition: PlayerPosition;
  playerVelocity: Velocity;
  ECB: ECB;

  constructor() {
    this.playerVelocity = allocateVelocty();
  }

  draw() {
    this.ECB.draw();
    this.playerPosition.draw();
  }

  updatePosition(position: Position) {
    this.playerPosition.update(position);
    this.ECB.updatePosition(position);
  }

  updateVelocity(velocity: Velocity) {
    this.playerVelocity = velocity;
  }

  update() {
    // this.playerPosition.position.x += this.playerVelocity.vx;
    // this.playerPosition.position.y += this.playerVelocity.vy;
    this.playerPosition.addVelocity(this.playerVelocity);
    this.ECB.updatePosition(this.playerPosition.position);
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

  atPosition(position: Position): ISpecifyECB {
    this.player.playerPosition = new PlayerPosition(position);
    return this;
  }

  withECBOffsets(ecbOffsets: ECBOffsets) {
    this.player.ECB = new ECB(ecbOffsets);
    return this;
  }
}

interface ISpecifyPosition {
  atPosition(position: Position): ISpecifyECB;
}

interface ISpecifyECB {
  withECBOffsets(ecbOff: ECBOffsets): IPlayerBuilder;
}

interface IBuildPlayer {
  build(): Player;
}

interface IPlayerBuilder extends ISpecifyPosition, IBuildPlayer {}
