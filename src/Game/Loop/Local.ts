import { InputStorageManager } from '../../input/InputStorageManager';
import {
  GetInput,
  InputAction,
  InvalidGuessSpec,
  listenForGamePadInput,
} from '../../input/GamePadInput';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { StateMachine } from '../State/StateMachine';
import { Player } from '../Player/Player';
import { DefaultECB } from '../ECB';
import { FlatVec } from '../../Physics/FlatVec';
import Stage from '../../classes/Stage';
import { StageCollisionSystem } from '../Collision/StageCollisionSystem';
import { ctx } from '../../Globals/globals';
import {
  idle,
  walk,
  turnWalk,
  run,
  jumpSquat,
} from '../../Game/State/CharacterStates/Test';

const ECB = DefaultECB();
const P1 = new Player(
  ECB,
  1000,
  1000,
  1,
  1,
  new FlatVec(100, 100),
  20,
  2,
  true,
  10,
  100
);

const ISM = new InputStorageManager<InputAction>(InvalidGuessSpec);
const FSM = new FrameStorageManager();
const SM = new StateMachine(P1, ISM, FSM);

let stageVecs = new Array<FlatVec>();

stageVecs.push(
  new FlatVec(300, 500),
  new FlatVec(1000, 500),
  new FlatVec(1000, 600),
  new FlatVec(300, 600)
);

const stage = new Stage(stageVecs);

const playersArr = new Array<Player>();
playersArr.push(P1);
const SCS = new StageCollisionSystem(playersArr, stage);

const FPS = 60;
let now = {} as number;
let then = Date.now();
const interval = 1000 / FPS;
let delta = {} as number;
let frame = 0;

listenForGamePadInput();

SetUpStateMachine(SM);

export function GameLoop() {
  window.requestAnimationFrame(() => GameLoop());
  ctx.clearRect(0, 0, 1920, 1080);
  now = Date.now();
  delta = now - then;

  if (delta > interval) {
    Logic();
    draw();
    frame++;
  }
}

function Logic() {
  FSM.LocalFrame = frame;
  const input = GetInput();
  ISM.StoreLocalInput(input, frame);

  if (input.Action == 'run') {
    console.log('walk');
    SM.SetState('walk');
  } else {
    SM.SetState('idle');
  }
  SM.Update();
  SCS.handle();
}

function draw() {
  stage.draw(ctx);
  P1.draw(ctx);
}

function SetUpStateMachine(sm: StateMachine) {
  sm.AddState('idle', idle);
  sm.AddState('walk', walk);
}
