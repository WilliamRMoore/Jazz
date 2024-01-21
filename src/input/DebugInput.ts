export const debugComs = {
  SetStateFrame: {
    trigger: false,
  },
  SetState: {
    trigger: false,
  },
  PauseLoop: {
    trigger: false,
  },
  AdvanceLoop: {
    trigger: false,
  },
  UnPauseLoop: {
    trigger: false,
  },
};

export function AddDebug() {
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'q':
        debugComs.SetStateFrame.trigger = true;
        break;
      case 'w':
        debugComs.SetState.trigger = true;
      default:
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.key) {
      case 'q':
        debugComs.SetStateFrame.trigger = false;
        break;
      case 'w':
        debugComs.SetState.trigger = false;
      default:
        break;
      case 'a':
        debugComs.PauseLoop.trigger = !debugComs.PauseLoop.trigger;
        break;
      case 's':
        debugComs.AdvanceLoop.trigger = !debugComs.AdvanceLoop.trigger;
    }
  });
}
