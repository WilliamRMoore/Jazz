import { Circle } from '../engine/physics/circle';
import { FlatVec, Line } from '../engine/physics/vector';
import {
  Attack,
  AttackSnapShot,
  ComponentHistory,
  ECBSnapShot,
  FlagsSnapShot,
  FSMInfoSnapShot,
  HurtCapsule,
  HurtCirclesSnapShot,
  LedgeDetectorSnapShot,
  SensorSnapShot,
  StaticHistory,
} from '../engine/player/playerComponents';
import { ActiveHitBubblesDTO } from '../engine/pools/ActiveAttackHitBubbles';
import { Lerp } from '../engine/utils';
import { World } from '../engine/world/world';

function getAlpha(
  timeStampNow: number,
  lastFrame: number,
  localFrame: number,
  previousFrameTimeStamp: number,
  currentFrameTimeStamp: number
): number {
  const preClampAlpha =
    (timeStampNow - previousFrameTimeStamp) /
    (currentFrameTimeStamp - previousFrameTimeStamp);
  const postClampalpha = Math.max(0, Math.min(1, preClampAlpha));

  let alpha = preClampAlpha - postClampalpha;

  if (localFrame === lastFrame || alpha > 1) {
    alpha = 1;
  }

  return alpha;
}

export class DebugRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private xRes: number;
  private yRes: number;
  private lastFrame: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    res: resolution,
    numberOfPlayers: number = 1
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.xRes = res.x;
    this.yRes = res.y;
    this.canvas.width = this.xRes;
    this.canvas.height = this.yRes;
  }

  render(world: World, timeStampNow: number) {
    const localFrame = world.localFrame - 1 < 0 ? 0 : world.localFrame - 1; // world frame is incremented at the end of the loop, so we actually need to get the previous frame, as that is the frame with the most current render artifact.
    const previousFrameTimeStamp = world.GetFrameTimeStampForFrame(
      localFrame === 0 ? 0 : localFrame - 1
    );
    const currentFrameTimeStamp = world.GetFrameTimeStampForFrame(localFrame);

    const alpha = getAlpha(
      timeStampNow,
      this.lastFrame,
      localFrame,
      previousFrameTimeStamp,
      currentFrameTimeStamp
    );

    const playerStateHistory = world.GetComponentHistory(0); // hard coded to player 1 right now
    const playerFacingRight =
      playerStateHistory?.FlagsHistory[localFrame]?.FacingRight ?? true;
    const playerFsmState =
      playerStateHistory?.FsmInfoHistory[localFrame]?.State?.StateName ?? 'N/A';
    const currentAttack = playerStateHistory?.AttackHistory[localFrame];
    const currentAttackString = currentAttack?.Name;

    if (localFrame === 0) {
      return;
    }

    const ctx = this.ctx;
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, this.xRes, this.yRes); // Fill the entire canvas with grey

    drawStage(ctx, world);
    drawPlatforms(ctx, world.StageData.Stage.Platforms);
    drawPlayer(ctx, world, alpha);

    const frameTime = world.GetFrameTimeForFrame(localFrame);

    ctx.fillStyle = 'darkblue';

    ctx.fillText(`Frame: ${localFrame}`, 10, 30);
    ctx.fillText(`FrameTime: ${frameTime}`, 10, 60);
    ctx.fillText(`PlayerState: ${playerFsmState}`, 10, 90);
    ctx.fillText(`Facing Right: ${playerFacingRight}`, 10, 120);
    ctx.fillText(
      `VectorsRented: ${world.GetRentedVecsForFrame(localFrame)}`,
      10,
      150
    );
    ctx.fillText(
      `CollisionResultsRented: ${world.GetRentedColResForFrame(localFrame)}`,
      10,
      180
    );
    ctx.fillText(
      `ProjectionReultsRented: ${world.GetRentedProjResForFrame(localFrame)}`,
      10,
      210
    );

    if (currentAttackString !== undefined) {
      ctx.fillText(`Attack Name: ${currentAttackString}`, 10, 240);
    }

    this.lastFrame = localFrame;
  }
}

