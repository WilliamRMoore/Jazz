import { GetInput, NewInputAction } from './engine/input/Input';
import { playerControllerInfo, start } from './loops/local-main';
import { InitGamePage } from './ui/game-page';
import {
  LocalInputBufferReader,
  LocalInputBufferWriter,
} from './workers/workerUtils';
import { RENDERFPS60Loop } from './loops/FPS60LoopExecutor';
import { PlayerStateHistory } from './engine/systems/history';
import { DefaultCharacterConfig } from './character/default';
import { ToFV } from './engine/utils';
import { RawToNumber } from './engine/math/fixedPoint';
import { defaultStage, Stage } from './engine/stage/stageMain';
import { Line } from './engine/physics/vector';

document.addEventListener('DOMContentLoaded', () => {
  InitGamePage();
});

const p1GamePadSelect = document.getElementById(
  'p1-gamepad-select',
) as HTMLSelectElement;

const p2GamePadSelect = document.getElementById(
  'p2-gamepad-select',
) as HTMLSelectElement;

const modeSelect = document.getElementById('mode-select') as HTMLSelectElement;

const starBtn = document.getElementById('start-game') as HTMLButtonElement;

starBtn.addEventListener('click', () => {
  // const selectedGamePadIndex = Number.parseInt(p1GamePadSelect.value);
  // console.log(`Selected gamepad index: ${selectedGamePadIndex}`);

  const mode = modeSelect.value;

  const p1GamePad = Number.parseInt(p1GamePadSelect.value);

  if (mode == '1') {
    const controllerInfo = {
      playerIndex: 0,
      inputIndex: p1GamePad,
    } as playerControllerInfo;
    start([controllerInfo]);
  }

  if (mode == '2') {
    const p2GamePad = Number.parseInt(p2GamePadSelect.value);
    const controllerInfo = [
      { playerIndex: 0, inputIndex: p1GamePad },
      { playerIndex: 1, inputIndex: p2GamePad },
    ] as Array<playerControllerInfo>;
    start(controllerInfo);
  }

  // web worker test version
  if (mode == '3') {
    const controllerInfo = {
      playerIndex: 0,
      inputIndex: p1GamePad,
    } as playerControllerInfo;
    startEngine(controllerInfo);
  }
});

function startEngine(controllerInfo: playerControllerInfo) {
  // Buffer size needs to be 40 to accommodate LocalInputBuffer slots (max index accessed is 1 + 3 * 9 + 8 = 36)
  const inputSab = new SharedArrayBuffer(40 * Int32Array.BYTES_PER_ELEMENT);
  const writeBackSab = new SharedArrayBuffer(40 * Int32Array.BYTES_PER_ELEMENT);

  // Max players = 2, 3 frames each
  const stateSabSize = 2 * 3 * PlayerStateHistory.BufferSize();
  const stateSab = new SharedArrayBuffer(stateSabSize);

  const frameSab = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);

  const inputBuffer = new Int32Array(inputSab);
  const writeBackBuffer = new Int32Array(writeBackSab);
  const stateBuffer = new Int32Array(stateSab);
  const frameBuffer = new Int32Array(frameSab);

  const inputWriter = new LocalInputBufferWriter(inputBuffer);
  const writeBackReader = new LocalInputBufferReader(writeBackBuffer);

  const worker = new Worker(new URL('./local-worker.js', import.meta.url), {
    type: 'module',
  });

  worker.postMessage({
    type: 'INIT',
    payload: {
      inputBuffer: inputSab,
      writeBackBuffer: writeBackSab,
      stateBuffer: stateSab,
      frameBuffer: frameSab,
    },
  });

  const mapReplacer = (key: string, value: any) => {
    if (value instanceof Map) {
      return {
        __dataType: 'Map',
        value: Array.from(value.entries()),
      };
    }
    return value;
  };

  worker.postMessage({
    type: 'SET_PLAYER',
    payload: {
      ccJson: JSON.stringify(new DefaultCharacterConfig(), mapReplacer),
      pos: ToFV(610, 100),
    },
  });

  // Write input every 8 ms
  setInterval(() => {
    const input = GetInput(controllerInfo.inputIndex);
    inputWriter.Store(input);
  }, 8);

  ECHO_RENDER_LOOP(writeBackReader, stateBuffer, frameBuffer);
}

