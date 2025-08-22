export function RENDERFPS60Loop(renderFunc: (now: number) => void) {
  function loop(now: number) {
    renderFunc(now);

    // Call the loop again with the latest time
    requestAnimationFrame(loop);
  }

  // Start the loop
  requestAnimationFrame(loop);
}

class AnimationFrame60FPSExecutor {
  fps: number = 60;
  now = {} as number;
  then = Date.now();
  interval = 1000 / this.fps;
  delta = {} as number;
}
