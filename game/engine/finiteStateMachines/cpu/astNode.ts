import { Player } from '../../entity/playerOrchestrator';
import { World } from '../../world/world';
import { CPUAction } from './sequences/shared';

export interface IAstNode {
  // Evaluates the state and returns an action sequence to run, or undefined if this branch fails.
  Evaluate(world: World, player: Player): CPUAction | undefined;
}

export class SelectorNode implements IAstNode {
  constructor(private children: IAstNode[]) {}

  Evaluate(world: World, player: Player): CPUAction | undefined {
    for (let i = 0; i < this.children.length; i++) {
      const result = this.children[i].Evaluate(world, player);
      if (result !== undefined) {
        return result;
      }
    }
    return undefined;
  }
}
