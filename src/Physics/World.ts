import { Player } from '../classes/Player';
import Stage from '../classes/Stage';

const PLAYERS = new Array(4) as Player[];
let stage: Stage;

function init() {}

function addPlayer(player: Player) {
  let playerCount = PLAYERS.length;
  if (playerCount < 4) {
    PLAYERS.push(player);
  }
}

function tick() {
  for (let index = 0; index < PLAYERS.length; index++) {
    const player = PLAYERS[index];

    player.updatePosition({ x: 200, y: 200 });
  }
}
