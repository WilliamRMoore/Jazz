const FPS = 60;
let frame = 0;
let now = {} as number;
let then = Date.now();
const interval = 1000 / FPS;
let delta = {} as number;

export default function LoopExec(gameLoop: () => void) {
  window.requestAnimationFrame(() => LoopExec(gameLoop));
  now = Date.now();
  delta = now - then;
  if (delta > interval) {
    gameLoop();
  }
}
