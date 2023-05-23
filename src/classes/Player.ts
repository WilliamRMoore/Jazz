import { ECBPoints, Position } from '../interfaces/interfaces';
import ECB from './ECB';
import PlayerPosition from './PlayerPosition';

export class Player {
  playerPosition: PlayerPosition;
  ECB: ECB;

  draw() {
    this.ECB.draw();
    this.playerPosition.draw();
  }

  updatePosition(position: Position) {
    this.playerPosition.update(position);
    this.ECB.updatePosition(position);
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

  withECB(ecbp: ECBPoints) {
    this.player.ECB = new ECB(ecbp);
    return this;
  }
}

interface ISpecifyPosition {
  atPosition(position: Position): ISpecifyECB;
}

interface ISpecifyECB {
  withECB(ecbp: ECBPoints): IPlayerBuilder;
}

interface IBuildPlayer {
  build(): Player;
}

interface IPlayerBuilder extends ISpecifyPosition, IBuildPlayer {}