export type resolution = {
  x: number;
  y: number;
};

function drawStage(ctx: CanvasRenderingContext2D, world: World) {
  const stage = world.StageData.Stage;
  const stageVerts = stage!.StageVerticies.GetVerts()!;
  const color = 'green';
  const stageVertsLength = stageVerts.length;

  ctx.beginPath();
  ctx.moveTo(stageVerts[0].X, stageVerts[0].Y);
  for (let i = 0; i < stageVertsLength; i++) {
    ctx.lineTo(stageVerts[i].X, stageVerts[i].Y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  const lLedge = stage!.Ledges.GetLeftLedge();
  const rLedge = stage!.Ledges.GetRightLedge();

  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.moveTo(lLedge[0].X, lLedge[0].Y);
  for (let i = 0; i < lLedge.length; i++) {
    ctx.lineTo(lLedge[i].X, lLedge[i].Y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(rLedge[0].X, rLedge[0].Y);
  for (let i = 0; i < rLedge.length; i++) {
    ctx.lineTo(rLedge[i].X, rLedge[i].Y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  plats?: Array<Line>
): void {
  if (plats === undefined || plats.length === 0) {
    return;
  }
  const color = 'white';
  const platsLength = plats.length;

  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  for (let i = 0; i < platsLength; i++) {
    const plat = plats[i];
    ctx.beginPath();
    ctx.moveTo(plat.X1, plat.Y1);
    ctx.lineTo(plat.X2, plat.Y2);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  world: World,
  alpha: number
) {
  const playerCount = world.PlayerData.PlayerCount;
  const currentFrame = world.localFrame - 1;
  const lastFrame = currentFrame < 1 ? 0 : currentFrame - 1;
  for (let i = 0; i < playerCount; i++) {
    const playerHistory = world.GetComponentHistory(i);
    const pos = playerHistory!.PositionHistory[currentFrame];
    const lastPos = playerHistory!.PositionHistory[lastFrame];
    const circlesHistory = playerHistory!.StaticPlayerHistory.HurtCapsules;
    const flags = playerHistory!.FlagsHistory[currentFrame];
    const lastFlags = playerHistory!.FlagsHistory[lastFrame];
    const ecb = playerHistory!.EcbHistory[currentFrame];
    const lastEcb = playerHistory!.EcbHistory[lastFrame];
    const lD = playerHistory!.LedgeDetectorHistory[currentFrame];
    const lastLd = playerHistory!.LedgeDetectorHistory[lastFrame];
    const facingRight = flags.FacingRight;
    const lastFacingRight = lastFlags?.FacingRight;
    const attack = playerHistory!.AttackHistory[currentFrame];
    const fsm = playerHistory!.FsmInfoHistory[currentFrame];

    //drawHull(ctx, player);
    drawPrevEcb(ctx, ecb, lastEcb, alpha);
    drawCurrentECB(ctx, ecb, lastEcb, alpha);
    drawHurtCircles(ctx, pos, lastPos, circlesHistory, alpha);
    drawPositionMarker(ctx, pos, lastPos, alpha);
    const lerpDirection = alpha > 0.5 ? facingRight : lastFacingRight;
    drawDirectionMarker(ctx, lerpDirection, ecb, lastEcb, alpha);
    drawLedgeDetectors(
      ctx,
      facingRight,
      playerHistory!.StaticPlayerHistory,
      lD,
      lastLd,
      alpha
    );
  }

  for (let i = 0; i < playerCount; i++) {
    const playerHistory = world.GetComponentHistory(i);
    const sensorsWrapper = playerHistory!.SensorsHistory[currentFrame];
    const sensors = sensorsWrapper.sensors;
    if (sensors.length === 0) {
      continue;
    }
    const pos = playerHistory!.PositionHistory[currentFrame];
    const lastPos = playerHistory!.PositionHistory[lastFrame];
    const flags = playerHistory!.FlagsHistory[currentFrame];
    drawSensors(ctx, alpha, pos, lastPos, flags, sensorsWrapper);
  }

  for (let i = 0; i < playerCount; i++) {
    const playerHistory = world.GetComponentHistory(i);
    const pos = playerHistory!.PositionHistory[currentFrame];
    const lastPos = playerHistory!.PositionHistory[lastFrame];
    const flags = playerHistory!.FlagsHistory[currentFrame];
    const attack = playerHistory!.AttackHistory[currentFrame];
    const fsm = playerHistory!.FsmInfoHistory[currentFrame];
    drawHitCircles(ctx, attack, fsm, flags, pos, lastPos, alpha);
  }
}

function drawSensors(
  ctx: CanvasRenderingContext2D,
  alpha: number,
  curPos: FlatVec,
  lastPos: FlatVec,
  flags: FlagsSnapShot,
  sensorsWrapper: SensorSnapShot
) {
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 0.4;

  const sensors = sensorsWrapper.sensors;
  const interpolatedX = Lerp(lastPos.X, curPos.X, alpha);
  const interpolatedY = Lerp(lastPos.Y, curPos.Y, alpha);
  const facingRight = flags.FacingRight;
  const sensorLength = sensors.length;

  for (let i = 0; i < sensorLength; i++) {
    const s = sensors[i];
    const x = interpolatedX + (facingRight ? s.xOffset : -s.xOffset);
    const y = interpolatedY + s.yOffset;
    ctx.beginPath();
    ctx.arc(x, y, s.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  ctx.globalAlpha = 1.0;
}

function drawLedgeDetectors(
  ctx: CanvasRenderingContext2D,
  facingRight: boolean,
  staticHistory: StaticHistory,
  ledgeDetectorHistory: LedgeDetectorSnapShot,
  lastLedgeDetectorHistory: LedgeDetectorSnapShot,
  alpha: number
) {
  const ldHeight = staticHistory.ledgDetecorHeight;
  const ldWidth = staticHistory.LedgeDetectorWidth;
  const curMiddleTopX = ledgeDetectorHistory.middleX;
  const curMiddleTopY = ledgeDetectorHistory.middleY;
  const curTopRightX = ledgeDetectorHistory.middleX + ldWidth;
  const curTopRightY = ledgeDetectorHistory.middleY;
  const curBottomRightX = ledgeDetectorHistory.middleX + ldWidth;
  const curBottomRightY = ledgeDetectorHistory.middleY + ldHeight;
  const curMiddleBottomx = ledgeDetectorHistory.middleX;
  const curMiddleBottomY = ledgeDetectorHistory.middleY + ldHeight;
  const curTopLeftX = ledgeDetectorHistory.middleX - ldWidth;
  const curTopLeftY = ledgeDetectorHistory.middleY;
  const curBottomLeftX = ledgeDetectorHistory.middleX - ldWidth;
  const curBottomLeftY = ledgeDetectorHistory.middleY + ldHeight;

  const lastMiddleTopX = lastLedgeDetectorHistory.middleX;
  const lastMiddleTopY = lastLedgeDetectorHistory.middleY;
  const lastTopRightX = lastLedgeDetectorHistory.middleX + ldWidth;
  const lastTopRightY = lastLedgeDetectorHistory.middleY;
  const lastBottomRightX = lastLedgeDetectorHistory.middleX + ldWidth;
  const lastBottomRightY = lastLedgeDetectorHistory.middleY + ldHeight;
  const lastMiddleBottomx = lastLedgeDetectorHistory.middleX;
  const lastMiddleBottomY = lastLedgeDetectorHistory.middleY + ldHeight;
  const lastTopLeftX = lastLedgeDetectorHistory.middleX - ldWidth;
  const lastTopLeftY = lastLedgeDetectorHistory.middleY;
  const lastBottomLeftX = lastLedgeDetectorHistory.middleX - ldWidth;
  const lastBottomLeftY = lastLedgeDetectorHistory.middleY + ldHeight;

  const middleTopX = Lerp(lastMiddleTopX, curMiddleTopX, alpha);
  const middleTopY = Lerp(lastMiddleTopY, curMiddleTopY, alpha);
  const TopRightX = Lerp(lastTopRightX, curTopRightX, alpha);
  const TopRightY = Lerp(lastTopRightY, curTopRightY, alpha);
  const BottomRightX = Lerp(lastBottomRightX, curBottomRightX, alpha);
  const BottomRightY = Lerp(lastBottomRightY, curBottomRightY, alpha);
  const middleBottomx = Lerp(lastMiddleBottomx, curMiddleBottomx, alpha);
  const middleBottomY = Lerp(lastMiddleBottomY, curMiddleBottomY, alpha);
  const topLeftX = Lerp(lastTopLeftX, curTopLeftX, alpha);
  const topLeftY = Lerp(lastTopLeftY, curTopLeftY, alpha);
  const bottomLeftX = Lerp(lastBottomLeftX, curBottomLeftX, alpha);
  const bottomLeftY = Lerp(lastBottomLeftY, curBottomLeftY, alpha);

  // Draw right detector
  ctx.strokeStyle = 'blue';

  if (!facingRight) {
    ctx.strokeStyle = 'red';
  }

  ctx.beginPath();
  ctx.moveTo(middleTopX, middleTopY);
  ctx.lineTo(TopRightX, TopRightY);
  ctx.lineTo(BottomRightX, BottomRightY);
  ctx.lineTo(middleBottomx, middleBottomY);
  ctx.closePath();
  ctx.stroke();

  // Draw left detector
  ctx.strokeStyle = 'red';

  if (!facingRight) {
    ctx.strokeStyle = 'blue';
  }

  ctx.beginPath();
  ctx.moveTo(topLeftX, topLeftY);
  ctx.lineTo(middleTopX, middleTopY);
  ctx.lineTo(middleBottomx, middleBottomY);
  ctx.lineTo(bottomLeftX, bottomLeftY);
  ctx.closePath();
  ctx.stroke();
}

function drawDirectionMarker(
  ctx: CanvasRenderingContext2D,
  facingRight: boolean,
  ecb: ECBSnapShot,
  lastEcb: ECBSnapShot,
  alpha: number
) {
  const yOffset = ecb.YOffset;
  ctx.strokeStyle = 'white';
  if (facingRight) {
    const curRightX = ComponentHistory.GetRightXFromEcbHistory(ecb);
    const curRightY = ComponentHistory.GetRightYFromEcbHistory(ecb) + yOffset;
    const lastRightX = ComponentHistory.GetRightXFromEcbHistory(lastEcb);
    const lastRightY =
      ComponentHistory.GetRightYFromEcbHistory(lastEcb) + yOffset;

    const rightX = Lerp(lastRightX, curRightX, alpha);
    const rightY = Lerp(lastRightY, curRightY, alpha);

    ctx.beginPath();
    ctx.moveTo(rightX, rightY);
    ctx.lineTo(rightX + 10, rightY);
    ctx.stroke();
    ctx.closePath();
  } else {
    const curLeftX = ComponentHistory.GetLeftXFromEcbHistory(ecb);
    const curLeftY = ComponentHistory.GetLeftYFromEcbHistory(ecb) + yOffset;
    const lastLeftX = ComponentHistory.GetLeftXFromEcbHistory(lastEcb);
    const lastLeftY =
      ComponentHistory.GetLeftYFromEcbHistory(lastEcb) + yOffset;

    const leftX = Lerp(lastLeftX, curLeftX, alpha);
    const leftY = Lerp(lastLeftY, curLeftY, alpha);

    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(leftX - 10, leftY);
    ctx.stroke();
    ctx.closePath();
  }
}

function drawPrevEcb(
  ctx: CanvasRenderingContext2D,
  curEcb: ECBSnapShot,
  lastEcb: ECBSnapShot,
  alpha: number
) {
  ctx.fillStyle = 'red';
  ctx.lineWidth = 3;

  const curYOffset = curEcb.YOffset;
  const prevYOffset = lastEcb.YOffset;

  const curLeftX = ComponentHistory.GetPrevLeftXFromEcbHistory(curEcb);
  const curLeftY =
    ComponentHistory.GetPrevLeftYFromEcbHistory(curEcb) + curYOffset;
  const curTopX = ComponentHistory.GetPrevTopXFromEcbHistory(curEcb);
  const curTopY =
    ComponentHistory.GetPrevTopYFromEcbHistory(curEcb) + curYOffset;
  const curRightX = ComponentHistory.GetPrevRightXFromEcbHistory(curEcb);
  const curRightY =
    ComponentHistory.GetPrevRightYFromEcbHistory(curEcb) + curYOffset;
  const curBottomX = ComponentHistory.GetPrevBottomXFromEcbHistory(curEcb);
  const curBottomY =
    ComponentHistory.GetPrevBottomYFromEcbHistory(curEcb) + curYOffset;

  const lastLeftX = ComponentHistory.GetPrevLeftXFromEcbHistory(lastEcb);
  const lastLeftY =
    ComponentHistory.GetPrevLeftYFromEcbHistory(lastEcb) + prevYOffset;
  const lastTopX = ComponentHistory.GetPrevTopXFromEcbHistory(lastEcb);
  const lastTopY =
    ComponentHistory.GetPrevTopYFromEcbHistory(lastEcb) + prevYOffset;
  const lastRightX = ComponentHistory.GetPrevRightXFromEcbHistory(lastEcb);
  const lastRightY =
    ComponentHistory.GetPrevRightYFromEcbHistory(lastEcb) + prevYOffset;
  const LastBottomX = ComponentHistory.GetPrevBottomXFromEcbHistory(lastEcb);
  const LastBottomY =
    ComponentHistory.GetPrevBottomYFromEcbHistory(lastEcb) + prevYOffset;

  const leftX = Lerp(lastLeftX, curLeftX, alpha);
  const leftY = Lerp(lastLeftY, curLeftY, alpha);
  const topX = Lerp(lastTopX, curTopX, alpha);
  const topY = Lerp(lastTopY, curTopY, alpha);
  const rightX = Lerp(lastRightX, curRightX, alpha);
  const rightY = Lerp(lastRightY, curRightY, alpha);
  const bottomX = Lerp(LastBottomX, curBottomX, alpha);
  const bottomY = Lerp(LastBottomY, curBottomY, alpha);

  // draw previous ECB
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(leftX, leftY);
  ctx.lineTo(topX, topY);
  ctx.lineTo(rightX, rightY);
  ctx.lineTo(bottomX, bottomY);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

// function drawHull(ctx: CanvasRenderingContext2D, player: PlayerRenderData) {
//   const ccHull = player.hull;
//   //draw hull
//   ctx.beginPath();
//   ctx.moveTo(ccHull[0].X, ccHull[0].Y);
//   for (let i = 0; i < ccHull.length; i++) {
//     ctx.lineTo(ccHull[i].X, ccHull[i].Y);
//   }
//   ctx.closePath();
//   ctx.fill();
// }

function drawCurrentECB(
  ctx: CanvasRenderingContext2D,
  ecb: ECBSnapShot,
  lastEcb: ECBSnapShot,
  alpha: number
) {
  const curyOffset = ecb.YOffset;
  const prevYOffset = lastEcb.YOffset;

  const curLeftX = ComponentHistory.GetLeftXFromEcbHistory(ecb);
  const curLeftY = ComponentHistory.GetLeftYFromEcbHistory(ecb) + curyOffset;
  const curTopX = ComponentHistory.GetTopXFromEcbHistory(ecb);
  const curTopY = ComponentHistory.GetTopYFromEcbHistory(ecb) + curyOffset;
  const curRightX = ComponentHistory.GetRightXFromEcbHistory(ecb);
  const curRightY = ComponentHistory.GetRightYFromEcbHistory(ecb) + curyOffset;
  const curBottomX = ComponentHistory.GetBottomXFromEcbHistory(ecb);
  const curBottomY =
    ComponentHistory.GetBottomYFromEcbHistory(ecb) + curyOffset;

  const lastLeftX = ComponentHistory.GetLeftXFromEcbHistory(lastEcb);
  const lastLeftY =
    ComponentHistory.GetLeftYFromEcbHistory(lastEcb) + prevYOffset;
  const lastTopX = ComponentHistory.GetTopXFromEcbHistory(lastEcb);
  const lastTopY =
    ComponentHistory.GetTopYFromEcbHistory(lastEcb) + prevYOffset;
  const lastRightX = ComponentHistory.GetRightXFromEcbHistory(lastEcb);
  const lastRightY =
    ComponentHistory.GetRightYFromEcbHistory(lastEcb) + prevYOffset;
  const lastBottomX = ComponentHistory.GetBottomXFromEcbHistory(lastEcb);
  const lastBottomY =
    ComponentHistory.GetBottomYFromEcbHistory(lastEcb) + prevYOffset;

  const leftX = Lerp(lastLeftX, curLeftX, alpha);
  const leftY = Lerp(lastLeftY, curLeftY, alpha);
  const topX = Lerp(lastTopX, curTopX, alpha);
  const topY = Lerp(lastTopY, curTopY, alpha);
  const rightX = Lerp(lastRightX, curRightX, alpha);
  const rightY = Lerp(lastRightY, curRightY, alpha);
  const bottomX = Lerp(lastBottomX, curBottomX, alpha);
  const bottomY = Lerp(lastBottomY, curBottomY, alpha);

  ctx.fillStyle = 'orange';
  ctx.strokeStyle = 'purple';
  ctx.beginPath();
  ctx.moveTo(leftX, leftY);
  ctx.lineTo(topX, topY);
  ctx.lineTo(rightX, rightY);
  ctx.lineTo(bottomX, bottomY);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}
const adto = new ActiveHitBubblesDTO();

function drawHitCircles(
  ctx: CanvasRenderingContext2D,
  attack: AttackSnapShot,
  fsmInfo: FSMInfoSnapShot,
  flags: FlagsSnapShot,
  currentPosition: FlatVec,
  lastPosition: FlatVec,
  alpha: number
) {
  if (attack === undefined) {
    return;
  }
  adto.Zero();
  const currentSateFrame = fsmInfo.StateFrame;
  const circles = attack.GetActiveHitBubblesForFrame(currentSateFrame, adto); //.GetHitBubblesForFrame(currentSateFrame);

  if (circles === undefined) {
    return;
  }

  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'red';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  const length = circles.Length;

  const interpolatedX = Lerp(lastPosition.X, currentPosition.X, alpha);
  const interpolatedY = Lerp(lastPosition.Y, currentPosition.Y, alpha);

  for (let i = 0; i < length; i++) {
    const circle = circles.AtIndex(i); //circles[i];
    if (circle === undefined) {
      continue;
    }
    const offSet = circle?.GetLocalPosiitionOffsetForFrame(currentSateFrame); //circle.GetLocalOffSetForFrame(currentSateFrame);
    if (offSet === undefined) {
      continue;
    }
    const offsetX = flags.FacingRight
      ? interpolatedX + offSet.X
      : interpolatedX - offSet.X;
    const offsetY = interpolatedY + offSet.Y;

    ctx.beginPath();
    ctx.arc(offsetX, offsetY, circle.Radius, 0, Math.PI * 2);
    ctx.fill(); // Fill the circle with yellow
    ctx.stroke(); // Draw the circle outline
    ctx.closePath();
  }
  ctx.globalAlpha = 1.0;
}

function drawHurtCircles(
  ctx: CanvasRenderingContext2D,
  curPositon: FlatVec,
  lasPosition: FlatVec,
  hurtCapsules: Array<HurtCapsule>,
  alpha: number
) {
  ctx.strokeStyle = 'yellow'; // Set the stroke color for the circles
  ctx.fillStyle = 'yellow'; // Set the fill color for the circles
  ctx.lineWidth = 2; // Set the line width
  ctx.globalAlpha = 0.5; // Set transparency (50%)

  const lerpedPosX = Lerp(lasPosition.X, curPositon.X, alpha);
  const lerpedPosY = Lerp(lasPosition.Y, curPositon.Y, alpha);
  const hcLength = hurtCapsules.length;
  for (let i = 0; i < hcLength; i++) {
    const hurtCapsule = hurtCapsules[i];
    const globalStartX = hurtCapsule.StartOffsetX + lerpedPosX;
    const globalStartY = hurtCapsule.StartOffsetY + lerpedPosY;
    const globalEndX = hurtCapsule.EndOffsetX + lerpedPosX;
    const globalEndY = hurtCapsule.EndOffsetY + lerpedPosY;
    drawCapsule(
      ctx,
      globalStartX,
      globalStartY,
      globalEndX,
      globalEndY,
      hurtCapsule.Radius
    );
  }

  ctx.globalAlpha = 1.0; // Reset transparency to fully opaque
}

function drawPositionMarker(
  ctx: CanvasRenderingContext2D,
  posHistory: FlatVec,
  lastPosHistory: FlatVec,
  alpha: number
) {
  const playerPosX = Lerp(lastPosHistory.X, posHistory.X, alpha);
  const playerPosY = Lerp(lastPosHistory.Y, posHistory.Y, alpha);

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'blue';

  ctx.beginPath();
  ctx.moveTo(playerPosX, playerPosY);
  ctx.lineTo(playerPosX + 10, playerPosY);
  ctx.stroke();
  ctx.moveTo(playerPosX, playerPosY);
  ctx.lineTo(playerPosX - 10, playerPosY);
  ctx.stroke();
  ctx.moveTo(playerPosX, playerPosY);
  ctx.lineTo(playerPosX, playerPosY + 10);
  ctx.stroke();
  ctx.moveTo(playerPosX, playerPosY);
  ctx.lineTo(playerPosX, playerPosY - 10);
  ctx.stroke();
  ctx.closePath();
}

function drawCapsule(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number
) {
  // Calculate the angle of the capsule
  const angle = Math.atan2(y2 - y1, x2 - x1);

  // Calculate the perpendicular offset vector for the rectangle
  const offsetX = Math.sin(angle) * radius; // Perpendicular to the line
  const offsetY = -Math.cos(angle) * radius; // Perpendicular to the line

  // Start drawing the capsule
  ctx.beginPath();

  // Draw the first semicircle (start point)
  ctx.arc(x1, y1, radius, angle + Math.PI / 2, angle - Math.PI / 2, false);

  // Draw the rectangle connecting the two semicircles
  ctx.lineTo(x2 + offsetX, y2 + offsetY); // Top edge of the rectangle
  ctx.arc(x2, y2, radius, angle - Math.PI / 2, angle + Math.PI / 2, false); // Second semicircle
  ctx.lineTo(x1 - offsetX, y1 - offsetY); // Bottom edge of the rectangle

  ctx.closePath();

  // Fill and stroke the capsule
  ctx.fill();
  ctx.stroke();
}
