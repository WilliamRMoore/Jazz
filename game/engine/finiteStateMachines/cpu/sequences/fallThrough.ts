import { InputAction } from '../../../input/Input';
import { World } from '../../../world/world';
import { GAME_EVENT_IDS } from '../../player/shared';
import { PlayerCPU } from '../playerCPU';
import { CPUAction } from './shared';

export const FallThrough: CPUAction = {
  Name: 'FALL_THROUGH',
  OnEnter: (p: PlayerCPU, w: World) => {},
  OnExit: (p: PlayerCPU, w: World) => {},
  Tick: (frameIndex: number, p: PlayerCPU, w: World, inputOut: InputAction) => {
    // A platform drop usually takes just a few frames of hard down input
    inputOut.Action = GAME_EVENT_IDS.DOWN_GE;
    inputOut.LYAxis.SetFromNumber(-1.0); // Hard down on stick
    inputOut.LXAxis.SetFromNumber(0);

    // Complete the sequence after a few frames to ensure the engine registers the drop
    if (frameIndex > 4) {
      inputOut.Action = GAME_EVENT_IDS.IDLE_GE;
      inputOut.LYAxis.SetFromNumber(0);
      return true;
    }

    return false;
  }
};
