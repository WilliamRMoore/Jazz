import { NewInputAction, NewNetworkInput } from '../../game/engine/input/Input';
import {
  LocalInputBufferReader, // Original
  LocalInputBufferWriter, // Original
  NetworkInputBufferReader, // New
  NetworkInputBufferWriter, // New
} from '../../game/workers/workerUtils';

describe('LocalInputBuffer', () => {
  describe('LocalInputBufferWriter', () => {
    it('should correctly write an InputAction to the Int32Array buffer', () => {
      const buffer = new Int32Array(10);
      const writer = new LocalInputBufferWriter(buffer);
      const input = NewInputAction();

      input.Action = 5 as any; // Arbitrary GameEventId
      input.LXAxis.SetFromRaw(100);
      input.LYAxis.SetFromRaw(200);
      input.RXAxis.SetFromRaw(300);
      input.RYAxis.SetFromRaw(400);
      input.LTVal.SetFromRaw(500);
      input.RTVal.SetFromRaw(600);
      input.Start = true;
      input.Select = false;

      writer.Store(input);

      // Verify Atomics.store was called correctly based on workerUtils.ts implementation
      expect(Atomics.load(buffer, 0)).toBe(5);
      expect(Atomics.load(buffer, 1)).toBe(100);
      expect(Atomics.load(buffer, 2)).toBe(200);
      expect(Atomics.load(buffer, 3)).toBe(300);
      expect(Atomics.load(buffer, 4)).toBe(400);
      expect(Atomics.load(buffer, 5)).toBe(500);
      expect(Atomics.load(buffer, 6)).toBe(600);
      expect(Atomics.load(buffer, 7)).toBe(1);
      expect(Atomics.load(buffer, 8)).toBe(0);

      // Verify Atomics.add was called on index 9 for the counter
      expect(Atomics.load(buffer, 9)).toBe(1);
    });
  });

  describe('LocalInputBufferReader', () => {
    it('should correctly read an InputAction from the Int32Array buffer', () => {
      const buffer = new Int32Array(10);
      const reader = new LocalInputBufferReader(buffer);
      const input = NewInputAction();

      // Populate buffer based on current reader implementation in workerUtils.ts
      // After fix, Action is at index 0, LXAxis at 1, etc.
      Atomics.store(buffer, 0, 10 as any); // Action
      Atomics.store(buffer, 1, 100); // LXAxis
      Atomics.store(buffer, 2, 200); // LYAxis
      Atomics.store(buffer, 3, 300); // RXAxis
      Atomics.store(buffer, 4, 400); // RYAxis
      Atomics.store(buffer, 5, 500); // LTVal
      Atomics.store(buffer, 6, 600); // RTVal
      Atomics.store(buffer, 7, 1); // Start
      Atomics.store(buffer, 8, 1); // Select

      reader.Load(input);

      expect(input.Action).toBe(10);
      expect(input.LXAxis.Raw).toBe(100);
      expect(input.LYAxis.Raw).toBe(200);
      expect(input.RXAxis.Raw).toBe(300);
      expect(input.RYAxis.Raw).toBe(400);
      expect(input.LTVal.Raw).toBe(500);
      expect(input.RTVal.Raw).toBe(600);
      expect(input.Start).toBe(true);
      expect(input.Select).toBe(true);
    });
  });
});

// Constants from workerUtils.ts
const PACKET_SIZE = 11;
const DATA_OFFSET = 2;
const QUEUE_LENGTH = 10;

