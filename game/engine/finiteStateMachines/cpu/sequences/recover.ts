import { InputAction } from '../../../input/Input';
import { World } from '../../../world/world';
import { GAME_EVENT_IDS } from '../../player/shared';
import { PlayerCPU } from '../playerCPU';
import { CPUAction } from './shared';

export const Recover: CPUAction = {
  Name: 'RECOVER',
  OnEnter: (p: PlayerCPU, w: World) => {},
  OnExit: (p: PlayerCPU, w: World) => {},
  Tick: (frameIndex: number, p: PlayerCPU, w: World, inputOut: InputAction) => {
    // A basic recovery: Jump, then Up Special towards the stage.
    // Frame 0: Jump towards stage
    // Frame 15: Up Special towards stage

    const playerX = p.Player.Position.X.Raw;
    // Aim toward center stage (X=0)
    const dir = playerX < 0 ? 1.0 : -1.0;

    inputOut.LXAxis.SetFromNumber(dir);

    if (frameIndex === 0) {
      inputOut.Action = GAME_EVENT_IDS.JUMP_GE;
      return false;
    }

    if (frameIndex > 15) {
      inputOut.Action = GAME_EVENT_IDS.UP_SPCL_GE;
      inputOut.LYAxis.SetFromNumber(1.0); // Up
    } else {
      inputOut.Action = GAME_EVENT_IDS.MOVE_GE; // just drift in the air
    }

    // Recovery ends when we hit the ground or ledge.
    // The CPU Controller should abort this if we enter a grounded or grabbed ledge state.
    // For now, let it run for a set time to avoid getting stuck forever.
    if (frameIndex > 90) {
      return true; // end sequence
    }

    return false;
  }
};
