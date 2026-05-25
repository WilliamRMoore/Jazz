import { hydrateCharacterConfig } from '../character/configSerializer';
import { JazzDebugger } from '../engine/debug/jazzDebugWrapper';
import { NewInputAction } from '../engine/input/Input';
import { defaultStage } from '../engine/stage/stageMain';
import { PlayerStateHistory } from '../engine/systems/history';
import { FlatVec } from '../engine/physics/vector';
import { STATE_IDS } from '../engine/finite-state-machine/stateConfigurations/shared';
import {
  jMessage,
  LocalInputBufferReader,
  LocalInputBufferWriter,
} from './workerUtils';

let inputReader: LocalInputBufferReader;
let inputWriter: LocalInputBufferWriter;
let stateWriterBuffer: Int32Array;
let frameBuffer: Int32Array;
const jazz = new JazzDebugger();

self.onmessage = (event: MessageEvent) => {
  if (event.data.type === 'INIT') {
    const inputSab = event.data.payload.inputBuffer as SharedArrayBuffer;
    const writeBackSab = event.data.payload
      .writeBackBuffer as SharedArrayBuffer;
    const stateSab = event.data.payload.stateBuffer as SharedArrayBuffer;
    const frameSab = event.data.payload.frameBuffer as SharedArrayBuffer;

    inputReader = new LocalInputBufferReader(new Int32Array(inputSab));
    inputWriter = new LocalInputBufferWriter(new Int32Array(writeBackSab));
    stateWriterBuffer = new Int32Array(stateSab);
    frameBuffer = new Int32Array(frameSab);

    // Initialize the engine with a default stage
    jazz.jazz.SetStage(defaultStage());

    // Start greedy loop
    lastTime = performance.now();
    loop();
  }
  const message = event.data as jMessage;
  if (message.type == 'SET_PLAYER') {
    const pl = message.payload;

    // Rehydrate FlatVec from the postMessage stripped object
    const posXRaw = (pl.pos.X as any)._rawValue;
    const posYRaw = (pl.pos.Y as any)._rawValue;
    jazz.AddPlayerEntity(
      hydrateCharacterConfig(pl.ccJson),
      FlatVec.FromRaw(posXRaw, posYRaw),
    );

    // Initialize the state machine to start falling so gravity applies immediately
    const pCount = jazz.World.PlayerData.PlayerCount;
    const sm = jazz.World.PlayerData.StateMachine(pCount - 1);
    if (sm) {
      sm.SetInitialState(STATE_IDS.N_FALL_S);
    }
  }
  if (message.type == 'LOAD_STAGE') {
    jazz.jazz.SetStage(defaultStage());
  }
};

const loopRate = 1000 / 60;
let lastTime = 0;
let accumulator = 0;

const zeroDelayChannel = new MessageChannel();
zeroDelayChannel.port1.onmessage = loop;

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
      const inputToRead = NewInputAction();
      inputReader.Load(inputToRead);

      // Only tick the engine if a player has been loaded
      if (jazz.World.PlayerData.PlayerCount > 0) {
        jazz.UpdateInputForCurrentFrame(inputToRead, 0);
        jazz.Tick();
      }

      // "Echo" input back
      inputWriter.Store(inputToRead);

      if (frameBuffer && jazz.World.PlayerData.PlayerCount > 0) {
        Atomics.store(frameBuffer, 0, jazz.World.LocalFrame);
      }

      if (stateWriterBuffer && jazz.World.PlayerData.PlayerCount > 0) {
        const stride =
          PlayerStateHistory.BufferSize() / Int32Array.BYTES_PER_ELEMENT;
        const pCount = jazz.World.PlayerData.PlayerCount;
        let offset = 0;

        // The tick increments the frame, so the last executed frame is localFrame - 1
        const currentFrame =
          jazz.World.LocalFrame > 0 ? jazz.World.LocalFrame - 1 : 0;

        for (let pIdx = 0; pIdx < pCount; pIdx++) {
          const histDB = jazz.World.HistoryData.PlayerHistoryDB[pIdx];
          const stateHist = histDB.get(currentFrame);
          if (stateHist) {
            stateHist.Serialize(stateWriterBuffer, offset, currentFrame);
          }
          offset += stride;
        }
      }
    }
  }

  // Yield control to the event loop so postMessages can be received
  zeroDelayChannel.port2.postMessage(null);
}
