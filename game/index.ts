import { GetInput, NewInputAction } from './engine/input/Input';
import { playerControllerInfo, start } from './loops/local-main';
import { InitGamePage } from './ui/game-page';
import {
  LocalInputBufferReader,
  LocalInputBufferWriter,
} from './workers/workerUtils';
import { RENDER_MONITOR_FRAME_RATE } from './loops/FPS60LoopExecutor';
import { PlayerStateHistory } from './engine/systems/history';
import { DefaultCharacterConfig } from './character/default';
import { ToFV } from './engine/utils';
import { RawToNumber } from './engine/math/fixedPoint';
import { defaultStage, Stage } from './engine/stage/stageMain';
import { Line } from './engine/physics/vector';
import { PlayerLerper, LerpedPlayer } from './render/render-utlis';
import { envConfig } from './engine/config/main-config';
import { GetStateName, GetGrabName, GetAttackName } from './engine/debug/debugUtils';

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

  // Max players = 4, 1 frame each
  const stateSabSize = 4 * 1 * PlayerStateHistory.BufferSize();
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
      inputBuffers: [inputSab],
      writeBackBuffers: [writeBackSab],
      stateBuffers: [stateSab],
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

  window.addEventListener('keyup', (e) => {
    if (e.key === '1') {
      worker.postMessage({ type: 'SPAWN_AND_ATTACK' });
    }
  });

  ECHO_RENDER_LOOP(writeBackReader, stateBuffer, frameBuffer);
}

class HistoryRingBuffer {
  private buffer: (PlayerStateHistory | undefined)[];
  private frames: number[];
  private size: number;

  constructor(size: number) {
    this.size = size;
    this.buffer = new Array(size).fill(undefined);
    this.frames = new Array(size).fill(-1);
  }

  get(frame: number): PlayerStateHistory | undefined {
    if (frame < 0) return undefined;
    const idx = frame % this.size;
    if (this.frames[idx] === frame) {
      return this.buffer[idx];
    }
    return undefined;
  }

  set(
    frame: number,
    stateHist: PlayerStateHistory,
  ): PlayerStateHistory | undefined {
    if (frame < 0) return undefined;
    const idx = frame % this.size;
    const oldHist = this.buffer[idx];
    this.buffer[idx] = stateHist;
    this.frames[idx] = frame;
    return oldHist;
  }
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

  const dbCanvas = document.getElementById('debugInfo') as HTMLCanvasElement;
  dbCanvas.width = 600;
  dbCanvas.height = 1200;
  const dbCtx = dbCanvas.getContext('2d');

  let showDebugInfo = false;
  window.addEventListener('keyup', (e) => {
    if (e.key === 'd') {
      showDebugInfo = !showDebugInfo;
    }
  });

  const ctx = canvas.getContext('2d');

  const inputToRender = NewInputAction();

  const history = [new HistoryRingBuffer(16), new HistoryRingBuffer(16), new HistoryRingBuffer(16), new HistoryRingBuffer(16)];

  const stateHistoryPool: PlayerStateHistory[] = [];
  // Pre-allocate to prevent runtime object creation and GC pauses.
  // We keep ~5 frames per player (10 active), so 20 is safely enough.
  for (let i = 0; i < 20; i++) {
    stateHistoryPool.push(new PlayerStateHistory());
  }

  const playerLerper = new PlayerLerper(envConfig);

  let renderTime = -1;
  let lastTimeStamp = performance.now();
  let timeScale = 1.0;
  const loopRate = 1000 / 60;
  const stage = defaultStage();

  let highestGlobal = -1;

