import { InputAction } from '../input/Input';
import { World } from '../world/world';

export type GameLoop = (w: World) => void;

export interface IJazzEngine {
  readonly World: World;
  Tick(): void;
  UpdateInputForCurrentFrame(ia: InputAction, pIndex: number): void;
}
