import { Line } from '../engine/physics/vector';
import { World } from '../engine/world/world';
import {
  deBugInfoTree,
  StructurePlayerSnapShotForPrinting,
} from '../engine/debug/debugUtils';
import { envConfig } from '../engine/config/main-config';
import { PlayerLerper, LerpedPlayer } from './render-utlis';

function getAlpha(
  timeStampNow: number,
  lastFrame: number,
  localFrame: number,
  previousFrameTimeStamp: number,
  currentFrameTimeStamp: number,
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

export type renderTarget = {
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
  public PlayerDeBugInfo: boolean = false;
  private playerLerper: PlayerLerper;
  private averageTickRate: number = 0;
  private tickHistory: Array<{ t: number; f: number }> = [];

  constructor(mainWindow: renderTarget, debugInfoWindow: renderTarget) {
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
    this.playerLerper = new PlayerLerper(envConfig);
  }

  render(world: World, timeStampNow: number) {
    // Calculate tick rate
    this.tickHistory.push({ t: timeStampNow, f: world.LocalFrame });
    const fiveSecondsAgo = timeStampNow - 5000;
    while (
      this.tickHistory.length > 0 &&
      this.tickHistory[0].t < fiveSecondsAgo
    ) {
      this.tickHistory.shift();
    }

    if (this.tickHistory.length > 1) {
      const oldest = this.tickHistory[0];
      const newest = this.tickHistory[this.tickHistory.length - 1];
      const timeDelta = (newest.t - oldest.t) / 1000;
      if (timeDelta > 0) {
        this.averageTickRate = (newest.f - oldest.f) / timeDelta;
      }
    }

    const localFrame = world.LocalFrame - 1 < 0 ? 0 : world.LocalFrame - 1; // world frame is incremented at the end of the loop, so we actually need to get the previous frame, as that is the frame with the most current render artifact.
    const previousFrameTimeStamp = world.GetFrameTimeStampForFrame(
      localFrame === 0 ? 0 : localFrame - 1,
    );
    const currentFrameTimeStamp = world.GetFrameTimeStampForFrame(localFrame);

    const alpha = getAlpha(
      timeStampNow,
      this.lastFrame,
      localFrame,
      previousFrameTimeStamp,
      currentFrameTimeStamp,
    );

    this.playerLerper.Zero();

    if (localFrame === 0) {
      return;
    }

    const ctx = this.ctx;
    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 0, this.xRes, this.yRes); // Fill the entire canvas with grey

    drawStage(ctx, world);
    const stagesLength = world.StageData.Stages.length;
    for (let i = 0; i < stagesLength; i++) {
      drawPlatforms(ctx, world.StageData.Stages[i].Platforms);
    }

    drawPlayer(ctx, world, alpha, this.playerLerper);

    const frameTime = world.GetFrameTimeForFrame(localFrame);

    ctx.fillStyle = 'darkblue';

    ctx.fillText(`Frame: ${localFrame}`, 10, 30);
    ctx.fillText(`FrameTime: ${frameTime}`, 10, 60);
    ctx.fillText(
      `VectorsRented: ${world.GetRentedVecsForFrame(localFrame)}`,
      10,
      90,
    );
    ctx.fillText(
      `CollisionResultsRented: ${world.GetRentedColResForFrame(localFrame)}`,
      10,
      120,
    );
    ctx.fillText(
      `ProjectionReultsRented: ${world.GetRentedProjResForFrame(localFrame)}`,
      10,
      150,
    );
    ctx.fillText(
      `ATKReultsRented: ${world.GetRentedAtkResForFrame(localFrame)}`,
      10,
      180,
    );
    ctx.fillText(
      `ActiveHitBubblesRented: ${world.GetRentedActiveHitBubblesForFrame(
        localFrame,
      )}`,
      10,
      210,
    );
    ctx.fillText(
      `ClosestPointsRented: ${world.GetRentedClosestPointsForFrame(
        localFrame,
      )}`,
      10,
      240,
    );

    ctx.fillText(
      `ECBDiamondDTOsRented: ${world.GetRentedECBDtosForFrame(localFrame)}`,
      10,
      270,
    );

    ctx.fillText(
      `AABBsRented: ${world.GetRentedAABBDtosForFrame(localFrame)}`,
      10,
      300,
    );

    ctx.fillText(
      `Avg Tick Rate (5s): ${this.averageTickRate.toFixed(2)} Hz`,
      10,
      330,
    );
    if (this.PlayerDeBugInfo) {
      this.renderLiveDebugInfo(world);
    }

    this.lastFrame = localFrame;
  }

  renderLiveDebugInfo(world: World) {
    this.dbICtx.fillStyle = 'black';
    this.dbICtx.fillRect(0, 0, this.dbxRes, this.dbyRes); // Fill the entire canvas with grey
    const pdbs = world.DebugAdapters;
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
  const stages = world.StageData.Stages;
  const stagesLength = stages.length;

  for (let i = 0; i < stagesLength; i++) {
    const stage = stages[i];
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
}

function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  plats?: Array<Line>,
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
  alpha: number,
  playerLerper: PlayerLerper,
) {
  const playerCount = world.PlayerData.PlayerCount;

  for (let i = 0; i < playerCount; i++) {
    const pTable = world.HistoryData.PlayerHistoryDB[i];
    const now = world.LocalFrame - 1 < 0 ? 0 : world.LocalFrame - 1;
    const then = now < 1 ? 0 : now - 1;
    const previousECBFrame = then < 1 ? 0 : then - 1;

    const previousState = pTable.get(previousECBFrame);
    const thenState = pTable.get(then);
    const nowState = pTable.get(now);

    const lp = playerLerper.Lerp(previousState, thenState, nowState, alpha);
    drawPrevEcb(ctx, lp.PreviousEcb);
    drawCurrentECB(ctx, lp.Ecb);
    drawHurtCircles(ctx, lp, world.LocalFrame);
    drawPositionMarker(ctx, lp.Position);
    drawDirectionMarker(ctx, lp);
    if (lp.Shield.a) {
      drawShield(ctx, lp.Shield);
    }
    drawLedgeDetectors(ctx, lp);
    drawSensors(ctx, lp.Sensors);
    drawGrabCircles(ctx, lp.GrabBubbles);
    drawHitCircles(ctx, lp.AttackBubbles);
  }
}

function drawSensors(
  ctx: CanvasRenderingContext2D,
  sensors: LerpedPlayer['Sensors'],
) {
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 0.4;

  const sensorLength = sensors.length;

  for (let i = 0; i < sensorLength; i++) {
    const s = sensors[i];
    if (!s.a) {
      continue;
    }
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  ctx.globalAlpha = 1.0;
}

function drawShield(
  ctx: CanvasRenderingContext2D,
  shield: LerpedPlayer['Shield'],
) {
  ctx.strokeStyle = 'blue';
  ctx.fillStyle = 'blue';
  ctx.globalAlpha = 0.4;

  ctx.beginPath();
  ctx.arc(shield.X, shield.Y, shield.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  ctx.globalAlpha = 1.0;
}

function drawLedgeDetectors(ctx: CanvasRenderingContext2D, lp: LerpedPlayer) {
  const facingRight = lp.Flags.FacingRight;
  const ldr = lp.LedgeDetectorRight;
  const ldl = lp.LedgeDetectorLeft;

  // Draw right detector
  ctx.strokeStyle = 'blue';
  if (!facingRight) {
    ctx.strokeStyle = 'red';
  }

  ctx.beginPath();
  ctx.moveTo(ldr.topLeftX, ldr.topLeftY);
  ctx.lineTo(ldr.topRightX, ldr.topRightY);
  ctx.lineTo(ldr.bottomRightX, ldr.bottomRightY);
  ctx.lineTo(ldr.bottomLeftX, ldr.bottomLeftY);
  ctx.closePath();
  ctx.stroke();

  // Draw left detector
  ctx.strokeStyle = 'red';
  if (!facingRight) {
    ctx.strokeStyle = 'blue';
  }

  ctx.beginPath();
  ctx.moveTo(ldl.topLeftX, ldl.topLeftY);
  ctx.lineTo(ldl.topRightX, ldl.topRightY);
  ctx.lineTo(ldl.bottomRightX, ldl.bottomRightY);
  ctx.lineTo(ldl.bottomLeftX, ldl.bottomLeftY);
  ctx.closePath();
  ctx.stroke();
}

function drawDirectionMarker(ctx: CanvasRenderingContext2D, lp: LerpedPlayer) {
  ctx.strokeStyle = 'white';
  const facingRight = lp.Flags.FacingRight;
  const ecb = lp.Ecb;
  const centerX = lp.Position.X;
  const centerY = ecb.r.y;

  if (facingRight) {
    const rightX = ecb.r.x;
    const rightY = centerY;

    ctx.beginPath();
    ctx.moveTo(rightX, rightY);
    ctx.lineTo(rightX + 10, rightY);
    ctx.stroke();
    ctx.closePath();
  } else {
    const leftX = ecb.l.x;
    const leftY = centerY;

    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(leftX - 10, leftY);
    ctx.stroke();
    ctx.closePath();
  }
}

function drawPrevEcb(
  ctx: CanvasRenderingContext2D,
  ecb: LerpedPlayer['PreviousEcb'],
) {
  ctx.fillStyle = 'red';
  ctx.lineWidth = 3;

  // draw previous ECB
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(ecb.l.x, ecb.l.y);
  ctx.lineTo(ecb.t.x, ecb.t.y);
  ctx.lineTo(ecb.r.x, ecb.r.y);
  ctx.lineTo(ecb.b.x, ecb.b.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

function drawCurrentECB(
  ctx: CanvasRenderingContext2D,
  ecb: LerpedPlayer['Ecb'],
) {
  ctx.fillStyle = 'orange';
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(ecb.l.x, ecb.l.y);
  ctx.lineTo(ecb.t.x, ecb.t.y);
  ctx.lineTo(ecb.r.x, ecb.r.y);
  ctx.lineTo(ecb.b.x, ecb.b.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

function drawHitCircles(
  ctx: CanvasRenderingContext2D,
  circles: LerpedPlayer['AttackBubbles'],
) {
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'red';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  const length = circles.length;

  for (let i = 0; i < length; i++) {
    const circle = circles[i];
    if (!circle.a) {
      continue;
    }
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  ctx.globalAlpha = 1.0;
}

function drawHurtCircles(
  ctx: CanvasRenderingContext2D,
  lp: LerpedPlayer,
  frame: number,
) {
  const hurtCapsules = lp.HurtBubbles;
  const instangible = lp.Flags.intangible;
  // but basic intangible check is present.

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

  const hcLength = hurtCapsules.length;
  for (let i = 0; i < hcLength; i++) {
    const hurtCapsule = hurtCapsules[i];
    if (!hurtCapsule.a) {
      continue;
    }
    drawCapsule(
      ctx,
      hurtCapsule.x1,
      hurtCapsule.y1,
      hurtCapsule.x2,
      hurtCapsule.y2,
      hurtCapsule.r,
    );
  }

  ctx.globalAlpha = 1.0; // Reset transparency to fully opaque
}

function drawGrabCircles(
  ctx: CanvasRenderingContext2D,
  circles: LerpedPlayer['GrabBubbles'],
) {
  ctx.strokeStyle = 'purple';
  ctx.fillStyle = 'purple';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  const length = circles.length;

  for (let i = 0; i < length; i++) {
    const circle = circles[i];
    if (!circle.a) {
      continue;
    }
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  ctx.globalAlpha = 1.0;
}

function drawPositionMarker(
  ctx: CanvasRenderingContext2D,
  pos: LerpedPlayer['Position'],
) {
  const playerPosX = pos.X;
  const playerPosY = pos.Y;

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
  radius: number,
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
  ctx: CanvasRenderingContext2D,
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
  level = 0,
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
