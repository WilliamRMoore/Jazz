import { FlatVec, VectorAdder, VectorAllocator } from '../Physics/FlatVec';
import ECB, { ECBOffsets } from './ECB';
import PlayerPosition from './PlayerPosition';

export class Player {
  playerPosition: PlayerPosition;
  playerVelocity: FlatVec;
  ECB: ECB;

  constructor() {
    this.playerVelocity = VectorAllocator();
  }

  draw() {
    this.ECB.draw();
    this.playerPosition.draw();
  }

  Move(v: FlatVec) {
    this.playerPosition.update(VectorAdder(this.playerPosition.position, v));
    this.ECB.Move(this.playerPosition.position);
  }

  MoveTo(p: FlatVec) {
    this.playerPosition.update(p);
    this.ECB.Move(p);
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
    this.player.playerPosition = new PlayerPosition(position);
    return this;
  }

  withECBOffsets(ecbOffsets: ECBOffsets) {
    this.player.ECB = new ECB(ecbOffsets);
    this.player.ECB.Move(this.player.playerPosition.position);
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
