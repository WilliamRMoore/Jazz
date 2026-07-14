import { StateId } from '../engine/finiteStateMachines/player/shared';
import { InputAction, NetworkInput } from '../engine/input/Input';
import { FlatVec } from '../engine/physics/vector';

const PACKET_SIZE = 11;
const DATA_OFFSET = 2;
const QUEUE_LENGTH = 10;

export class NetworkInputBufferReader {
  private sendBuffer: Int32Array;

  constructor(sendBuffer: SharedArrayBuffer) {
    this.sendBuffer = new Int32Array(sendBuffer);
  }

  private get QUEUE_LENGTH() {
    return QUEUE_LENGTH;
  }

  private get PACKET_SIZE() {
    return PACKET_SIZE;
  }

  private get DATA_OFFSET() {
    return DATA_OFFSET;
  }

  private store = (index: number, value: number) =>
    Atomics.store(this.sendBuffer, index, value);

  private load = (index: number) => Atomics.load(this.sendBuffer, index);

  private notify = (index: number) => Atomics.notify(this.sendBuffer, index);

  public ReadNetworkInput(ni: NetworkInput): boolean {
    const load = this.load;
    const readPtr = load(1);
    const writePtr = load(0);

    if (readPtr === writePtr) {
      return false; // Buffer is empty, do not wait, just return.
    }

    const store = this.store;
    const notify = this.notify;
    const base = this.DATA_OFFSET + readPtr * this.PACKET_SIZE;

    ni.Frame = load(base + 0);
    ni.FrameAdvantage = load(base + 1);
    const ia = ni.Input;
    ia.Action = load(base + 2);
    ia.LXAxis.SetFromRaw(load(base + 3));
    ia.LYAxis.SetFromRaw(load(base + 4));
    ia.RXAxis.SetFromRaw(load(base + 5));
    ia.RYAxis.SetFromRaw(load(base + 6));
    ia.LTVal.SetFromRaw(load(base + 7));
    ia.RTVal.SetFromRaw(load(base + 8));
    ia.Start = load(base + 9) === 1;
    ia.Select = load(base + 10) === 1;

    const nextReadPtr = (readPtr + 1) % this.QUEUE_LENGTH;
    store(1, nextReadPtr);
    notify(1);

    return true;
  }
}

export class NetworkInputBufferWriter {
  private sendBuffer: Int32Array;

  constructor(sendBuffer: SharedArrayBuffer) {
    this.sendBuffer = new Int32Array(sendBuffer);
  }

  private get QUEUE_LENGTH() {
    return QUEUE_LENGTH;
  }

  private get PACKET_SIZE() {
    return PACKET_SIZE;
  }

  private get DATA_OFFSET() {
    return DATA_OFFSET;
  }

  private store = (index: number, value: number) =>
    Atomics.store(this.sendBuffer, index, value);

  private load = (index: number) => Atomics.load(this.sendBuffer, index);

  private notify = (index: number) => Atomics.notify(this.sendBuffer, index);

  public WriteNetWorkInput(
    input: InputAction,
    forFrame: number,
    FrameAdvantage: number
  ): void {
    const load = this.load;
    let writePtr = load(0);
    let readPtr = load(1);

    let nextWritePtr = (writePtr + 1) % this.QUEUE_LENGTH;

    while (nextWritePtr === readPtr) {
      Atomics.wait(this.sendBuffer, 1, readPtr);
      writePtr = load(0);
      readPtr = load(1);
      nextWritePtr = (writePtr + 1) % this.QUEUE_LENGTH;
    }

    const base = this.DATA_OFFSET + writePtr * this.PACKET_SIZE;
    const store = this.store;
    const notify = this.notify;

    store(base + 0, forFrame);
    store(base + 1, FrameAdvantage);
    store(base + 2, input.Action);
    store(base + 3, input.LXAxis.Raw);
    store(base + 4, input.LYAxis.Raw);
    store(base + 5, input.RXAxis.Raw);
    store(base + 6, input.RYAxis.Raw);
    store(base + 7, input.LTVal.Raw);
    store(base + 8, input.RTVal.Raw);
    store(base + 9, input.Start ? 1 : 0);
    store(base + 10, input.Select ? 1 : 0);
    store(0, nextWritePtr);
    notify(0);
  }

  static GetRequiredBufferSize(): number {
    const totalInts = PACKET_SIZE * QUEUE_LENGTH + DATA_OFFSET;
    return totalInts * Int32Array.BYTES_PER_ELEMENT;
  }
}

