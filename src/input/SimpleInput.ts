export const keys = {
  d: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
};

export type KeyInput = {
  action: string;
  inputFrame: number;
  frameAdvantage: number;
};

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'd':
      keys.d.pressed = true;
      break;
    case 'a':
      keys.a.pressed = true;
      break;
    case 'w':
      keys.w.pressed = true;
      break;
    case 's':
      keys.s.pressed = true;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'd':
      keys.d.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
    case 'w':
      keys.w.pressed = false;
      break;
    case 's':
      keys.s.pressed = false;
  }
});
