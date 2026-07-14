import { InputAction } from '../../../input/Input';
import { World } from '../../../world/world';
import { GAME_EVENT_IDS } from '../../player/shared';
import { stageCenterRaw } from '../analyzers/stage';
import { PlayerCPU } from '../playerCPU';
import { CPUAction } from './shared';

// For this POC, we just move towards the center of the stage, or left/right.
export const GroundPatrol: CPUAction = {
  Name: 'GROUND_PATROL',
  OnEnter: (p: PlayerCPU, w: World) => {},
  OnExit: (p: PlayerCPU, w: World) => {},
  Tick: (frameIndex: number, p: PlayerCPU, w: World, inputOut: InputAction) => {
    inputOut.Action = GAME_EVENT_IDS.MOVE_GE;

    const stage = w.StageData.Stages[0];
    const targetXRaw = stage ? stageCenterRaw(stage) : 0;

    // Simplistic patrol: walk toward center stage
    const playerX = p.Player.Position.X.Raw;
    if (playerX < targetXRaw) {
      inputOut.LXAxis.SetFromNumber(0.8); // walk right
    } else {
      inputOut.LXAxis.SetFromNumber(-0.8); // walk left
    }
    inputOut.LYAxis.SetFromNumber(0);

    return false; // GroundPatrol never "finishes", it just runs until interrupted by the AST
  }
};
