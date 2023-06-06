import { FlatBody, ShapeType } from './FlatBody';
import * as g from '../Globals/globals';
import { randomNumber } from '../utils';
import { VectorAllocator, VectorMultiplier, VectorNegator } from './FlatVec';
import { keys } from '../input/SimpleInput';
import { IntersectCircle } from './Collisions';

let bodyList = [] as FlatBody[];

export function Run() {
  init();
}

function Test() {
  window.requestAnimationFrame(Test);
  g.ctx.clearRect(0, 0, 1920, 1080);

  if (keys.d.pressed) {
    bodyList[0].Move(VectorAllocator(2, 0));
  }
  if (keys.a.pressed) {
    bodyList[0].Move(VectorAllocator(-2, 0));
  }
  if (keys.w.pressed) {
    bodyList[0].Move(VectorAllocator(0, -2));
  }
  if (keys.s.pressed) {
    bodyList[0].Move(VectorAllocator(0, 2));
  }

  for (let index = 0; index < bodyList.length - 1; index++) {
    const body1 = bodyList[index];
    for (let index2 = index + 1; index2 < bodyList.length; index2++) {
      const body2 = bodyList[index2];
      const result = IntersectCircle(
        body1.GetPos(),
        body1.Radius,
        body2.GetPos(),
        body2.Radius
      );

      if (result.collision) {
        body1.Move(
          VectorMultiplier(VectorNegator(result.normal), result.depth / 2)
        );
        body2.Move(VectorMultiplier(result.normal, result.depth / 2));
      }
    }
  }

  bodyList.forEach((x) => {
    if (x.ShapeType == ShapeType.Circle) {
      let p = x.GetPos();
      g.ctx.beginPath();
      g.ctx.arc(p.X, p.Y, x.Radius, 0, 2 * Math.PI, false);
      g.ctx.fillStyle = 'green';
      g.ctx.fill();
      g.ctx.lineWidth = 3;
      g.ctx.strokeStyle = 'white';
      g.ctx.stroke();
    }
    if (x.ShapeType == ShapeType.Box) {
      let p = x.GetPos();
      g.ctx.fillStyle = 'red';
      g.ctx.fillRect(p.X, p.Y, x.Width, x.Height);
    }
  });
}

function init() {
  debugger;
  let bodyCount = 10;

  for (let i = 0; i < bodyCount; i++) {
    let type = ShapeType.Circle;

    let body: FlatBody | null = null;

    let x = randomNumber(20, 1000);
    let y = randomNumber(20, 1000);

    if (type == ShapeType.Circle) {
      body = FlatBody.CreateCircleBody(20, VectorAllocator(x, y));
    } else {
      body = FlatBody.CreateBoxBody(VectorAllocator(x, y), 40, 40);
    }

    bodyList.push(body);
  }

  console.log(bodyList);
  Test();
}
