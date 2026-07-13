import { PlayerCPU } from '../playerCPU';
import { World } from '../../../world/world';
import { InputAction } from '../../../input/Input';

export type CPUAction = {
  Name: string;
  OnEnter: (p: PlayerCPU, w: World) => void;
  OnExit: (p: PlayerCPU, w: World) => void;
  // Mutates inputOut to set the stick and buttons. Returns true if sequence is done.
  Tick: (frameIndex: number, p: PlayerCPU, w: World, inputOut: InputAction) => boolean;
};