describe('NetworkInputBuffer', () => {
  let sharedBuffer: SharedArrayBuffer;
  let int32Array: Int32Array;
  let writer: NetworkInputBufferWriter;
  let reader: NetworkInputBufferReader;

  beforeEach(() => {
    // Initialize a SharedArrayBuffer for each test
    sharedBuffer = new SharedArrayBuffer(
      (PACKET_SIZE * QUEUE_LENGTH + DATA_OFFSET) * Int32Array.BYTES_PER_ELEMENT,
    );
    int32Array = new Int32Array(sharedBuffer);
    // Initialize pointers to 0
    Atomics.store(int32Array, 0, 0); // writePtr
    Atomics.store(int32Array, 1, 0); // readPtr
    writer = new NetworkInputBufferWriter(sharedBuffer);
    reader = new NetworkInputBufferReader(sharedBuffer);

    // Mock Atomics.wait to return immediately for testing purposes
    // In a real scenario, this would block. For unit tests, we want to check if it's called.
    jest.spyOn(Atomics, 'wait').mockReturnValue('ok');
    jest.spyOn(Atomics, 'notify').mockReturnValue(0); // Mock notify to return 0 (no waiters)
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('NetworkInputBufferWriter', () => {
    it('should correctly write a NetworkInput to the buffer and update writePtr', () => {
      const input = NewInputAction();
      input.Action = 10;
      input.LXAxis.SetFromRaw(100);
      input.Start = true;
      const frame = 5;
      const frameAdvantage = 1;

      writer.WriteNetWorkInput(input, frame, frameAdvantage);

      // Verify writePtr is updated
      expect(Atomics.load(int32Array, 0)).toBe(1); // writePtr should be 1
      expect(Atomics.load(int32Array, 1)).toBe(0); // readPtr should still be 0

      // Verify data is written at the correct base offset (DATA_OFFSET + 0 * PACKET_SIZE)
      const base = DATA_OFFSET;
      expect(Atomics.load(int32Array, base + 0)).toBe(frame);
      expect(Atomics.load(int32Array, base + 1)).toBe(frameAdvantage);
      expect(Atomics.load(int32Array, base + 2)).toBe(input.Action);
      expect(Atomics.load(int32Array, base + 3)).toBe(input.LXAxis.Raw);
      expect(Atomics.load(int32Array, base + 9)).toBe(1); // Start
      expect(Atomics.load(int32Array, base + 10)).toBe(0); // Select

      expect(Atomics.notify).toHaveBeenCalledWith(int32Array, 0); // Notify on writePtr
    });

    it('should wrap writePtr around QUEUE_LENGTH', () => {
      // Fill the buffer with 9 items.
      for (let i = 0; i < QUEUE_LENGTH - 1; i++) {
        writer.WriteNetWorkInput(NewInputAction(), i, 0);
      }
      expect(Atomics.load(int32Array, 0)).toBe(QUEUE_LENGTH - 1); // writePtr should be 9

      // Now read one item to make space.
      reader.ReadNetworkInput(NewNetworkInput());
      expect(Atomics.load(int32Array, 1)).toBe(1); // readPtr is 1

      // Write one more item. It should write at index 9.
      writer.WriteNetWorkInput(NewInputAction(), 9, 0);
      // writePtr should wrap to 0.
      expect(Atomics.load(int32Array, 0)).toBe(0); // writePtr should wrap to 0
    });

    it('should call Atomics.wait when the buffer is full', () => {
      // Fill the buffer with 9 items, making it full.
      for (let i = 0; i < QUEUE_LENGTH - 1; i++) {
        writer.WriteNetWorkInput(NewInputAction(), i, 0);
      }

      // To prevent an infinite loop in the test, we'll make the wait mock throw an error.
      const waitSpy = jest.spyOn(Atomics, 'wait').mockImplementation(() => {
        throw new Error('INTENTIONAL_WAIT_BREAK');
      });

      // Attempt to write one more item - this should trigger Atomics.wait and throw
      expect(() => writer.WriteNetWorkInput(NewInputAction(), 99, 99)).toThrow(
        'INTENTIONAL_WAIT_BREAK',
      );

      // Verify Atomics.wait was called with the correct arguments
      expect(Atomics.wait).toHaveBeenCalledWith(
        int32Array,
        1, // Index of readPtr
        0, // Value of readPtr at the time of waiting
      );
    });
  });

  describe('NetworkInputBufferReader', () => {
    it('should correctly read a NetworkInput from the buffer and update readPtr', () => {
      const input = NewInputAction();
      input.Action = 20;
      input.RYAxis.SetFromRaw(500);
      input.Select = true;
      const frame = 10;
      const frameAdvantage = 2;

      // Manually write data to the buffer to simulate a writer
      const base = DATA_OFFSET;
      Atomics.store(int32Array, base + 0, frame);
      Atomics.store(int32Array, base + 1, frameAdvantage);
      Atomics.store(int32Array, base + 2, input.Action);
      Atomics.store(int32Array, base + 6, input.RYAxis.Raw);
      Atomics.store(int32Array, base + 9, 0); // Start
      Atomics.store(int32Array, base + 10, 1); // Select
      Atomics.store(int32Array, 0, 1); // Update writePtr to indicate one item is available

      const ni = NewNetworkInput();
      const result = reader.ReadNetworkInput(ni);

      expect(result).toBe(true);
      expect(ni.Frame).toBe(frame);
      expect(ni.FrameAdvantage).toBe(frameAdvantage);
      expect(ni.Input.Action).toBe(input.Action);
      expect(ni.Input.RYAxis.Raw).toBe(input.RYAxis.Raw);
      expect(ni.Input.Start).toBe(false);
      expect(ni.Input.Select).toBe(true);

      // Verify readPtr is updated
      expect(Atomics.load(int32Array, 0)).toBe(1); // writePtr should still be 1
      expect(Atomics.load(int32Array, 1)).toBe(1); // readPtr should be 1

      expect(Atomics.notify).toHaveBeenCalledWith(int32Array, 1); // Notify on readPtr
    });

    it('should wrap readPtr around QUEUE_LENGTH', () => {
      // Write QUEUE_LENGTH - 1 items to fill the buffer.
      for (let i = 0; i < QUEUE_LENGTH - 1; i++) {
        writer.WriteNetWorkInput(NewInputAction(), i, 0);
      }
      // writePtr is now 9, readPtr is 0.

      // Read all available items to move the readPtr to the end.
      for (let i = 0; i < QUEUE_LENGTH - 1; i++) {
        reader.ReadNetworkInput(NewNetworkInput());
      }
      // readPtr should now be at the end of the buffer.
      expect(Atomics.load(int32Array, 1)).toBe(QUEUE_LENGTH - 1);

      // Buffer is now empty (readPtr === writePtr).
      // Write one more item, which should be at index 9.
      writer.WriteNetWorkInput(NewInputAction(), 10, 0);
      // writePtr should wrap to 0.
      expect(Atomics.load(int32Array, 0)).toBe(0);

      // Read one more item, readPtr should wrap to 0
      reader.ReadNetworkInput(NewNetworkInput());
      expect(Atomics.load(int32Array, 1)).toBe(0); // readPtr should wrap to 0
    });

    it('should return false without waiting when the buffer is empty', () => {
      // Buffer is empty by default (writePtr = 0, readPtr = 0)
      const waitSpy = jest.spyOn(Atomics, 'wait');

      const ni = NewNetworkInput();
      const result = reader.ReadNetworkInput(ni);

      // Should return false as buffer is empty
      expect(result).toBe(false);
      // Crucially, it should not wait
      expect(waitSpy).not.toHaveBeenCalled();
    });
  });

  describe('Lockstep synchronization', () => {
    it('writer should wait when buffer is full, and resume after reader consumes an item', () => {
      // Fill buffer with 9 items.
      for (let i = 0; i < QUEUE_LENGTH - 1; i++) {
        writer.WriteNetWorkInput(NewInputAction(), i, 0);
      }

      const waitSpy = jest.spyOn(Atomics, 'wait').mockImplementationOnce(() => {
        // Simulate reader consuming an item, which unblocks the writer.
        reader.ReadNetworkInput(NewNetworkInput());
        return 'ok';
      });

      // This call will wait, the mock will run, and then the write will complete.
      writer.WriteNetWorkInput(NewInputAction(), 999, 999);

      expect(waitSpy).toHaveBeenCalledTimes(1);

      // After the call, readPtr should be 1 (from inside the mock)
      expect(Atomics.load(int32Array, 1)).toBe(1);
      // And writePtr should now be 0 (was 9, wrote at 9, became 0).
      expect(Atomics.load(int32Array, 0)).toBe(0);

      // Check that the data was written at index 9.
      const base = DATA_OFFSET + 9 * PACKET_SIZE;
      expect(Atomics.load(int32Array, base + 0)).toBe(999);
    });

    it('reader should return false when empty, then true after a write', () => {
      // Buffer is empty by default (writePtr = 0, readPtr = 0)
      const ni = NewNetworkInput();
      const initialReadResult = reader.ReadNetworkInput(ni);
      expect(initialReadResult).toBe(false); // First read fails because buffer is empty

      // Now, simulate the writer producing an item
      const input = NewInputAction();
      input.Action = 50;
      writer.WriteNetWorkInput(input, 100, 5);

      // Verify writer updated the pointer
      expect(Atomics.load(int32Array, 0)).toBe(1);

      // Now, with data available, a new read should succeed
      const niAfterWrite = NewNetworkInput();
      const secondReadResult = reader.ReadNetworkInput(niAfterWrite);

      expect(secondReadResult).toBe(true);
      expect(niAfterWrite.Frame).toBe(100);
      expect(niAfterWrite.FrameAdvantage).toBe(5);
      expect(niAfterWrite.Input.Action).toBe(50);
      expect(Atomics.load(int32Array, 1)).toBe(1); // readPtr is now also 1
    });
  });
});
