import { playerControllerInfo, start } from './loops/local-main';
import { InitGamePage } from './ui/game-page';

document.addEventListener('DOMContentLoaded', () => {
  InitGamePage();
});

const p1GamePadSelect = document.getElementById(
  'p1-gamepad-select'
) as HTMLSelectElement;

const p2GamePadSelect = document.getElementById(
  'p2-gamepad-select'
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
});