function ECHO_RENDER_LOOP(
  writeBackReader: LocalInputBufferReader,
  stateBuffer: Int32Array,
  frameBuffer: Int32Array,
) {
  const canvas = document.getElementById('game') as HTMLCanvasElement;

  // Force canvas resolution to 1080p so the text fits on the screen
  canvas.width = 1920;
  canvas.height = 1080;

  const ctx = canvas.getContext('2d');

  const inputToRender = NewInputAction();
  const stateHist = new PlayerStateHistory();

  RENDERFPS60Loop((timeStamp: number) => {
    writeBackReader.Load(inputToRender);
    const success = stateHist.Deserialize(stateBuffer, 0);
    const currentFrame = Atomics.load(frameBuffer, 0);

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'grey'; // Match original debug renderer
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText(`Action: ${inputToRender.Action}`, 50, 50);
      ctx.fillText(`LXAxis: ${inputToRender.LXAxis.Raw}`, 50, 80);
      ctx.fillText(`LYAxis: ${inputToRender.LYAxis.Raw}`, 50, 110);
      ctx.fillText(`RXAxis: ${inputToRender.RXAxis.Raw}`, 50, 140);
      ctx.fillText(`RYAxis: ${inputToRender.RYAxis.Raw}`, 50, 170);
      ctx.fillText(`LTVal: ${inputToRender.LTVal.Raw}`, 50, 200);
      ctx.fillText(`RTVal: ${inputToRender.RTVal.Raw}`, 50, 230);
      ctx.fillText(`Start: ${inputToRender.Start}`, 50, 260);
      ctx.fillText(`Select: ${inputToRender.Select}`, 50, 290);
      ctx.fillText(`Frame: ${currentFrame}`, 50, 320);

      if (success !== false) {
        debugRenderer(ctx, stateHist, currentFrame);
      }
    }
  });
}

function debugRenderer(
  ctx: CanvasRenderingContext2D,
  state: PlayerStateHistory,
  frame: number,
) {
  const stage = defaultStage();
  drawStage(ctx, stage);
  drawPlatforms(ctx, stage.Platforms);

  drawPlayerState(ctx, state, frame);
}

