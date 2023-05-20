export const canvas = document.querySelector('canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d')!;
export const gravity = 0.5;
export const timeStep = 1.0 / 60.0;
export let previousTime = 0.0;
export let delta = 0.0;
export let debugMode = true;
