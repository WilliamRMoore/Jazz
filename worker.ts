// Interface for the expected message structure
interface WorkerMessage {
  type: 'INIT';
  payload?: SharedArrayBuffer;
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  if (type === 'INIT' && payload) {
    // Receive the SharedArrayBuffer
    const sharedInt32 = new Int32Array(payload);
    self.postMessage({ type: 'READY' });

    // Enter zero-copy loop
    while (true) {
      // Wait for signal from main thread (value 1)
      // Atomics.wait sleeps while value is 0 (IDLE)
      Atomics.wait(sharedInt32, 0, 0);

      // Process: Copy index 1
      const val = Atomics.load(sharedInt32, 1);
      Atomics.store(sharedInt32, 1, val);

      // Signal done (Reset index 0 to 0)
      Atomics.store(sharedInt32, 0, 0);
    }
  }
};
