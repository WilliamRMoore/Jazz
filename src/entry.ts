import { ctx, canvas } from './Globals/globals';
import ECB from './classes/ECB';
import PlayerPosition from './classes/PlayerPosition';

export function run() {
  canvas.width = 1080;
  canvas.height = 1920;
  animate();
}

const ecb = new ECB({
  top: { x: 100, y: 100 },
  left: { x: 50, y: 150 },
  bottom: { x: 100, y: 200 },
  right: { x: 150, y: 150 },
});

const pp = new PlayerPosition(ecb, { x: 500, y: 200 });

function animate() {
  window.requestAnimationFrame(animate);
  ctx.clearRect(0, 0, 1920, 1080);

  tick();
  pp.draw();
}

function tick() {
  pp.update();
}