  RENDER_MONITOR_FRAME_RATE((timeStamp: number) => {
    writeBackReader.Load(inputToRender);
    const delta = timeStamp - lastTimeStamp;
    lastTimeStamp = timeStamp;

    const currentFrame = Atomics.load(frameBuffer, 0);

    if (renderTime === -1 && highestGlobal > 2) {
      renderTime = (highestGlobal - 2) * loopRate;
    }

    if (renderTime !== -1 && highestGlobal !== -1) {
      const delayFrames = highestGlobal - renderTime / loopRate;

      // A logic tick jumps the delay forward by exactly 1.0 frame.
      // This deadzone absorbs the step-function entirely without micro-corrections.
      if (delayFrames < 1.2) {
        timeScale -= 0.001; // Too close, slow down gently
      } else if (delayFrames > 2.8) {
        timeScale += 0.001; // Falling behind, speed up gently
      } else {
        // Soft pull towards neutral when inside the deadzone
        timeScale += (1.0 - timeScale) * 0.05;
      }

      // Hard limits to prevent visible slow-mo/fast-forward
      if (timeScale < 0.95) timeScale = 0.95;
      if (timeScale > 1.05) timeScale = 1.05;

      if (delayFrames < -1 || delayFrames > 6) {
        // Lag spike or thread paused, hard snap
        renderTime = (highestGlobal - 2) * loopRate;
        timeScale = 1.0;
      } else {
        renderTime += delta * timeScale;
      }
    }

    let offset = 0;
    const stride =
      PlayerStateHistory.BufferSize() / Int32Array.BYTES_PER_ELEMENT;

    for (let pIdx = 0; pIdx < 4; pIdx++) {
      let stateHist = stateHistoryPool.pop();
      if (!stateHist) {
        stateHist = new PlayerStateHistory(); // Fallback
      }

      // Explicitly zero the object before use to clean up stale data
      stateHist.Zero();

      const success = stateHist.Deserialize(stateBuffer, offset);
      if (success !== false) {
        const decodedFrame = success as number;

        // Update the max global frame tracked in O(1) time
        if (decodedFrame > highestGlobal) {
          highestGlobal = decodedFrame;
        }

        const oldHist = history[pIdx].set(decodedFrame, stateHist);
        if (oldHist && oldHist !== stateHist) {
          stateHistoryPool.push(oldHist);
        }
      } else {
        stateHistoryPool.push(stateHist);
      }
      offset += stride;
    }

    if (ctx && renderTime !== -1) {
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

      let renderFrameFloat = renderTime / loopRate;
      let thenFrame = Math.floor(renderFrameFloat);
      let nowFrame = thenFrame + 1;
      let alpha = renderFrameFloat - thenFrame;

      // Strictly clamp alpha and frames to prevent any erratic geometry extrapolation
      if (alpha > 1.0) alpha = 1.0;
      if (alpha < 0.0) alpha = 0.0;
      if (thenFrame < 0) thenFrame = 0;
      if (nowFrame < 0) nowFrame = 0;

      drawStage(ctx, stage);
      drawPlatforms(ctx, stage.Platforms);

      if (dbCtx && showDebugInfo) {
        dbCtx.fillStyle = 'black';
        dbCtx.fillRect(0, 0, dbCanvas.width, dbCanvas.height);
      }

      playerLerper.Zero();

      let dbX = 10;
      const dbY = 30;

      for (let pIdx = 0; pIdx < 4; pIdx++) {
        const pHist = history[pIdx];

        // Find closest available states for interpolation
        let nowState = pHist.get(nowFrame);
        let thenState = pHist.get(thenFrame);
        let prevState = pHist.get(thenFrame - 1);

        if (!nowState) nowState = thenState || pHist.get(highestGlobal);
        if (!thenState) thenState = nowState || pHist.get(highestGlobal);
        if (!prevState) prevState = thenState;

        if (nowState && thenState && prevState) {
          const lp = playerLerper.Lerp(prevState, thenState, nowState, alpha);
          drawPlayerState(ctx, lp, thenFrame);
        }

        if (nowState && dbCtx && showDebugInfo) {
          PrintPlayerStateHistoryDirect(nowState, dbX, dbY, dbCtx);
          dbX += 200;
        }
      }
    }
  });
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

// TODO: Update to include previous ECB, and interpolated state.
// Reference debug-2d.ts
function drawPlayerState(
  ctx: CanvasRenderingContext2D,
  lp: LerpedPlayer,
  frame: number,
) {
  // Previous ECB
  ctx.fillStyle = 'red';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(lp.PreviousEcb.l.x, lp.PreviousEcb.l.y);
  ctx.lineTo(lp.PreviousEcb.t.x, lp.PreviousEcb.t.y);
  ctx.lineTo(lp.PreviousEcb.r.x, lp.PreviousEcb.r.y);
  ctx.lineTo(lp.PreviousEcb.b.x, lp.PreviousEcb.b.y);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  // Current ECB
  ctx.fillStyle = 'orange';
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(lp.Ecb.l.x, lp.Ecb.l.y); // Left
  ctx.lineTo(lp.Ecb.t.x, lp.Ecb.t.y); // Top
  ctx.lineTo(lp.Ecb.r.x, lp.Ecb.r.y); // Right
  ctx.lineTo(lp.Ecb.b.x, lp.Ecb.b.y); // Bottom
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  // Hurtboxes
  const intangible = lp.Flags.intangible;
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
  for (const hc of lp.HurtBubbles) {
    if (!hc.a) continue;
    drawCapsule(ctx, hc.x1, hc.y1, hc.x2, hc.y2, hc.r);
  }
  ctx.globalAlpha = 1.0;

  // Position Marker
  const posX = lp.Position.X;
  const posY = lp.Position.Y;
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
  const rightX = lp.Ecb.r.x;
  const leftX = lp.Ecb.l.x;
  const centerY = lp.Ecb.r.y;
  ctx.beginPath();
  if (lp.Flags.FacingRight) {
    ctx.moveTo(rightX, centerY);
    ctx.lineTo(rightX + 10, centerY);
  } else {
    ctx.moveTo(leftX, centerY);
    ctx.lineTo(leftX - 10, centerY);
  }
  ctx.stroke();
  ctx.closePath();

  // Shield
  if (lp.Shield.a) {
    ctx.strokeStyle = 'blue';
    ctx.fillStyle = 'blue';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(lp.Shield.X, lp.Shield.Y, lp.Shield.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.globalAlpha = 1.0;
  }

  // Ledge Detectors
  ctx.strokeStyle = lp.Flags.FacingRight ? 'blue' : 'red';
  ctx.beginPath();
  const rdl = lp.LedgeDetectorRight;
  ctx.moveTo(rdl.topLeftX, rdl.topLeftY); // top-left
  ctx.lineTo(rdl.topRightX, rdl.topRightY); // top-right
  ctx.lineTo(rdl.bottomRightX, rdl.bottomRightY); // bottom-right
  ctx.lineTo(rdl.bottomLeftX, rdl.bottomLeftY); // bottom-left
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = lp.Flags.FacingRight ? 'red' : 'blue';
  ctx.beginPath();
  const ldl = lp.LedgeDetectorLeft;
  ctx.moveTo(ldl.topLeftX, ldl.topLeftY);
  ctx.lineTo(ldl.topRightX, ldl.topRightY);
  ctx.lineTo(ldl.bottomRightX, ldl.bottomRightY);
  ctx.lineTo(ldl.bottomLeftX, ldl.bottomLeftY);
  ctx.closePath();
  ctx.stroke();

  // Sensors
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 0.4;
  for (const s of lp.Sensors) {
    if (!s.a) continue;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
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
  for (const g of lp.GrabBubbles) {
    if (!g.a) continue;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
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
  for (const a of lp.AttackBubbles) {
    if (!a.a) continue;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
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

function printDataLine(ctx: CanvasRenderingContext2D, label: string, data: string | number, x: number, y: number) {
  const originalStyle = ctx.fillStyle;
  ctx.fillStyle = '#4bff14'; // Sage green
  ctx.fillText(label, x, y);
  const labelWidth = ctx.measureText(label).width;
  ctx.fillStyle = 'white';
  ctx.fillText(String(data), x + labelWidth + 5, y); // 5px padding
  ctx.fillStyle = originalStyle;
  return y + 13;
}

function printDataHeader(ctx: CanvasRenderingContext2D, label: string, x: number, y: number) {
  const originalStyle = ctx.fillStyle;
  ctx.fillStyle = 'cyan';
  ctx.fillText(label, x, y);
  ctx.fillStyle = originalStyle;
  return y + 13;
}

function PrintPlayerStateHistoryDirect(ps: PlayerStateHistory, x: number, y: number, ctx: CanvasRenderingContext2D) {
  const indent = 13;
  let currY = y;
  ctx.font = '10px Arial';

  currY = printDataHeader(ctx, 'Player State:', x, currY);
  
  currY = printDataHeader(ctx, 'State:', x + indent, currY);
  currY = printDataLine(ctx, 'State Id:', ps.stateId, x + indent * 2, currY);
  currY = printDataLine(ctx, 'Name:', GetStateName(ps.stateId), x + indent * 2, currY);
  currY = printDataLine(ctx, 'Frame:', ps.stateFrame, x + indent * 2, currY);

  currY = printDataHeader(ctx, 'Position:', x + indent, currY);
  currY = printDataLine(ctx, 'X:', RawToNumber(ps.posXRaw), x + indent * 2, currY);
  currY = printDataLine(ctx, 'Y:', RawToNumber(ps.posYRaw), x + indent * 2, currY);

  currY = printDataHeader(ctx, 'Velocity:', x + indent, currY);
  currY = printDataLine(ctx, 'Vx:', RawToNumber(ps.velXRaw), x + indent * 2, currY);
  currY = printDataLine(ctx, 'Vy:', RawToNumber(ps.velYRaw), x + indent * 2, currY);

  currY = printDataLine(ctx, 'Direction:', ps.facingRight ? 'Right' : 'Left', x + indent, currY);

  currY = printDataHeader(ctx, 'ECB:', x + indent, currY);
  currY = printDataHeader(ctx, 'Top:', x + indent * 2, currY);
  currY = printDataLine(ctx, 'X:', RawToNumber(ps.comp_ecbDiamond[2].xRaw), x + indent * 3, currY);
  currY = printDataLine(ctx, 'Y:', RawToNumber(ps.comp_ecbDiamond[2].yRaw), x + indent * 3, currY);
  currY = printDataHeader(ctx, 'Bottom:', x + indent * 2, currY);
  currY = printDataLine(ctx, 'X:', RawToNumber(ps.comp_ecbDiamond[0].xRaw), x + indent * 3, currY);
  currY = printDataLine(ctx, 'Y:', RawToNumber(ps.comp_ecbDiamond[0].yRaw), x + indent * 3, currY);
  currY = printDataHeader(ctx, 'Left:', x + indent * 2, currY);
  currY = printDataLine(ctx, 'X:', RawToNumber(ps.comp_ecbDiamond[1].xRaw), x + indent * 3, currY);
  currY = printDataLine(ctx, 'Y:', RawToNumber(ps.comp_ecbDiamond[1].yRaw), x + indent * 3, currY);
  currY = printDataHeader(ctx, 'Right:', x + indent * 2, currY);
  currY = printDataLine(ctx, 'X:', RawToNumber(ps.comp_ecbDiamond[3].xRaw), x + indent * 3, currY);
  currY = printDataLine(ctx, 'Y:', RawToNumber(ps.comp_ecbDiamond[3].yRaw), x + indent * 3, currY);

  currY = printDataLine(ctx, 'Damage:', RawToNumber(ps.damageRaw), x + indent, currY);

  currY = printDataHeader(ctx, 'HitStun:', x + indent, currY);
  currY = printDataLine(ctx, 'Frame:', ps.hitStunFrames, x + indent * 2, currY);
  currY = printDataLine(ctx, 'Vx:', RawToNumber(ps.hitStunVxRaw), x + indent * 2, currY);
  currY = printDataLine(ctx, 'Vy:', RawToNumber(ps.hitStunVyRaw), x + indent * 2, currY);

  currY = printDataHeader(ctx, 'Flags:', x + indent, currY);
  currY = printDataLine(ctx, 'FastFalling:', ps.fasFalling ? 'T' : 'F', x + indent * 2, currY);
  currY = printDataLine(ctx, 'VelocityDecay:', ps.velocityDecayActive ? 'T' : 'F', x + indent * 2, currY);
  currY = printDataLine(ctx, 'HitPauseFrames:', ps.hitPauseFrames, x + indent * 2, currY);
  currY = printDataLine(ctx, 'IntangabilityFrames:', ps.intangabilityFrames, x + indent * 2, currY);
  currY = printDataLine(ctx, 'PlatFormDetection:', ps.disablePlatformDetectionFrames, x + indent * 2, currY);

  currY = printDataHeader(ctx, 'Jump:', x + indent, currY);
  currY = printDataLine(ctx, 'Count:', ps.jumpCount, x + indent * 2, currY);

  currY = printDataHeader(ctx, 'LedgeDetector:', x + indent, currY);
  currY = printDataLine(ctx, 'LedgeGrabCount:', ps.ldGrabCount, x + indent * 2, currY);

  currY = printDataHeader(ctx, 'Shield:', x + indent, currY);
  currY = printDataLine(ctx, 'CurrentRadius:', RawToNumber(ps.shieldRadiusRaw), x + indent * 2, currY);
  currY = printDataLine(ctx, 'Active:', ps.shieldActive ? 'T' : 'F', x + indent * 2, currY);
  currY = printDataHeader(ctx, 'Tilt:', x + indent * 2, currY);
  currY = printDataLine(ctx, 'X:', RawToNumber(ps.shieldTiltXRaw), x + indent * 3, currY);
  currY = printDataLine(ctx, 'Y:', RawToNumber(ps.shieldTiltYRaw), x + indent * 3, currY);

  currY = printDataHeader(ctx, 'Grab:', x + indent, currY);
  currY = printDataLine(ctx, 'GrabId:', ps.grabId ?? '', x + indent * 2, currY);
  currY = printDataLine(ctx, 'GrabIdName:', ps.grabId === undefined ? '' : GetGrabName(ps.grabId), x + indent * 2, currY);
  currY = printDataLine(ctx, 'GrabConfigName:', ps.grabId === undefined ? '' : GetGrabName(ps.grabId), x + indent * 2, currY);

  currY = printDataHeader(ctx, 'GrabMeter:', x + indent, currY);
  currY = printDataLine(ctx, 'Meter:', RawToNumber(ps.grabMeterRaw), x + indent * 2, currY);
  currY = printDataLine(ctx, 'HoldingPlayerId:', ps.holdingPlayerId ?? '', x + indent * 2, currY);

  currY = printDataHeader(ctx, 'Attack:', x + indent, currY);
  currY = printDataLine(ctx, 'AttackConfigName:', ps.atkId === undefined ? '' : GetAttackName(ps.atkId), x + indent * 2, currY);
  currY = printDataLine(ctx, 'AttackIdName:', ps.atkId === undefined ? '' : GetAttackName(ps.atkId), x + indent * 2, currY);
  currY = printDataLine(ctx, 'Player Ids Hit:', Array.from(ps.playersHit).toString(), x + indent * 2, currY);

  currY = printDataHeader(ctx, 'Sensors:', x + indent, currY);
  const sensorsLength = ps.comp_sensors.length;
  for (let i = 0; i < sensorsLength; i++) {
    const s = ps.comp_sensors[i];
    if (!s.active) continue;
    currY = printDataHeader(ctx, i.toString(), x + indent * 2, currY);
    currY = printDataLine(ctx, 'Radius:', RawToNumber(s.radiusRaw), x + indent * 3, currY);
    currY = printDataLine(ctx, 'X:', RawToNumber(s.globalXRaw), x + indent * 3, currY);
    currY = printDataLine(ctx, 'Y:', RawToNumber(s.globalYRaw), x + indent * 3, currY);
  }
}
