/**
 * Retrieves a map of connected gamepads, where the key is the gamepad ID and the value is its index.
 *
 * @returns {Map<string, number>|false} A map of gamepad IDs to their indices if gamepads are connected, or `false` if no gamepads are detected.
 */
function GetConnectedGamePads(): Map<string, number> | false {
  const gamePads = navigator.getGamepads();

  let anyGps = false;
  gamePads.forEach((gp: Gamepad | null) => {
    if (gp) {
      anyGps = true;
    }
  });

  if (!anyGps) {
    console.log('no controller detected');
    return false;
  }

  /**
   * A map storing gamepad options with string keys and numeric values.
   *
   * @type {Map<string, number>}
   */
  const gpOptions: Map<string, number> = new Map();

  let i = 0;
  for (const gp of gamePads) {
    i++;
    if (gp) {
      gpOptions.set(`${gp.id} -${i}`, gp.index);
    }
  }

  return gpOptions;
}

/**
 * Populates the controller select list with a list of available controllers
 *
 * @param {string} selectId
 */
export function populateControllerList(selectId: string): void {
  const elem = document.getElementById(selectId) as HTMLSelectElement;

  if (!elem || !(elem instanceof HTMLSelectElement)) {
    console.error(
      `Element with ID '${selectId}' is not a valid <select> element.`
    );
    return;
  }

  elem.innerHTML = '';

  const gamePads = GetConnectedGamePads();

  if (gamePads === false) {
    //Add a default option if no gamepads are detected
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No controllers connected';
    option.selected = true;
    elem.appendChild(option);
    return;
  } else {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No controllers connected';
    option.selected = true;
    elem.appendChild(option);
  }

  // Populate the select element with gamepad options
  gamePads.forEach((index, id) => {
    const option = document.createElement('option');
    option.value = index.toString();
    option.textContent = id;
    elem.appendChild(option);
  });
}

export function InitGamePage(): void {
  console.log('InitGamePage called');
  setUpListeners();
  refreshGamePadList();
}

let gameMode: number = -1;

function setUpListeners(): void {
  console.log('setUpListeners called');
  const modeSelect = document.getElementById(
    'mode-select'
  ) as HTMLSelectElement;
  if (modeSelect) {
    console.log('mode-select found');
    modeSelect.addEventListener('change', (event: Event) => {
      console.log('mode-select change event fired');
      const selectedValue = (event.target as HTMLSelectElement).value;
      const p1Select = document.getElementById(
        'p1-gamepad-select'
      ) as HTMLSelectElement;
      const p2Select = document.getElementById(
        'p2-gamepad-select'
      ) as HTMLSelectElement;
      const refreshButton = document.getElementById(
        'refresh-gamepad-select'
      ) as HTMLButtonElement;

      // Initial state for disabled buttons
      if (p1Select) {
        p1Select.disabled = true;
      }
      if (p2Select) {
        p2Select.disabled = true;
      }
      if (refreshButton) {
        refreshButton.disabled = true;
      }

      if (selectedValue == '1' || selectedValue == '2') {
        if (p1Select) {
          p1Select.disabled = false;
        }
      }
      if (selectedValue == '2') {
        if (p2Select) {
          p2Select.disabled = false;
        }
      }

      if (parseInt(selectedValue) > 0) {
        if (refreshButton) {
          refreshButton.disabled = false;
        }
      }

      gameMode = parseInt(selectedValue);
      updateCanStart();
    });
  } else {
    console.error('mode-select not found!');
  }

  const refreshBtn = document.getElementById(
    'refresh-gamepad-select'
  ) as HTMLButtonElement;
  if (refreshBtn) {
    console.log('refresh-gamepad-select found');
    refreshBtn.addEventListener('click', refreshGamePadList);
  } else {
    console.error('refresh-gamepad-select not found!');
  }

  window.addEventListener('gamepadconnected', (event: GamepadEvent) => {
    console.log('Gamepad connected:', event.gamepad);
    refreshGamePadList();
  });

  const p1Select = document.getElementById(
    'p1-gamepad-select'
  ) as HTMLSelectElement;
  if (p1Select) {
    console.log('p1-gamepad-select found');
    p1Select.addEventListener('change', (event: Event) => {
      updateCanStart();
    });
  } else {
    console.error('p1-gamepad-select not found!');
  }

  const p2Select = document.getElementById(
    'p2-gamepad-select'
  ) as HTMLSelectElement;
  if (p2Select) {
    console.log('p2-gamepad-select found');
    p2Select.addEventListener('change', (event: Event) => {
      updateCanStart();
    });
  } else {
    console.error('p2-gamepad-select not found!');
  }
}

function canStart(): boolean {
  const p1Select = document.getElementById(
    'p1-gamepad-select'
  ) as HTMLSelectElement;
  const p2Select = document.getElementById(
    'p2-gamepad-select'
  ) as HTMLSelectElement;

  if (!p1Select) {
    return false;
  }

  if (gameMode === 1) {
    return p1Select.value !== '';
  }

  if (gameMode === 2) {
    if (!p2Select) {
      return false;
    }
    return p1Select.value !== '' && p2Select.value !== '';
  }

  return false;
}

function updateCanStart() {
  const btn = document.getElementById('start-game') as HTMLButtonElement;
  if (btn) {
    btn.disabled = !canStart();
  }
}

function refreshGamePadList(): void {
  populateControllerList('p1-gamepad-select');
  populateControllerList('p2-gamepad-select');
  updateCanStart();
}
