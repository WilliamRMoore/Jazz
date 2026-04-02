import { GetInput } from './game/engine/input/Input';

const logDiv = document.getElementById('log') as HTMLDivElement;
const startBtn = document.getElementById('startBtn') as HTMLButtonElement;

function log(msg: string) {
  logDiv.textContent += msg + '\n';
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  logDiv.textContent = ''; // Clear log
  log('Initializing Worker...');

  try {
    // Assumes worker.ts has been compiled to worker.js
    const worker = new Worker('worker.js');

    // Create 1KB SharedArrayBuffer (256 x 32-bit integers)
    const sab = new SharedArrayBuffer(1024);
    const int32View = new Int32Array(sab);

    // Setup message handling for the round-trip
    let resolver: (() => void) | null = null;
    worker.onmessage = (e: MessageEvent) => {
      const { type } = e.data;
      if (type === 'READY') {
        if (resolver) resolver();
      }
    };

    // Send buffer to worker
    worker.postMessage({ type: 'INIT', payload: sab });

    // Wait for worker READY
    await new Promise<void>((r) => (resolver = r));
    const startTime = performance.now();
    log(`Worker Ready. Tracking 60Hz game loop...`);

    // Asynchronously check the worker's status on each frame
    function monitorWorker() {
      // 1. Get the latest input from the gamepad (Index 0)
      const input = GetInput(0);

      // 2. Write the input data to the SharedArrayBuffer starting at index 10
      Atomics.store(int32View, 10, input.Action);
      Atomics.store(int32View, 11, input.LXAxisRaw);
      Atomics.store(int32View, 12, input.LYAxisRaw);
      Atomics.store(int32View, 13, input.RXAxisRaw);
      Atomics.store(int32View, 14, input.RYAxisRaw);
      Atomics.store(int32View, 15, input.LTValRaw);
      Atomics.store(int32View, 16, input.RTValRaw);
      Atomics.store(int32View, 17, input.Start ? 1 : 0);
      Atomics.store(int32View, 18, input.Select ? 1 : 0);

      const frames = Atomics.load(int32View, 2);
      const elapsed = performance.now() - startTime;

      logDiv.textContent =
        `Worker is running on its own thread...\n\n` +
        `Elapsed Time: ${elapsed.toFixed(0)} ms\n` +
        `Worker Frames Executed: ${frames}\n` +
        `Calculated FPS: ${(frames / (elapsed / 1000)).toFixed(2)}\n\n` +
        `Latest Input Action Sent: ${input.Action}`;

      requestAnimationFrame(monitorWorker);
    }

    monitorWorker();
  } catch (err: any) {
    log('Error: ' + err.message);
    console.error(err);
  } finally {
    // We leave the button disabled because the loop is now running indefinitely
  }
});
