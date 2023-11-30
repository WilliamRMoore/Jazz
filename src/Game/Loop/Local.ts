import { InputStorageManager } from '../../input/InputStorageManager';
import { PlayerVelocitySystem } from '../Velocity/PlayerVelocitySystem';
import { PlayerGravitySystem } from '../Gravity/PlayerGravitySystem';
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
import { LedgeDetectionSystem } from '../Collision/LedgeDetectionSystem';
import { ctx } from '../../Globals/globals';
import {
  idle,
  walk,
  ledgeGrab,
  turnWalk,
  run,
  jumpSquat,
  jump,
  neutralFall,
} from '../../Game/State/CharacterStates/Test';
import { DrawSystem } from '../Draw/DrawSystem';

const ECB = DefaultECB();
const P1 = new Player(
  ECB,
  1000,
  1000,
  0.8,
  0.8,
  new FlatVec(600, 100),
  20,
  2,
  true,
  10,
  100,
  18
);
P1.Grounded = false;
const ISM = new InputStorageManager<InputAction>(InvalidGuessSpec);
const FSM = new FrameStorageManager();
const SM = new StateMachine(P1, ISM, FSM);

let stageVecs = new Array<FlatVec>();

stageVecs.push(
  new FlatVec(510, 600),
  new FlatVec(1410, 600),
  new FlatVec(1410, 700),
  new FlatVec(510, 700)
);

const stage = new Stage(stageVecs);

const playersArr = new Array<Player>();
playersArr.push(P1);
const SCS = new StageCollisionSystem(playersArr, stage);
const PGS = new PlayerGravitySystem(playersArr, 0.5);
const DS = new DrawSystem(playersArr, stage, ctx);
const PVS = new PlayerVelocitySystem(playersArr);

const FPS = 60;
let now = {} as number;
let then = Date.now();
const interval = 1000 / FPS;
let delta = {} as number;
let frame = 0;

listenForGamePadInput();

SetUpStateMachine(SM);

const LDS = new LedgeDetectionSystem(playersArr, stage, SM);

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

  if (!P1.LedgeGrab) {
    if (input.Action == 'run') {
      if (P1.Grounded) {
        SM.SetState('walk');
      }
      if (!P1.Grounded) {
        SM.SetState('neutralFall');
      }
    } else if (input.Action == 'jump') {
      //debugger;
      P1.CurrentStateMachineState == 'jump'
        ? SM.SetState('jump')
        : P1.Grounded
        ? SM.SetState('jumpSquat')
        : SM.SetState('jump');
    } else {
      if (P1.Grounded) {
        SM.SetState('idle');
      } else {
        SM.SetState('neutralFall');
      }
    }
  } else {
    if (input.Action == 'jump') {
      SM.SetState('jump');
    }
  }

  SM.Update();
  PGS.ApplyGravity();
  PVS.UpdateVelocity();
  LDS.CheckForLedge();
  SCS.handle();
  UpdatePlayersPreviousPosition();
}

function draw() {
  DS.Draw();
}

function UpdateECBs() {
  const length = playersArr.length;

  for (let i = 0; i < length; i++) {
    const p = playersArr[i];
    p.ECB.MoveToPosition(p.PlayerPosition.X, p.PlayerPosition.Y);
    p.ECB.Update();
    p.LedgeDetector.MoveTo(p.PlayerPosition.X, p.PlayerPosition.Y);
  }
}

function UpdatePlayersPreviousPosition() {
  const length = playersArr.length;

  for (let i = 0; i < length; i++) {
    const p = playersArr[i];
    p.PreviousPlayerPosition.X = p.PlayerPosition.X;
    p.PreviousPlayerPosition.Y = p.PlayerPosition.Y;
  }
}

function SetUpStateMachine(sm: StateMachine) {
  sm.AddState('idle', idle);
  sm.AddState('walk', walk);
  sm.AddState('jump', jump);
  sm.AddState('neutralFall', neutralFall);
  sm.AddState(ledgeGrab.name, ledgeGrab);
  sm.AddState(jumpSquat.name, jumpSquat);
}
