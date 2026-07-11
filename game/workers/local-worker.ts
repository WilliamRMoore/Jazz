import { hydrateCharacterConfig } from '../character/configSerializer';
import { JazzDebugger } from '../engine/debug/jazzDebugWrapper';
import { NewInputAction } from '../engine/input/Input';
import { defaultStage, WallStage } from '../engine/stage/stageMain';
import { PlayerStateHistory } from '../engine/systems/history';
import { FlatVec } from '../engine/physics/vector';
import { STATE_IDS } from '../engine/finite-state-machine/stateConfigurations/shared';
import { SpawnAndAttackWithNSpecial } from '../engine/debug/scenarios/spawnPlayerAndAttack';
import {
  jMessage,
  LocalInputBufferReader,
  LocalInputBufferWriter
} from './workerUtils';
import { SetPlayerToStateId } from '../engine/debug/scenarios/setPlayerStateId';
import { LaunchPlayerDownward } from '../engine/debug/scenarios/launchPlayerDownward';

let inputReaders: LocalInputBufferReader[] = [];
let inputWriters: LocalInputBufferWriter[] = [];
let stateWriterBuffers: Int32Array[] = [];
let frameBuffer: Int32Array;
let poolCountBuffer: Int32Array;
const jazz = new JazzDebugger();

self.onmessage = (event: MessageEvent) => {
  const message = event.data as jMessage;
  if (message.type === 'INIT') {
    const initPayload = message.payload;
    const inputSabs = initPayload.inputBuffers;
    const writeBackSabs = initPayload.writeBackBuffers || [];
    const stateSabs = initPayload.stateBuffers;
    const frameSab = initPayload.frameBuffer;
    const poolCountSab = initPayload.poolCountBuffer;

    inputReaders = inputSabs.map(
      (sab) => new LocalInputBufferReader(new Int32Array(sab))
    );
    inputWriters = writeBackSabs.map(
      (sab) => new LocalInputBufferWriter(new Int32Array(sab))
    );
    stateWriterBuffers = stateSabs.map((sab) => new Int32Array(sab));

    if (frameSab) {
      frameBuffer = new Int32Array(frameSab);
    }
    if (poolCountSab) {
      poolCountBuffer = new Int32Array(poolCountSab);
    }

    // Initialize the engine with a default stage
    jazz.jazz.SetStage(defaultStage());
    jazz.jazz.SetStage(WallStage());

    // Start greedy loop
    lastTime = performance.now();
    loop();
  }
  if (message.type == 'SET_PLAYER') {
    const pl = message.payload;

    // Rehydrate FlatVec from the postMessage stripped object
    const posXRaw = (pl.pos.X as any)._rawValue;
    const posYRaw = (pl.pos.Y as any)._rawValue;
    jazz.AddPlayerEntity(
      hydrateCharacterConfig(pl.ccJson),
      FlatVec.FromRaw(posXRaw, posYRaw)
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
    jazz.jazz.SetStage(WallStage());
  }
  if (message.type == 'SPAWN_AND_ATTACK') {
    if (jazz.World.PlayerData.PlayerCount < 4) {
      SpawnAndAttackWithNSpecial(jazz);
    }
  }
  if (message.type == 'SET_PLAYER_STATE_ID') {
    SetPlayerToStateId(jazz, message.payload.playerId, message.payload.stateId);
  }
  if (message.type == 'LAUNCH_DOWN_WARD') {
    LaunchPlayerDownward(jazz, message.payload.playerId);
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

    if (inputReaders.length > 0) {
      const pCount = jazz.World.PlayerData.PlayerCount;
      // Only tick the engine if a player has been loaded
      if (pCount > 0) {
        for (let i = 0; i < pCount; i++) {
          if (i < inputReaders.length) {
            const inputToRead = NewInputAction();
            inputReaders[i].Load(inputToRead);
            jazz.UpdateInputForCurrentFrame(inputToRead, i);

            // "Echo" input back if writer exists for this player
            if (i < inputWriters.length) {
              inputWriters[i].Store(inputToRead);
            }
          } else {
            // Provide a default empty input for entities spawned without a reader
            jazz.UpdateInputForCurrentFrame(NewInputAction(), i);
          }
        }

        const tickStart = performance.now();
        jazz.Tick();

        const currentFrame =
          jazz.World.LocalFrame > 0 ? jazz.World.LocalFrame - 1 : 0;

        // Write state back per player buffer if they exist
        // Note: stateWriterBuffers was setup with length matching init
        // If stateWriterBuffers has one element that handles all, or one per player?
        // Wait, game/index.ts sent stateBuffers: [stateSab] where stateSab was size 4.
        // Let's assume one buffer for all players for now, or array of buffers.
        // The instruction says "We should be able to init the engine with multiple players."
        // We will write into stateWriterBuffers[0] with stride, matching the previous logic.
        if (stateWriterBuffers.length > 0 && stateWriterBuffers[0]) {
          const stateWriterBuffer = stateWriterBuffers[0];
          const stride =
            PlayerStateHistory.BufferSize() / Int32Array.BYTES_PER_ELEMENT;
          let offset = 0;

          for (let pIdx = 0; pIdx < pCount; pIdx++) {
            const histDB = jazz.World.HistoryData.PlayerHistoryDB[pIdx];
            const stateHist = histDB.get(currentFrame);
            if (stateHist) {
              stateHist.Serialize(stateWriterBuffer, offset, currentFrame);
            }
            offset += stride;
          }
        }

        const tickEnd = performance.now();

        if (frameBuffer) {
          Atomics.store(frameBuffer, 0, jazz.World.LocalFrame);
          Atomics.store(
            frameBuffer,
            1,
            Math.round((tickEnd - tickStart) * 1000)
          );
        }
        if (poolCountBuffer) {
          Atomics.store(poolCountBuffer, 0, jazz.World.GetRentedVecsForFrame(currentFrame));
          Atomics.store(poolCountBuffer, 1, jazz.World.GetRentedColResForFrame(currentFrame));
          Atomics.store(poolCountBuffer, 2, jazz.World.GetRentedProjResForFrame(currentFrame));
          Atomics.store(poolCountBuffer, 3, jazz.World.GetRentedAtkResForFrame(currentFrame));
          Atomics.store(poolCountBuffer, 4, jazz.World.GetRentedActiveHitBubblesForFrame(currentFrame));
          Atomics.store(poolCountBuffer, 5, jazz.World.GetRentedClosestPointsForFrame(currentFrame));
          Atomics.store(poolCountBuffer, 6, jazz.World.GetRentedECBDtosForFrame(currentFrame));
          Atomics.store(poolCountBuffer, 7, jazz.World.GetRentedAABBDtosForFrame(currentFrame));
        }
      }
    }
  }

  // Yield control to the event loop so postMessages can be received
  zeroDelayChannel.port2.postMessage(null);
}
