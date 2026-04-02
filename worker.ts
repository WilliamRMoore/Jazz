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

    const interval = 1000 / 60; // Target 60Hz
    let lastTime = performance.now();
    let accumulator = 0;

    // This is a "greedy" game loop that will consume a full CPU core.
    // It's a common and performant pattern for game engines in a worker.
    while (true) {
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      accumulator += dt;

      // Run a fixed-step update for the game logic.
      // This ensures deterministic physics regardless of frame rate.
      while (accumulator >= interval) {
        // 1. Do 60Hz Game/Physics logic here
        // ...

        // 2. Example: Increment frame count at index 2 so main thread can monitor
        Atomics.add(sharedInt32, 2, 1);

        // 3. Read the InputAction data from the SharedArrayBuffer
        const action = Atomics.load(sharedInt32, 10);
        const lxAxisRaw = Atomics.load(sharedInt32, 11);
        const lyAxisRaw = Atomics.load(sharedInt32, 12);
        const rxAxisRaw = Atomics.load(sharedInt32, 13);
        const ryAxisRaw = Atomics.load(sharedInt32, 14);
        const ltValRaw = Atomics.load(sharedInt32, 15);
        const rtValRaw = Atomics.load(sharedInt32, 16);
        const start = Atomics.load(sharedInt32, 17) === 1;
        const select = Atomics.load(sharedInt32, 18) === 1;

        accumulator -= interval;
      }
    }
  }
};
