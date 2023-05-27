import { ctx, canvas } from './Globals/globals';
import Stage from './classes/Stage';
import { Position, PositionAllocator } from './classes/Position';
import { Create } from './classes/Player';

const pa = new PositionAllocator();

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

let pb = Create();
pb.atPosition({ x: 200, y: 200 }).withECBOffsets({
  top: { xOffset: 0, yOffset: -100 },
  left: { xOffset: -50, yOffset: -50 },
  bottom: { xOffset: 0, yOffset: 0 },
  right: { xOffset: 50, yOffset: -50 },
});

let P1 = pb.build();

let t = 0;

function animate() {
  window.requestAnimationFrame(animate);
  ctx.clearRect(0, 0, 1920, 1080);

  tick();
  t += 1;
  P1.draw();

  stage.draw();
}

const keys = {
  d: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
};

function tick() {
  //Get Input
  //Implement input...
  //Update Position
  //P1.updatePosition(pa.allocate(200, t));
  //Check for Collisions
  //Implements SAT...
  //Push calculation results in frame buffer
}
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'd':
      keys.d.pressed = true;
      break;
    case 'a':
      keys.a.pressed = true;
      break;
    case 'w':
      P1.playerVelocity.vy = -10;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'd':
      keys.d.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
    case 'w':
      //player.velocity.y = -15;
      break;
  }
});
