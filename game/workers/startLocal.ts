import { JazzDebugger } from '../engine/debug/jazzDebugWrapper';
import { NewInputAction } from '../engine/input/Input';
import { defaultStage } from '../engine/stage/stageMain';
import {
  jMessage,
  LocalInputBufferReader,
  LocalInputBufferWriter,
} from './workerUtils';

const jazz = new JazzDebugger();
self.onmessage = (event: MessageEvent<jMessage>) => {
  const message = event.data;
  switch (message.type) {
    case 'LOAD_STAGE':
      jazz.jazz.SetStage(defaultStage());
      break;
    case 'SET_PLAYER':
      jazz.jazz.SetPlayer(message.payload.cc, message.payload.pos);
      break;
    case 'INIT':
      const inputBuffers = message.payload.inputBuffers.map(
        (b) => new Int32Array(b),
      );
      const stateBuffer = message.payload.stateBuffers.map(
        (b) => new Int32Array(b),
      );
      gameRun(inputBuffers, stateBuffer);
      // start the game loop here, using sharedInt32 for communication
      break;
  }
};

function gameRun(inputBuffers: Int32Array[], stateBuffers: Int32Array[]) {
  const interval = 1000 / 60;
  let lastTime = performance.now();
  let accumulator = 0;

  const inputBufferReaders = inputBuffers.map(
    (b) => new LocalInputBufferReader(b),
  );

  // Use a named function so we can call it recursively
  function tick() {
    const now = performance.now();
    const dt = now - lastTime;
    lastTime = now;
    accumulator += dt;

    while (accumulator >= interval) {
      for (let i = 0; i < inputBufferReaders.length; i++) {
        const ia = NewInputAction();
        inputBufferReaders[i].Load(ia);
        jazz.UpdateInputForCurrentFrame(ia, i);
      }
      jazz.Tick();
      accumulator -= interval;
    }

    // This "yields" control back to the browser for a split second.
    // This allows onmessage to fire if a new message arrived.
    // 1ms is enough to keep the CPU happy without losing 60Hz precision.
    setTimeout(tick, 1);
  }

  tick(); // Start the loop
}
