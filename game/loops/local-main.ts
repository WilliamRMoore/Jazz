import { IJazz } from '../engine/jazz';
import { DebugRenderer, resolution, renderTarget } from '../render/debug-2d';
import { RENDERFPS60Loop } from './FPS60LoopExecutor';
import { GetInput, NewInputAction } from '../input/Input';
import { World } from '../engine/world/world';
import { FlatVec } from '../engine/physics/vector';
import { STATE_IDS } from '../engine/finite-state-machine/stateConfigurations/shared';
import { FixedPoint } from '../engine/math/fixedPoint';
import { DefaultCharacterConfig } from '../character/default';
import { CharacterConfig } from '../character/shared';
import { JazzDebugger } from '../engine/debug/jazzDebugWrapper';
import { SpawnAndAttackWithNSpecial } from '../engine/debug/scenarios/spawnPlayerAndAttack';

const frameInterval = 1000 / 60;

export type GamePadIndexes = Array<number>;

export type playerControllerInfo = {
  inputIndex: number;
  playerIndex: number;
};

function ENGINE_DEBUG_LISTENERS(jdb: JazzDebugger) {
  window.addEventListener('keyup', (e) => {
    if (e.key === '1') {
      SpawnAndAttackWithNSpecial(jdb);
    }
  });
}

function SHOW_DEBUG_INFO(dbr: DebugRenderer) {
  window.addEventListener('keyup', (e) => {
    if (e.key === 'd') {
      dbr.PlayerDeBugInfo = !dbr.PlayerDeBugInfo;
    }
  });
}

export function start(playerInfo: Array<playerControllerInfo>) {
  const engine = new JazzDebugger();
  const ccs = new Array<CharacterConfig>();
  const playerCount = playerInfo.length;
  //p1 spawn point
  const positions = [
    { X: new FixedPoint(610), Y: new FixedPoint(100) },
  ] as Array<FlatVec>;

  if (playerCount == 2) {
    //p2 spawn point
    positions.push({ X: new FixedPoint(690), Y: new FixedPoint(100) });
  }

  ccs.push(new DefaultCharacterConfig());

  if (playerCount == 2) {
    ccs.push(new DefaultCharacterConfig());
  }

  engine.Init(ccs, positions);

  for (let i = 0; i < playerCount; i++) {
    const sm = engine.World.PlayerData.StateMachine(i)!;
    sm.SetInitialState(STATE_IDS.N_FALL_S);
  }

  ENGINE_DEBUG_LISTENERS(engine);
  LOGIC_LOOP(engine, playerInfo);
  RENDER_LOOP(engine);
}

function LOGIC_LOOP(engine: IJazz, gpInfo: Array<playerControllerInfo>) {
  const logicLoopHandle = setInterval(() => {
    logicStep(engine, gpInfo);
  }, frameInterval);
}

function RENDER_LOOP(jazzDebugger: JazzDebugger) {
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  const dbCanvas = document.getElementById('debugInfo') as HTMLCanvasElement;
  const mainWindow: renderTarget = {
    canvas: canvas,
    resX: 1920,
    resY: 1080,
  };
  const dbWindow: renderTarget = {
    canvas: dbCanvas,
    resX: 600,
    resY: 1200,
  };

  const dbRenderer = new DebugRenderer(mainWindow, dbWindow);
  SHOW_DEBUG_INFO(dbRenderer);
  RENDERFPS60Loop((timeStamp: number) => {
    dbRenderer.render(jazzDebugger, timeStamp);
  });
}

function logicStep(engine: IJazz, gamePadInfo: Array<playerControllerInfo>) {
  //const gamePadCount = gamePadInfo.length;
  const w = engine.World;
  const playerCount = w?.PlayerData.PlayerCount!;

  for (let i = 0; i < playerCount; i++) {
    const info = gamePadInfo[i];
    if (info === undefined) {
      const dbInput = NewInputAction();
      engine.UpdateInputForCurrentFrame(dbInput, i);
      continue;
    }
    const gpI = info.inputIndex;
    const pi = info.playerIndex;
    const input = GetInput(gpI, w!);
    engine.UpdateInputForCurrentFrame(input, pi);
  }
  engine.Tick();
}
