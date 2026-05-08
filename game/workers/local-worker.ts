import { hydrateCharacterConfig } from '../character/configSerializer';
import { JazzDebugger } from '../engine/debug/jazzDebugWrapper';
import { NewInputAction } from '../engine/input/Input';
import { defaultStage } from '../engine/stage/stageMain';
import {
  jMessage,
  LocalInputBufferReader,
  LocalInputBufferWriter,
} from './workerUtils';

let inputReader: LocalInputBufferReader;
let inputWriter: LocalInputBufferWriter;
const jazz = new JazzDebugger();

self.onmessage = (event: MessageEvent) => {
  if (event.data.type === 'INIT') {
    const inputSab = event.data.payload.inputBuffer as SharedArrayBuffer;
    const writeBackSab = event.data.payload
      .writeBackBuffer as SharedArrayBuffer;

    inputReader = new LocalInputBufferReader(new Int32Array(inputSab));
    inputWriter = new LocalInputBufferWriter(new Int32Array(writeBackSab));

    // Start greedy loop
    lastTime = performance.now();
    loop();
  }
  const message = event.data as jMessage;
  if (message.type == 'SET_PLAYER') {
    const pl = message.payload;
    jazz.AddPlayerEntity(hydrateCharacterConfig(pl.ccJson), pl.pos);
  }
  if (message.type == 'LOAD_STAGE') {
    jazz.jazz.SetStage(defaultStage());
  }
};

const loopRate = 1000 / 60;
let lastTime = 0;
let accumulator = 0;
const inputToRead = NewInputAction();

function loop() {
  const now = performance.now();
  let delta = now - lastTime;
  lastTime = now;

  // Prevent spiral of death if main thread blocks or tab is hidden
  if (delta > 250) {
    delta = 250;
  }

  accumulator += delta;

  while (accumulator >= loopRate) {
    accumulator -= loopRate;

    if (inputReader && inputWriter) {
      inputReader.Load(inputToRead);
      // "Echo" input back
      jazz.UpdateInputForCurrentFrame(inputToRead, 0);
      jazz.Tick();
      //Deserialize last three frames of player state into the shared state buffer for sharing with the main thread
      inputWriter.Store(inputToRead);
    }
  }

  // Yield control to the event loop so postMessages can be received
  setTimeout(loop, 0);
}
