import { DefaultCharacterConfig } from '../character/default';
import { CharacterConfig } from '../character/shared';
import { JazzDebugger } from '../engine/debug/jazzDebugWrapper';
import { SpawnAndAttackWithNSpecial } from '../engine/debug/scenarios/spawnPlayerAndAttack';
import { PlayerCPU } from '../engine/finiteStateMachines/cpu/playerCPU';
import { STATE_IDS } from '../engine/finiteStateMachines/player/states/shared';
import { GetInput } from '../engine/input/Input';
import { IJazzLocal } from '../engine/jazz/jazzLocal';
import { FixedPoint } from '../engine/math/fixedPoint';
import { FlatVec } from '../engine/physics/vector';
import { DebugRenderer, renderTarget } from '../render/debug-2d';
import { RENDER_MONITOR_FRAME_RATE } from './animation-loop';

const cpuPlayers = new Map<number, PlayerCPU>();

const frameInterval = 1000 / 60;
let accumulator = 0;
let lastTime = performance.now();

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

  window.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        jdb.StepBackOneFrame();
        break;
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
    { X: new FixedPoint(610), Y: new FixedPoint(100) }
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

function LOGIC_LOOP(engine: IJazzLocal, gpInfo: Array<playerControllerInfo>) {
  accumulator = 0;
  lastTime = performance.now();
  const logicLoopHandle = setInterval(() => {
    logicStep(engine, gpInfo);
  }, 16);
}

function RENDER_LOOP(jazzDebugger: JazzDebugger) {
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  const dbCanvas = document.getElementById('debugInfo') as HTMLCanvasElement;
  const mainWindow: renderTarget = {
    canvas: canvas,
    resX: 1920,
    resY: 1080
  };
  const dbWindow: renderTarget = {
    canvas: dbCanvas,
    resX: 600,
    resY: 1200
  };

  const dbRenderer = new DebugRenderer(mainWindow, dbWindow);
  SHOW_DEBUG_INFO(dbRenderer);
  RENDER_MONITOR_FRAME_RATE((timeStamp: number) => {
    dbRenderer.render(jazzDebugger.World, timeStamp);
  });
}

const loopRate = 1000 / 60; //60 hrz
function logicStep(
  engine: IJazzLocal,
  gamePadInfo: Array<playerControllerInfo>
) {
  const now = performance.now();
  const delta = now - lastTime;
  lastTime = now;
  accumulator += delta;
  while (accumulator >= loopRate) {
    accumulator -= loopRate;
    //const gamePadCount = gamePadInfo.length;
    const w = engine.World;
    if (!w) continue;
    const playerCount = w.PlayerData.PlayerCount!;

    for (let i = 0; i < playerCount; i++) {
      const info = gamePadInfo[i];
      if (info === undefined) {
        if (!cpuPlayers.has(i)) {
          cpuPlayers.set(i, new PlayerCPU(i, w));
        }
        const cpuInput = cpuPlayers.get(i)!.NextInput();
        engine.UpdateInputForCurrentFrame(cpuInput, i);
        continue;
      }
      const gpI = info.inputIndex;
      const pi = info.playerIndex;
      const input = GetInput(gpI);
      engine.UpdateInputForCurrentFrame(input, pi);
    }
    engine.Tick();
  }
}
