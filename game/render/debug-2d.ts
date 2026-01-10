import { AttackSnapShot } from '../engine/entity/components/attack';
import { ECBSnapShot } from '../engine/entity/components/ecb';
import { FlagsSnapShot } from '../engine/entity/components/flags';
import { FSMInfoSnapShot } from '../engine/entity/components/fsmInfo';
import { HurtCapsule } from '../engine/entity/components/hurtCircles';
import { LedgeDetectorSnapShot } from '../engine/entity/components/ledgeDetector';
import { PositionSnapShot } from '../engine/entity/components/position';
import { SensorSnapShot } from '../engine/entity/components/sensor';
import {
  CalculateRadiusFromTriggerRaw,
  ShieldSnapShot,
} from '../engine/entity/components/shield';
import { StaticHistory } from '../engine/entity/componentHistory';
import { Line } from '../engine/physics/vector';

import { ActiveHitBubblesDTO } from '../engine/pools/ActiveAttackBubbles';
import { Lerp } from '../engine/utils';
import { World } from '../engine/world/world';
import { GrabSnapShot } from '../engine/entity/components/grab';
import { ActiveGrabBubblesDTO } from '../engine/pools/ActiveGrabBubbles';
import { InputAction } from '../input/Input';
import { NumberToRaw, RawToNumber } from '../engine/math/fixedPoint';
import {
  deBugInfoTree,
  StructurePlayerSnapShotForPrinting,
} from '../engine/debug/debugUtils';
import { JazzDebugger } from '../engine/debug/jazzDebugWrapper';

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
export type resolution = {
  x: number;
  y: number;
};

export type window = {
  canvas: HTMLCanvasElement;
  resX: number;
  resY: number;
};

export class DebugRenderer {
  private canvas: HTMLCanvasElement;
  private debugInfoCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dbICtx: CanvasRenderingContext2D;
  private xRes: number;
  private yRes: number;
  private dbxRes: number;
  private dbyRes: number;
  private lastFrame: number = 0;

  constructor(mainWindow: window, debugInfoWindow: window) {
    this.canvas = mainWindow.canvas;
    this.xRes = mainWindow.resX;
    this.yRes = mainWindow.resY;
    this.debugInfoCanvas = debugInfoWindow.canvas;
    this.ctx = mainWindow.canvas.getContext('2d')!;
    this.dbICtx = debugInfoWindow.canvas.getContext('2d')!;
    this.dbxRes = debugInfoWindow.resX;
    this.dbyRes = debugInfoWindow.resY;
    this.canvas.width = this.xRes;
    this.canvas.height = this.yRes;
    this.debugInfoCanvas.width = this.dbxRes;
    this.debugInfoCanvas.height = this.dbyRes;
  }

  render(jazz: JazzDebugger, timeStampNow: number) {
    const world = jazz.World;
    const localFrame = world.LocalFrame - 1 < 0 ? 0 : world.LocalFrame - 1; // world frame is incremented at the end of the loop, so we actually need to get the previous frame, as that is the frame with the most current render artifact.
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
    const currentAttackString = currentAttack?.attack?.Name;

    const input = world.PlayerData.InputStore(0).GetInputForFrame(localFrame);

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
    ctx.fillText(
      `input:[ Action:${input.Action} | LX: ${input.LXAxis.AsNumber} | LY: ${input.LYAxis.AsNumber} | RX: ${input.RXAxis.AsNumber} | RY: ${input.RYAxis.AsNumber} | RT: ${input.RTVal.AsNumber} | LT: ${input.LTVal.AsNumber} ]`,
      10,
      120
    );
    ctx.fillText(`Facing Right: ${playerFacingRight}`, 10, 150);
    ctx.fillText(
      `VectorsRented: ${world.GetRentedVecsForFrame(localFrame)}`,
      10,
      180
    );
    ctx.fillText(
      `CollisionResultsRented: ${world.GetRentedColResForFrame(localFrame)}`,
      10,
      210
    );
    ctx.fillText(
      `ProjectionReultsRented: ${world.GetRentedProjResForFrame(localFrame)}`,
      10,
      240
    );

    ctx.fillText(
      `ATKReultsRented: ${world.GetRentedAtkResForFrame(localFrame)}`,
      10,
      270
    );

    ctx.fillText(
      `ActiveHitBubblesRented: ${world.GetRentedActiveHitBubblesForFrame(
        localFrame
      )}`,
      10,
      300
    );

    if (currentAttackString !== undefined) {
      ctx.fillText(`Attack Name: ${currentAttackString}`, 10, 330);
    }

    this.renderLiveDebugInfo(jazz);

    this.lastFrame = localFrame;
  }

