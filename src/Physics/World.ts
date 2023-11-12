import { Create, Player } from '../classes/Character/Player';
import Stage from '../classes/Stage';
import {
  FlatVec,
  VectorAllocator,
  VectorMultiplier,
  VectorNegator,
} from './FlatVec';
import { keys } from '../input/SimpleInput';
import { IntersectsPolygons } from './Collisions';
import { GetInput, listenForGamePadInput } from '../input/GamePadInput';

let frame = 0;

const PLAYERS = new Array(4) as Player[];
let stage: Stage;

export function init() {
  const playerBuilder = Create();

  const p1 = playerBuilder
    .atPosition(VectorAllocator(600, 400))
    .withECBOffsets({
      top: { xOffset: 0, yOffset: -100 },
      right: { xOffset: 50, yOffset: -50 },
      bottom: { xOffset: 0, yOffset: 0 },
      left: { xOffset: -50, yOffset: -50 },
    })
    .build();

  addPlayer(p1);

  stage = new Stage([
    new FlatVec(500, 500), // top left
    new FlatVec(1000, 500), // top right
    new FlatVec(1000, 520), // bottom right
    new FlatVec(500, 520), // bottom left
  ]);

  //listenForGamePadInput();
}

function addPlayer(player: Player) {
  PLAYERS[0] = player;
}

export function tick() {
  Input();
  UpdatePlayers();
  TestForStageCollisions();
  ExecuteDrawCall();
  frame += 1;
}

function Input() {
  if (keys.d.pressed) {
    PLAYERS[0].AddVelocity(VectorAllocator(2, 0));
  }
  if (keys.a.pressed) {
    PLAYERS[0].AddVelocity(VectorAllocator(-2, 0));
  }
  if (keys.w.pressed) {
    PLAYERS[0].AddVelocity(VectorAllocator(0, -50));
  }
  if (keys.s.pressed) {
    PLAYERS[0].AddVelocity(VectorAllocator(0, 2));
  }

  let input = GetInput();
  //console.log(input);
  // let r = pollInput();

  // if (r != null && r.Action == 'dash') {
  //   PLAYERS[0].Run();
  // }
  //console.log(r);
}

function TestForStageCollisions() {
  // for (let i = 0; i < PLAYERS.length; i++) {
  //   const playerI = PLAYERS[i];
  //   const result = IntersectsPolygons(
  //     playerI.ECB.GetVerticies(),
  //     stage.GetVerticies()
  //   );
  //   if (result.collision === true) {
  //     playerI.Move(
  //       VectorMultiplier(VectorNegator(result.normal!), result.depth!)
  //     );
  //   }
  // }

  const result = IntersectsPolygons(
    PLAYERS[0].ECB.GetVerticies(),
    stage.GetVerticies()
  );
  if (result.collision) {
    //console.log(result);
    PLAYERS[0].Move(
      VectorMultiplier(VectorNegator(result.normal!), result.depth)
    );
    PLAYERS[0].Ground = true;
  }

  if (!result.collision) {
    PLAYERS[0].Ground = false;
  }
}

function UpdatePlayers() {
  for (let i = 0; i < PLAYERS.length; i++) {
    const p = PLAYERS[i];
    if (p) {
      p.Update(frame);
    }
  }
}

function ExecuteDrawCall() {
  // for (let i = 0; i < PLAYERS.length; i++) {
  //   PLAYERS[i].draw();
  // }
  //stage.draw();
  PLAYERS[0].draw();
}