export class LocalInputBufferReader {
  private readonly buffer: Int32Array;

  constructor(buffer: Int32Array) {
    this.buffer = buffer;
  }

  public Load(ia: InputAction) {
    // Index 0 tells us which slot is the most recently completed write.
    const activeSlot = Atomics.load(this.buffer, 0);
    if (activeSlot === 0) return; // No inputs written yet

    const base = 1 + activeSlot * 9;
    ia.Action = Atomics.load(this.buffer, base + 0);
    ia.LXAxis.SetFromRaw(Atomics.load(this.buffer, base + 1));
    ia.LYAxis.SetFromRaw(Atomics.load(this.buffer, base + 2));
    ia.RXAxis.SetFromRaw(Atomics.load(this.buffer, base + 3));
    ia.RYAxis.SetFromRaw(Atomics.load(this.buffer, base + 4));
    ia.LTVal.SetFromRaw(Atomics.load(this.buffer, base + 5));
    ia.RTVal.SetFromRaw(Atomics.load(this.buffer, base + 6));
    ia.Start = Atomics.load(this.buffer, base + 7) === 1;
    ia.Select = Atomics.load(this.buffer, base + 8) === 1;
  }
}

export class LocalInputBufferWriter {
  private readonly buffer: Int32Array;
  private currentWriteSlot = 1;

  constructor(buffer: Int32Array) {
    this.buffer = buffer;
  }

  public Store(ia: InputAction) {
    // Cycle to the next slot (1, 2, or 3)
    const slot = this.currentWriteSlot;
    this.currentWriteSlot = (this.currentWriteSlot % 3) + 1;

    const base = 1 + slot * 9;
    Atomics.store(this.buffer, base + 0, ia.Action);
    Atomics.store(this.buffer, base + 1, ia.LXAxis.Raw);
    Atomics.store(this.buffer, base + 2, ia.LYAxis.Raw);
    Atomics.store(this.buffer, base + 3, ia.RXAxis.Raw);
    Atomics.store(this.buffer, base + 4, ia.RYAxis.Raw);
    Atomics.store(this.buffer, base + 5, ia.LTVal.Raw);
    Atomics.store(this.buffer, base + 6, ia.RTVal.Raw);
    Atomics.store(this.buffer, base + 7, ia.Start ? 1 : 0);
    Atomics.store(this.buffer, base + 8, ia.Select ? 1 : 0);

    // Publish the completed slot to index 0 so the reader can see it
    Atomics.store(this.buffer, 0, slot);
  }
}

type loadStageCommand = {
  type: 'LOAD_STAGE';
};

type setPlayerCommand = {
  type: 'SET_PLAYER';
  payload: {
    ccJson: string;
    pos: FlatVec;
  };
};

type setPlayerStateId = {
  type: 'SET_PLAYER_STATE_ID';
  payload: {
    playerId: number;
    stateId: StateId;
  };
};

type initCommand = {
  type: 'INIT';
  payload: {
    inputBuffers: SharedArrayBuffer[];
    stateBuffers: SharedArrayBuffer[];
    writeBackBuffers?: SharedArrayBuffer[];
    frameBuffer?: SharedArrayBuffer;
    poolCountBuffer?: SharedArrayBuffer;
  };
};

type testCommand = {
  type: 'TEST';
  payload: {
    inputBuffer: SharedArrayBuffer;
    writeBackBuffer: SharedArrayBuffer;
  };
};

type spawnAndAttackCommand = {
  type: 'SPAWN_AND_ATTACK';
};

type launchDownWard = {
  type: 'LAUNCH_DOWN_WARD';
  payload: {
    playerId: number;
  };
};

export type jMessage =
  | loadStageCommand
  | setPlayerCommand
  | setPlayerStateId
  | initCommand
  | testCommand
  | spawnAndAttackCommand
  | launchDownWard;

// INPUT Architechture
/***
 * Main thread and worker share a selected input ring buffer, 10 in length
 * Main thread reads the buffer every 4ms
 * Worker thread writes to the buffer every 16ms (60Hz)
 * Buffer works as queue, where the head is incremented when the worker adds the selected input
 * And decremented when the main thread reads the input, allowing for a max of 10 unprocessed inputs at a time
 * the worker thread will use an atomic wait if the queu filles up, and the main thread will use an atomic notify when it processes an input, allowing for efficient synchronization without busy waiting
 */