  renderLiveDebugInfo(jazz: JazzDebugger) {
    this.dbICtx.fillStyle = 'black';
    this.dbICtx.fillRect(0, 0, this.dbxRes, this.dbyRes); // Fill the entire canvas with grey
    const pdbs = jazz.playerDebuggers;
    const dbL = pdbs.length;
    let x = 10;
    const y = 30;
    for (let i = 0; i < dbL; i++) {
      const pdb = pdbs[i];
      const root = StructurePlayerSnapShotForPrinting(pdb.LiveStateData);
      PrintDataTreeRoot(x, y, root, this.dbICtx);
      x += 200;
    }
  }
}

function drawStage(ctx: CanvasRenderingContext2D, world: World) {
  const stage = world.StageData.Stage;
  const stageVerts = stage!.StageVerticies.GetVerts()!;
  const color = 'green';
  const stageVertsLength = stageVerts.length;

  ctx.beginPath();
  ctx.moveTo(stageVerts[0].X.AsNumber, stageVerts[0].Y.AsNumber);
  for (let i = 0; i < stageVertsLength; i++) {
    ctx.lineTo(stageVerts[i].X.AsNumber, stageVerts[i].Y.AsNumber);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  const lLedge = stage!.Ledges.GetLeftLedge();
  const rLedge = stage!.Ledges.GetRightLedge();

  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.moveTo(lLedge[0].X.AsNumber, lLedge[0].Y.AsNumber);
  for (let i = 0; i < lLedge.length; i++) {
    ctx.lineTo(lLedge[i].X.AsNumber, lLedge[i].Y.AsNumber);
  }
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(rLedge[0].X.AsNumber, rLedge[0].Y.AsNumber);
  for (let i = 0; i < rLedge.length; i++) {
    ctx.lineTo(rLedge[i].X.AsNumber, rLedge[i].Y.AsNumber);
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
    ctx.moveTo(plat.X1.AsNumber, plat.Y1.AsNumber);
    ctx.lineTo(plat.X2.AsNumber, plat.Y2.AsNumber);
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
  const currentFrame = world.LocalFrame - 1;
  const lastFrame = currentFrame < 1 ? 0 : currentFrame - 1;
  const theFrameBeforeLast = lastFrame < 1 ? 0 : lastFrame - 1;

  for (let i = 0; i < playerCount; i++) {
    const playerHistory = world.GetComponentHistory(i);
    const shield = playerHistory!.ShieldHistory[currentFrame];
    const lastShield = playerHistory!.ShieldHistory[lastFrame];
    const shieldYOffset = playerHistory!.StaticPlayerHistory.ShieldOffset;
    const pos = playerHistory!.PositionHistory[currentFrame];
    const lastPos = playerHistory!.PositionHistory[lastFrame];
    const lastLastPosition = playerHistory!.PositionHistory[theFrameBeforeLast];
    const circlesHistory = playerHistory!.StaticPlayerHistory.HurtCapsules;
    const flags = playerHistory!.FlagsHistory[currentFrame];
    const lastFlags = playerHistory!.FlagsHistory[lastFrame];
    const ecb = playerHistory!.EcbHistory[currentFrame];
    const lastEcb = playerHistory!.EcbHistory[lastFrame];
    const lD = playerHistory!.LedgeDetectorHistory[currentFrame];
    const lastLd = playerHistory!.LedgeDetectorHistory[lastFrame];
    const facingRight = flags.FacingRight;
    const lastFacingRight = lastFlags?.FacingRight;
    const isIntangible = flags.IntangabilityFrames > 0;
    const wasIntangible = lastFlags.IntangabilityFrames > 0;
    const intangible = alpha > 0.5 ? isIntangible : wasIntangible;
    const inputStore = world.PlayerData.InputStore(i);
    const input = inputStore.GetInputForFrame(currentFrame);

    //drawHull(ctx, player);
    drawPrevEcb(ctx, lastEcb, lastLastPosition, lastPos, alpha);
    drawCurrentECB(ctx, ecb, lastPos, pos, alpha);
    drawHurtCircles(
      ctx,
      currentFrame,
      pos,
      lastPos,
      circlesHistory,
      intangible,
      alpha
    );
    drawPositionMarker(ctx, pos, lastPos, alpha);
    const lerpDirection = alpha > 0.5 ? facingRight : lastFacingRight;
    drawDirectionMarker(ctx, lerpDirection, ecb, pos, lastPos, alpha);

    const isShieldActive = alpha > 0.5 ? shield.Active : lastShield.Active;

    if (isShieldActive) {
      drawShield(ctx, input, pos, lastPos, shield, shieldYOffset, alpha);
    }

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
    if (sensors === undefined || sensors.length === 0) {
      continue;
    }
    const pos = playerHistory!.PositionHistory[currentFrame];
    const lastPos = playerHistory!.PositionHistory[lastFrame];
    const flags = playerHistory!.FlagsHistory[currentFrame];
    drawSensors(ctx, alpha, pos, lastPos, flags, sensorsWrapper);
  }

  for (let i = 0; i < playerCount; i++) {
    const playerHistory = world.GetComponentHistory(i);
    const grab = playerHistory!.GrabHistory[currentFrame];
    const fsm = playerHistory!.FsmInfoHistory[currentFrame];
    const flags = playerHistory!.FlagsHistory[currentFrame];
    const pos = playerHistory!.PositionHistory[currentFrame];
    const lastPos = playerHistory!.PositionHistory[lastFrame];
    drawGrabCircles(ctx, grab, fsm, flags, pos, lastPos, alpha);
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
  curPos: PositionSnapShot,
  lastPos: PositionSnapShot,
  flags: FlagsSnapShot,
  sensorsWrapper: SensorSnapShot
) {
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 0.4;

  const sensors = sensorsWrapper.sensors!;
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

function drawShield(
  ctx: CanvasRenderingContext2D,
  ia: InputAction,
  curPosition: PositionSnapShot,
  lastPosition: PositionSnapShot,
  shield: ShieldSnapShot,
  shieldYOffset: number,
  alpha: number
) {
  const x = Lerp(lastPosition.X, curPosition.X, alpha) + shield.ShieldTiltX;
  const y =
    Lerp(lastPosition.Y, curPosition.Y, alpha) +
    shieldYOffset +
    shield.ShieldTiltY;
  const triggerValue = ia.RTValRaw > ia.LTValRaw ? ia.RTValRaw : ia.LTValRaw;
  const radius = RawToNumber(
    CalculateRadiusFromTriggerRaw(
      triggerValue,
      NumberToRaw(shield.CurrentRadius)
    )
  );
  ctx.strokeStyle = 'blue';
  ctx.fillStyle = 'blue';
  ctx.globalAlpha = 0.4;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
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
  pos: PositionSnapShot,
  lastPos: PositionSnapShot,
  alpha: number
) {
  ctx.strokeStyle = 'white';
  const interpolatedX = Lerp(lastPos.X, pos.X, alpha);
  const interpolatedY = Lerp(lastPos.Y, pos.Y, alpha);
  const height = ecb.ecbShape.height.AsNumber;
  const width = ecb.ecbShape.width.AsNumber;
  const yOffset = ecb.ecbShape.yOffset.AsNumber;

  if (facingRight) {
    const rightX = interpolatedX + width / 2;
    const rightY = interpolatedY + yOffset - height / 2;

    ctx.beginPath();
    ctx.moveTo(rightX, rightY);
    ctx.lineTo(rightX + 10, rightY);
    ctx.stroke();
    ctx.closePath();
  } else {
    const leftX = interpolatedX - width / 2;
    const leftY = interpolatedY + yOffset - height / 2;

    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(leftX - 10, leftY);
    ctx.stroke();
    ctx.closePath();
  }
}

function drawPrevEcb(
  ctx: CanvasRenderingContext2D,
  lastEcb: ECBSnapShot,
  lastLastPosition: PositionSnapShot,
  lastPos: PositionSnapShot,
  alpha: number
) {
  ctx.fillStyle = 'red';
  ctx.lineWidth = 3;

  const interpolatedX = Lerp(lastLastPosition.X, lastPos.X, alpha);
  const interpolatedY = Lerp(lastLastPosition.Y, lastPos.Y, alpha);
  const height = lastEcb.ecbShape.height.AsNumber;
  const width = lastEcb.ecbShape.width.AsNumber;
  const yOffset = lastEcb.ecbShape.yOffset.AsNumber;

  const bottomX = interpolatedX;
  const bottomY = interpolatedY + yOffset;
  const topX = interpolatedX;
  const topY = interpolatedY + yOffset - height;
  const leftX = interpolatedX - width / 2;
  const leftY = interpolatedY + yOffset - height / 2;
  const rightX = interpolatedX + width / 2;
  const rightY = interpolatedY + yOffset - height / 2;

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

function drawCurrentECB(
  ctx: CanvasRenderingContext2D,
  ecb: ECBSnapShot,
  lasPos: PositionSnapShot,
  pos: PositionSnapShot,
  alpha: number
) {
  const interpolatedX = Lerp(lasPos.X, pos.X, alpha);
  const interpolatedY = Lerp(lasPos.Y, pos.Y, alpha);
  const height = ecb.ecbShape.height.AsNumber;
  const width = ecb.ecbShape.width.AsNumber;
  const yOffset = ecb.ecbShape.yOffset.AsNumber;

  const bottomX = interpolatedX;
  const bottomY = interpolatedY + yOffset;
  const topX = interpolatedX;
  const topY = interpolatedY + yOffset - height;
  const leftX = interpolatedX - width / 2;
  const leftY = interpolatedY + yOffset - height / 2;
  const rightX = interpolatedX + width / 2;
  const rightY = interpolatedY + yOffset - height / 2;

  ctx.fillStyle = 'orange';
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
const adto = new ActiveHitBubblesDTO();

function drawHitCircles(
  ctx: CanvasRenderingContext2D,
  attack: AttackSnapShot,
  fsmInfo: FSMInfoSnapShot,
  flags: FlagsSnapShot,
  currentPosition: PositionSnapShot,
  lastPosition: PositionSnapShot,
  alpha: number
) {
  if (attack.attack === undefined) {
    return;
  }
  adto.Zero();
  const currentSateFrame = fsmInfo.StateFrame;
  const circles = attack.attack.GetActiveBubblesForFrame(
    currentSateFrame,
    adto
  );

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
    const circle = circles.AtIndex(i);
    if (circle === undefined) {
      continue;
    }
    const offSet = circle?.GetLocalPosiitionOffsetForFrame(currentSateFrame);
    if (offSet === undefined) {
      continue;
    }
    const offsetX = flags.FacingRight
      ? interpolatedX + offSet.X.AsNumber
      : interpolatedX - offSet.X.AsNumber;
    const offsetY = interpolatedY + offSet.Y.AsNumber;

    ctx.beginPath();
    ctx.arc(offsetX, offsetY, circle.Radius.AsNumber, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  ctx.globalAlpha = 1.0;
}

function drawHurtCircles(
  ctx: CanvasRenderingContext2D,
  frame: number,
  curPositon: PositionSnapShot,
  lasPosition: PositionSnapShot,
  hurtCapsules: Array<HurtCapsule>,
  instangible: boolean,
  alpha: number
) {
  ctx.strokeStyle = 'yellow'; // Set the stroke color for the circles
  ctx.fillStyle = 'yellow'; // Set the fill color for the circles

  if (instangible) {
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    if (frame % 2 === 0) {
      ctx.strokeStyle = 'lightgray';
      ctx.fillStyle = 'lightgray';
    }
  }

  ctx.lineWidth = 2; // Set the line width
  ctx.globalAlpha = 0.5; // Set transparency (50%)

  const lerpedPosX = Lerp(lasPosition.X, curPositon.X, alpha);
  const lerpedPosY = Lerp(lasPosition.Y, curPositon.Y, alpha);
  const hcLength = hurtCapsules.length;
  for (let i = 0; i < hcLength; i++) {
    const hurtCapsule = hurtCapsules[i];
    const globalStartX = hurtCapsule.StartOffsetX.AsNumber + lerpedPosX;
    const globalStartY = hurtCapsule.StartOffsetY.AsNumber + lerpedPosY;
    const globalEndX = hurtCapsule.EndOffsetX.AsNumber + lerpedPosX;
    const globalEndY = hurtCapsule.EndOffsetY.AsNumber + lerpedPosY;
    drawCapsule(
      ctx,
      globalStartX,
      globalStartY,
      globalEndX,
      globalEndY,
      hurtCapsule.Radius.AsNumber
    );
  }

  ctx.globalAlpha = 1.0; // Reset transparency to fully opaque
}

const gbDto = new ActiveGrabBubblesDTO();
function drawGrabCircles(
  ctx: CanvasRenderingContext2D,
  grab: GrabSnapShot,
  fsmInfo: FSMInfoSnapShot,
  flags: FlagsSnapShot,
  currentPosition: PositionSnapShot,
  lastPosition: PositionSnapShot,
  alpha: number
) {
  if (grab === undefined) {
    return;
  }

  const currentSateFrame = fsmInfo.StateFrame;
  const circles = grab.GetActiveBubblesForFrame(currentSateFrame, gbDto);

  if (circles === undefined) {
    return;
  }

  ctx.strokeStyle = 'purple';
  ctx.fillStyle = 'purple';
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
    const offSet = circle?.GetLocalPositionOffsetForFrame(currentSateFrame);
    if (offSet === undefined) {
      continue;
    }
    const offsetX = flags.FacingRight
      ? interpolatedX + offSet.X.AsNumber
      : interpolatedX - offSet.X.AsNumber;
    const offsetY = interpolatedY + offSet.Y.AsNumber;
    ctx.beginPath();
    ctx.arc(offsetX, offsetY, circle.Radius.AsNumber, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  ctx.globalAlpha = 1.0;
}

function drawPositionMarker(
  ctx: CanvasRenderingContext2D,
  posHistory: PositionSnapShot,
  lastPosHistory: PositionSnapShot,
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

function PrintDataTreeRoot(
  x: number,
  y: number,
  tree: deBugInfoTree,
  ctx: CanvasRenderingContext2D
) {
  ctx.fillStyle = 'white';
  printDataTreeNode(tree, x, y, ctx);
}

const indent = 13;

const colorLevelMap = new Map<number, string>([
  [0, 'white'],
  [1, 'blue'],
  [2, 'green'],
  [3, 'purple'],
  [4, 'yellow'],
  [5, 'magenta'],
]);

function getColor(level: number) {
  const mpLength = colorLevelMap.size;
  const i = level % mpLength;
  return colorLevelMap.get(i)!;
}

function printDataTreeNode(
  d: deBugInfoTree,
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  level = 0
): number {
  //ctx.fillStyle = getColor(level);
  if (d.kind === 1) {
    const originalStyle = ctx.fillStyle;

    ctx.fillStyle = '#4bff14'; // Sage green
    ctx.fillText(d.label, x, y);
    const labelWidth = ctx.measureText(d.label).width;
    ctx.fillStyle = 'white';
    ctx.fillText(String(d.data), x + labelWidth + 5, y); // 5px padding

    ctx.fillStyle = originalStyle;
    return y + indent;
  } else if (d.kind === 2) {
    ctx.fillStyle = 'cyan';
    ctx.fillText(d.label, x, y);
    const dLength = d.data.length;
    let currentY = y + indent;
    for (let i = 0; i < dLength; i++) {
      const child = d.data[i];
      currentY = printDataTreeNode(child, x + indent, currentY, ctx, level + 1);
    }
    return currentY;
  }
  return y + indent;
}