function drawStage(ctx: CanvasRenderingContext2D, stage: Stage) {
  const stageVerts = stage.StageVerticies.GetVerts();
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

  const lLedge = stage.Ledges.GetLeftLedge();
  const rLedge = stage.Ledges.GetRightLedge();

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

function drawPlatforms(ctx: CanvasRenderingContext2D, plats?: Array<Line>) {
  if (plats === undefined || plats.length === 0) return;

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

function drawPlayerState(
  ctx: CanvasRenderingContext2D,
  state: PlayerStateHistory,
  frame: number,
) {
  const r2n = RawToNumber;

  // Current ECB
  ctx.fillStyle = 'orange';
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(
    r2n(state.comp_ecbDiamond[1].xRaw),
    r2n(state.comp_ecbDiamond[1].yRaw),
  ); // Left
  ctx.lineTo(
    r2n(state.comp_ecbDiamond[2].xRaw),
    r2n(state.comp_ecbDiamond[2].yRaw),
  ); // Top
  ctx.lineTo(
    r2n(state.comp_ecbDiamond[3].xRaw),
    r2n(state.comp_ecbDiamond[3].yRaw),
  ); // Right
  ctx.lineTo(
    r2n(state.comp_ecbDiamond[0].xRaw),
    r2n(state.comp_ecbDiamond[0].yRaw),
  ); // Bottom
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  // Hurtboxes
  const intangible = state.intangabilityFrames > 0;
  ctx.strokeStyle = intangible
    ? frame % 2 === 0
      ? 'lightgray'
      : 'white'
    : 'yellow';
  ctx.fillStyle = intangible
    ? frame % 2 === 0
      ? 'lightgray'
      : 'white'
    : 'yellow';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;
  for (const hc of state.comp_hurtCapsules) {
    if (!hc.active) continue;
    drawCapsule(
      ctx,
      r2n(hc.x1Raw),
      r2n(hc.y1Raw),
      r2n(hc.x2Raw),
      r2n(hc.y2Raw),
      r2n(hc.radiusRaw),
    );
  }
  ctx.globalAlpha = 1.0;

  // Position Marker
  const posX = r2n(state.posXRaw);
  const posY = r2n(state.posYRaw);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'blue';
  ctx.beginPath();
  ctx.moveTo(posX, posY);
  ctx.lineTo(posX + 10, posY);
  ctx.stroke();
  ctx.moveTo(posX, posY);
  ctx.lineTo(posX - 10, posY);
  ctx.stroke();
  ctx.moveTo(posX, posY);
  ctx.lineTo(posX, posY + 10);
  ctx.stroke();
  ctx.moveTo(posX, posY);
  ctx.lineTo(posX, posY - 10);
  ctx.stroke();
  ctx.closePath();

  // Direction Marker
  ctx.strokeStyle = 'white';
  const rightX = r2n(state.comp_ecbDiamond[3].xRaw);
  const leftX = r2n(state.comp_ecbDiamond[1].xRaw);
  const centerY = r2n(state.comp_ecbDiamond[3].yRaw);
  ctx.beginPath();
  if (state.facingRight) {
    ctx.moveTo(rightX, centerY);
    ctx.lineTo(rightX + 10, centerY);
  } else {
    ctx.moveTo(leftX, centerY);
    ctx.lineTo(leftX - 10, centerY);
  }
  ctx.stroke();
  ctx.closePath();

  // Shield
  if (state.shieldActive) {
    ctx.strokeStyle = 'blue';
    ctx.fillStyle = 'blue';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(
      r2n(state.comp_shield.calcXRaw),
      r2n(state.comp_shield.calcYRaw),
      r2n(state.calcRadiusRaw),
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.globalAlpha = 1.0;
  }

  // Ledge Detectors
  ctx.strokeStyle = state.facingRight ? 'blue' : 'red';
  ctx.beginPath();
  const rdl = state.comp_ledgeDetectorRight;
  ctx.moveTo(r2n(rdl[1].xRaw), r2n(rdl[1].yRaw)); // top-left
  ctx.lineTo(r2n(rdl[2].xRaw), r2n(rdl[2].yRaw)); // top-right
  ctx.lineTo(r2n(rdl[3].xRaw), r2n(rdl[3].yRaw)); // bottom-right
  ctx.lineTo(r2n(rdl[0].xRaw), r2n(rdl[0].yRaw)); // bottom-left
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = state.facingRight ? 'red' : 'blue';
  ctx.beginPath();
  const ldl = state.comp_ledgeDetectorLeft;
  ctx.moveTo(r2n(ldl[1].xRaw), r2n(ldl[1].yRaw));
  ctx.lineTo(r2n(ldl[2].xRaw), r2n(ldl[2].yRaw));
  ctx.lineTo(r2n(ldl[3].xRaw), r2n(ldl[3].yRaw));
  ctx.lineTo(r2n(ldl[0].xRaw), r2n(ldl[0].yRaw));
  ctx.closePath();
  ctx.stroke();

  // Sensors
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 0.4;
  for (const s of state.comp_sensors) {
    if (!s.active) continue;
    ctx.beginPath();
    ctx.arc(
      r2n(s.globalXRaw),
      r2n(s.globalYRaw),
      r2n(s.radiusRaw),
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  ctx.globalAlpha = 1.0;

  // Grab Circles
  ctx.strokeStyle = 'purple';
  ctx.fillStyle = 'purple';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  for (const g of state.comp_grabCircles) {
    if (!g.active) continue;
    ctx.beginPath();
    ctx.arc(r2n(g.xRaw), r2n(g.yRaw), r2n(g.radiusRaw), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  ctx.globalAlpha = 1.0;

  // Hit Circles
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'red';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4;
  for (const a of state.comp_attackCircles) {
    if (!a.active) continue;
    ctx.beginPath();
    ctx.arc(r2n(a.xRaw), r2n(a.yRaw), r2n(a.radiusRaw), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
  ctx.globalAlpha = 1.0;
}

function drawCapsule(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const offsetX = Math.sin(angle) * radius;
  const offsetY = -Math.cos(angle) * radius;

  ctx.beginPath();
  ctx.arc(x1, y1, radius, angle + Math.PI / 2, angle - Math.PI / 2, false);
  ctx.lineTo(x2 + offsetX, y2 + offsetY);
  ctx.arc(x2, y2, radius, angle - Math.PI / 2, angle + Math.PI / 2, false);
  ctx.lineTo(x1 - offsetX, y1 - offsetY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
