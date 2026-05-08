import { GetInput, NewInputAction } from './engine/input/Input';
import { playerControllerInfo, start } from './loops/local-main';
import { InitGamePage } from './ui/game-page';
import {
  LocalInputBufferReader,
  LocalInputBufferWriter,
} from './workers/workerUtils';
import { RENDERFPS60Loop } from './loops/FPS60LoopExecutor';

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

  const inputBuffer = new Int32Array(inputSab);
  const writeBackBuffer = new Int32Array(writeBackSab);

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
    },
  });

  // Write input every 8 ms
  setInterval(() => {
    const input = GetInput(controllerInfo.inputIndex);
    inputWriter.Store(input);
  }, 8);

  ECHO_RENDER_LOOP(writeBackReader);
}

function ECHO_RENDER_LOOP(writeBackReader: LocalInputBufferReader) {
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  const inputToRender = NewInputAction();

  RENDERFPS60Loop((timeStamp: number) => {
    writeBackReader.Load(inputToRender);

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
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
    }
  });
}
