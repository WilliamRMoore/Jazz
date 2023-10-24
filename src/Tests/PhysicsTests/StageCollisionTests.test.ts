import { test, expect, beforeEach } from '@jest/globals';
import { StageCollisionSystem } from '../../Game/Collision/StageCollisionSystem';
import { Player } from '../../Game/Player/Player';
import { ECB, ECBPoints } from '../../Game/ECB';
import { FlatVec } from '../../Physics/FlatVec';
import Stage from '../../classes/Stage';

let player1: Player;
let player2: Player;
let stage: Stage;
let SCS: StageCollisionSystem;

beforeEach(() => {
  let points = {
    top: new FlatVec(0, 100),
    right: new FlatVec(100, 50),
    bottom: new FlatVec(0, 0),
    left: new FlatVec(-100, 50),
  } as ECBPoints;

  let position = new FlatVec(300, 300);

  let ecb = new ECB(position, points);

  player1 = new Player(ecb, 1000, 1000, 2, 2, position, 20, 2, true, 60, 100);
  player1.ECB.Update();

  let points2 = {
    top: new FlatVec(0, 100),
    right: new FlatVec(100, 50),
    bottom: new FlatVec(0, 0),
    left: new FlatVec(-100, 50),
  } as ECBPoints;

  let position2 = new FlatVec(600, 300);

  let ecb2 = new ECB(position2, points2);

  player2 = new Player(ecb2, 1000, 1000, 2, 2, position2, 20, 2, true, 60, 100);
  player2.ECB.Update();

  let stageVecs = new Array<FlatVec>();

  stageVecs.push(
    new FlatVec(300, 500),
    new FlatVec(500, 500),
    new FlatVec(500, 600),
    new FlatVec(300, 600)
  );

  stage = new Stage(stageVecs);

  SCS = new StageCollisionSystem([player1, player2], stage);
});

test('Player1 After Stage Collision', () => {
  let x = 350;
  let y = 520;

  player1.PlayerPosition.X = x;
  player1.PlayerPosition.Y = y;
  player1.ECB.MoveToPosition(x, y);
  player1.ECB.Update();

  SCS.handle();

  console.log(player1);
});
