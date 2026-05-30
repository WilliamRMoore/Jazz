export function RENDER_MONITOR_FRAME_RATE(renderFunc: (now: number) => void) {
  function loop(now: number) {
    renderFunc(now);
    // Call the loop again with the latest time
    requestAnimationFrame(loop);
  }
  // Start the loop
  requestAnimationFrame(loop);
}
