import { ShapeType } from './FlatBody';
import { Circle } from './Circle';
import { Box } from './Box';
import * as g from '../Globals/globals';
import { getRandomInt, randomNumber } from '../utils';
import { VectorAllocator, VectorMultiplier, VectorNegator } from './FlatVec';
import { keys } from '../input/SimpleInput';
import {
  IntersectCircle,
  IntersectCirclePolygon,
  IntersectsPolygons,
} from './Collisions';

let col = false;

let bodyList = [] as (Circle | Box)[];

export function R() {
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

  RotateBoxes();
  //TestForPolygonCollisions();
  TestCirclPolygonCollisions();
  bodyList.forEach((x) => {
    if (x instanceof Circle) {
      let p = x.GetPos();
      g.ctx.beginPath();
      g.ctx.arc(p.X, p.Y, x.Radius, 0, 2 * Math.PI, false);
      g.ctx.fillStyle = 'green';
      g.ctx.fill();
      g.ctx.lineWidth = 3;
      g.ctx.strokeStyle = 'white';
      g.ctx.stroke();
    }
    if (x instanceof Box) {
      const vert = x.GetTransformVerticies();
      g.ctx.beginPath();

      for (let i = 0; i < vert.length; i++) {
        const v = vert[i];
        if (i === 0) {
          g.ctx.moveTo(v.X, v.Y);
        } else {
          g.ctx.lineTo(v.X, v.Y);
        }
      }
      g.ctx.closePath();
      g.ctx.fillStyle = 'red';
      g.ctx.fill();
    }
  });
  if (col === true) {
    console.log('Drawingggg');
    let player = bodyList[0] as Box;
    const vert = player.GetTransformVerticies();
    g.ctx.beginPath();

    for (let k = 0; k < vert.length; k++) {
      const v = vert[k];
      if (k === 0) {
        g.ctx.moveTo(v.X, v.Y);
      } else {
        g.ctx.lineTo(v.X, v.Y);
      }
    }
    g.ctx.closePath();
    g.ctx.fillStyle = 'green';
    g.ctx.fill();
  }
}

function init() {
  let bodyCount = 10;

  for (let i = 0; i < bodyCount; i++) {
    let type = getRandomInt(2) == 1 ? ShapeType.Box : ShapeType.Circle;

    let body: Circle | Box | null = null;

    let x = randomNumber(20, 1000);
    let y = randomNumber(20, 1000);

    if (type == ShapeType.Circle) {
      body = Circle.Create(20, VectorAllocator(x, y));
    } else {
      //body = FlatBody.CreateBoxBody(VectorAllocator(x, y), 40, 40);
      body = Box.Create(VectorAllocator(x, y), 40, 40);
    }

    bodyList.push(body);
  }

  console.log(bodyList);
  Test();
}

function TestAndResolveCirscleCollisions() {
  for (let index = 0; index < bodyList.length - 1; index++) {
    const body1 = bodyList[index] as Circle;
    for (let index2 = index + 1; index2 < bodyList.length; index2++) {
      const body2 = bodyList[index2] as Circle;
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
}

function TestForPolygonCollisions() {
  for (let i = 0; i < bodyList.length; i++) {
    const p1 = bodyList[i] as Box;
    for (let j = i + 1; j < bodyList.length; j++) {
      const p2 = bodyList[j] as Box;
      //let colRes = false;
      let colRes = IntersectsPolygons(
        p1.GetTransformVerticies(),
        p2.GetTransformVerticies()
      );
      //debugger;
      if (colRes.collision === true) {
        p1.Move(
          VectorMultiplier(VectorNegator(colRes.normal), colRes.depth / 2)
        );
        p2.Move(VectorMultiplier(colRes.normal, colRes.depth / 2));
        //dsareturn true;
      }
    }
  }
}

function TestCirclPolygonCollisions() {
  for (let i = 0; i < bodyList.length; i++) {
    const b1 = bodyList[i];
    for (let j = 0; j < bodyList.length; j++) {
      const b2 = bodyList[j];
      if (b1 instanceof Box && b2 instanceof Circle) {
        let colRes = IntersectCirclePolygon(
          b2.GetPos(),
          b2.Radius,
          b1.GetTransformVerticies()
        );
        if (colRes.collision) {
          b1.Move(VectorMultiplier(colRes.normal, colRes.depth / 2));
          b2.Move(
            VectorMultiplier(VectorNegator(colRes.normal), colRes.depth / 2)
          );
        }
      } else if (b1 instanceof Circle && b2 instanceof Box) {
        let colRes = IntersectCirclePolygon(
          b1.GetPos(),
          b1.Radius,
          b2.GetTransformVerticies()
        );
        if (colRes.collision) {
          b1.Move(
            VectorMultiplier(VectorNegator(colRes.normal), colRes.depth / 2)
          );
          b2.Move(VectorMultiplier(colRes.normal, colRes.depth / 2));
        }
      }
    }
  }
}

let r = 1 / 60;
function RotateBoxes() {
  for (let i = 0; i < bodyList.length; i++) {
    const b = bodyList[i];
    if (b instanceof Box) {
      b.Rotate((Math.PI / 2) * r);
    }
  }
}
