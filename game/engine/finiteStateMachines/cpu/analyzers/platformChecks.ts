import { Player } from '../../../entity/playerOrchestrator';
import { World } from '../../../world/world';
import { STATE_IDS } from '../../player/shared';
import { IAstNode } from '../astNode';
import { CPUAction } from '../sequences/shared';

export class Node_IsOffStage implements IAstNode {
  constructor(private childNode: IAstNode) {}

  Evaluate(world: World, player: Player): CPUAction | undefined {
    const stage = world.StageData.Stages[0];
    if (!stage) return undefined;

    const stageLeftRaw = stage.StageVerticies.OriginXRaw;
    const stageRightRaw = stageLeftRaw + stage.StageVerticies.WidthRaw;
    const playerX = player.Position.X.Raw;

    // Check if player is beyond the main stage ledges
    if (playerX < stageLeftRaw || playerX > stageRightRaw) {
      return this.childNode.Evaluate(world, player);
    }

    return undefined;
  }
}

export class Node_IsOnPlatform implements IAstNode {
  constructor(private childNode: IAstNode) {}

  Evaluate(world: World, player: Player): CPUAction | undefined {
    const stage = world.StageData.Stages[0];
    if (!stage) return undefined;

    const playerState = player.FSMInfo.CurrentStateId;
    // Basic ground check for POC
    const isGrounded =
      playerState === STATE_IDS.IDLE_S ||
      playerState === STATE_IDS.WALK_S ||
      playerState === STATE_IDS.DASH_S ||
      playerState === STATE_IDS.RUN_S ||
      playerState === STATE_IDS.CROUCH_S ||
      playerState === STATE_IDS.TURN_S;

    if (!isGrounded) return undefined;

    const mainStageYRaw = stage.StageVerticies.OriginYRaw;
    const playerY = player.Position.Y.Raw;

    // Y grows downwards. If player Y is less than main stage Y (higher up), they are on a platform.
    // We add a tiny buffer (in raw fixed-point) just in case of rounding errors on the main stage.
    if (playerY < mainStageYRaw - 65536) {
      return this.childNode.Evaluate(world, player);
    }

    return undefined;
  }
}

export class Node_ReturnSequence implements IAstNode {
  constructor(private action: CPUAction) {}

  Evaluate(world: World, player: Player): CPUAction | undefined {
    return this.action;
  }
}
