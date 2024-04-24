import { ctx, canvas } from './Globals/globals';
import { FlatVec, VectorAllocator, VectorAdder } from './Physics/FlatVec';
import { initLoop } from './Game/Loop/RemoteV2';

export function run() {
  canvas.width = 1920;
  canvas.height = 1080;

  initLoop();
}

function testaroo() {
  let poly1 = new Array<FlatVec>();
  let poly2 = new Array<FlatVec>();

  poly1[0] = VectorAllocator(0, 0);
  poly1[1] = VectorAllocator(50, 0);
  poly1[2] = VectorAllocator(50, 50);
  poly1[3] = VectorAllocator(0, 50);

  poly2[0] = VectorAllocator(0, 0);
  poly2[1] = VectorAllocator(50, 0);
  poly2[2] = VectorAllocator(50, 50);
  poly2[3] = VectorAllocator(0, 50);

  let poly3 = new Array<FlatVec>();
  poly3[0] = VectorAllocator(0, 0);
  poly3[1] = VectorAllocator(50, 0);
  poly3[2] = VectorAllocator(50, 50);
  poly3[3] = VectorAllocator(0, 50);

  let start = Move(poly1, VectorAllocator(100, 100));
  let finish = Move(poly2, VectorAllocator(300, 100));
  let p3 = Move(poly3, VectorAllocator(175, 51));

  let poly4 = start.concat(finish);

  function Move(poly: Array<FlatVec>, pos: FlatVec) {
    poly[0] = pos;

    for (let i = 1; i < poly.length; i++) {
      poly[i] = VectorAdder(poly[i], pos);
    }
    return poly;
  }

  ctx.strokeStyle = 'blue';

  ctx.beginPath();
  ctx.moveTo(poly4[0].X, poly4[0].Y);

  for (let i = 1; i < poly4.length; i++) {
    ctx.lineTo(poly4[i].X, poly4[i].Y);
  }
  ctx.closePath();
  ctx.fillStyle = 'red';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(p3[0].X, p3[0].Y);

  for (let i = 1; i < p3.length; i++) {
    ctx.lineTo(p3[i].X, p3[i].Y);
  }
  ctx.closePath();
  ctx.fillStyle = 'orange';
  ctx.fill();
}
