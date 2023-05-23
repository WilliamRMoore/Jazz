import { ctx, canvas } from './Globals/globals';
import Stage from './classes/Stage';
import { Position } from './interfaces/interfaces';
import { Create } from './classes/Player';

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
debugger;
let pb = Create();
pb.atPosition({ x: 200, y: 200 }).withECB({
  top: { x: 100, y: 100 },
  left: { x: 50, y: 150 },
  bottom: { x: 100, y: 200 },
  right: { x: 150, y: 150 },
});

let P1 = pb.build();

let t = 500;

function animate() {
  window.requestAnimationFrame(animate);
  ctx.clearRect(0, 0, 1920, 1080);

  tick();
  t += 2;
  P1.draw();

  stage.draw();
}

function tick() {
  //Get Input
  //Implement input...

  //Update Position
  P1.updatePosition({ x: t, y: 200 });

  //Check for Collisions
  //Implements SAT...

  //Push calculation results in frame buffer
}
