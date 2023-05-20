import { ctx, canvas } from './Globals/globals';
import ECB from './classes/ECB';
import PlayerPosition from './classes/PlayerPosition';
import Stage from './classes/Stage';
import { Position } from './interfaces/interfaces';

export function run() {
  canvas.width = 1920;
  canvas.height = 1080;
  animate();
}

let stagepoints = [
  { x: 200, y: 300 },
  { x: 400, y: 300 },
  { x: 400, y: 325 },
  { x: 200, y: 325 },
] as Position[];

const stage = new Stage(stagepoints);

const ecb = new ECB({
  top: { x: 100, y: 100 },
  left: { x: 50, y: 150 },
  bottom: { x: 100, y: 200 },
  right: { x: 150, y: 150 },
});

let t = 500;

const pp = new PlayerPosition(ecb, { x: t, y: 200 });

function animate() {
  window.requestAnimationFrame(animate);
  ctx.clearRect(0, 0, 1920, 1080);

  tick();
  t++;
  pp.draw();

  stage.draw();
}

function tick() {
  pp.update({ x: t, y: 200 });
}
