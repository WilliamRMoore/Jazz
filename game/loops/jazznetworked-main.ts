import { JazzNetwork } from '../engine/jazz';
import { DebugRenderer, renderTarget } from '../render/debug-2d';
import { RENDERFPS60Loop } from './FPS60LoopExecutor';
import { GetInput, InputAction, NewInputAction } from '../engine/input/Input';
import { FlatVec } from '../engine/physics/vector';
import { STATE_IDS } from '../engine/finite-state-machine/stateConfigurations/shared';
import { FixedPoint } from '../engine/math/fixedPoint';
import { DefaultCharacterConfig } from '../character/default';
import { CharacterConfig } from '../character/shared';
import { JazzDebugger } from '../engine/debug/jazzDebugWrapper';
import { World } from '../engine/world/world';

export type GamePadIndexes = Array<number>;

export type playerControllerInfo = {
  inputIndex: number;
  playerIndex: number;
};

function ENGINE_DEBUG_LISTENERS(jdb: JazzDebugger) {
  window.addEventListener('keyup', (e) => {
    if (e.key === '1') {
      //SpawnAndAttackWithNSpecial(jdb)
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

export function start(playerInfo: playerControllerInfo) {
  const engine = new JazzNetwork();

  // initialize the network
  const localInputIndex = playerInfo.inputIndex;

  engine.SetLocalPlayer(
    new DefaultCharacterConfig(),
    ToFV(600, 650),
    0,
    () => GetInput(localInputIndex),
    (ia: InputAction) => {},
  );

  //ENGINE_DEBUG_LISTENERS(engine);
  LOGIC_LOOP(engine);
  RENDER_LOOP(engine.World);
}

function LOGIC_LOOP(engine: JazzNetwork) {
  const loop = () => {
    // Run the core game logic for one frame.
    logicStep(engine);

    // Get the desired loop speed for the *next* frame from the RollBackManager.
    // This allows the game to speed up or slow down to maintain sync.
    const targetLoopSpeed = 60; //engine.GetTargetLoopSpeed();
    const targetFrameInterval = 1000 / targetLoopSpeed;

    // Schedule the next execution of the loop with the dynamically adjusted interval.
    setTimeout(loop, targetFrameInterval);
  };

  // Start the first iteration of the loop.
  loop();
}

function RENDER_LOOP(world: World) {
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
    dbRenderer.render(world, timeStamp);
  });
}

function logicStep(engine: JazzNetwork) {
  const w = engine.World;
  const playerCount = w?.PlayerData.PlayerCount!;

  engine.Tick();
}
function ToFV(arg0: number, arg1: number): FlatVec {
  throw new Error('Function not implemented.');
}
