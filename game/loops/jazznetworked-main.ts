import { DebugRenderer, renderTarget } from '../render/debug-2d';
import { RENDERFPS60Loop } from './FPS60LoopExecutor';
import { GetInput, InputAction, NewInputAction } from '../engine/input/Input';
import { DefaultCharacterConfig } from '../character/default';
import { JazzDebugger } from '../engine/debug/jazzDebugWrapper';
import { World } from '../engine/world/world';
import { JazzNetwork } from '../engine/jazz/jazzNetwork';
import { ToFV } from '../engine/utils';

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

type messageType = loadMessage | startMessage;

type loadMessage = {
  type: 'LOAD';
};

type startMessage = {
  type: 'START';
  payload: SharedArrayBuffer;
};

self.onmessage = (event: MessageEvent<messageType>) => {
  switch (event.data.type) {
    case 'LOAD':
      // Handle loading resources if needed
      break;
    case 'START':
      const sab = event.data.payload;
      // Initialize the game loop with the SharedArrayBuffer for communication
      //startGameLoop(sab);
      break;
  }
};

function getLocalInput(sharedBuffer: SharedArrayBuffer): InputAction {
  const int32View = new Int32Array(sharedBuffer);
  const ia = NewInputAction();
  ia.Action = Atomics.load(int32View, 10);
  ia.LXAxis.SetFromNumber(Atomics.load(int32View, 11));
  ia.LYAxis.SetFromNumber(Atomics.load(int32View, 12));
  ia.RXAxis.SetFromNumber(Atomics.load(int32View, 13));
  ia.RYAxis.SetFromNumber(Atomics.load(int32View, 14));
  ia.LTVal.SetFromNumber(Atomics.load(int32View, 15));
  ia.RTVal.SetFromNumber(Atomics.load(int32View, 16));
  ia.Start = Atomics.load(int32View, 17) === 1;
  ia.Select = Atomics.load(int32View, 18) === 1;
  return ia;
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
