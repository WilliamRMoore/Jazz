import { DefaultCharacterConfig } from '../game/character/default';
import {
  deBugInfoTree,
  StructurePlayerSnapShotForPrinting,
} from '../game/engine/debug/debugUtils';
import { JazzDebugger } from '../game/engine/debug/jazzDebugWrapper';
import { STATE_IDS } from '../game/engine/finite-state-machine/stateConfigurations/shared';

// Helper to find a node in the tree by its label.
// It performs a depth-first search starting from the given tree node.
function findNode(
  tree: deBugInfoTree,
  label: string,
): deBugInfoTree | undefined {
  if (tree.label === label) {
    return tree;
  }
  if (tree.kind === 2) {
    // 'aVal' node with children
    for (const child of tree.data) {
      const found = findNode(child, label);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

describe('DebugUtils', () => {
  let jazzDebugger: JazzDebugger;

  beforeEach(() => {
    jazzDebugger = new JazzDebugger();
    const charConfig = new DefaultCharacterConfig();
    // Init creates a player with ID 0
    jazzDebugger.Init([charConfig]);
  });

  test('StructurePlayerSnapShotForPrinting should correctly structure player data', () => {
    const pId = 0;
    const playerDebugger = jazzDebugger.playerDebuggers[pId];

    // 1. Set up a known player state using the debugger
    const testPosition = { x: 100, y: -50 };
    const testVelocity = { x: 10, y: -5 };
    const testStateId = STATE_IDS.WALK_S;
    const testStateFrame = 5;
    const testDamage = 12.5;

    playerDebugger.MoveTo(testPosition.x, testPosition.y);
    playerDebugger.VelX = testVelocity.x;
    playerDebugger.VelY = testVelocity.y;
    playerDebugger.ForceState(testStateId);
    playerDebugger.ForceStateFrame(testStateFrame);
    playerDebugger.Player!.Damage._db_set_damage(testDamage);
    playerDebugger.LookRight();

    // 2. Get the snapshot
    const snapshot = playerDebugger.LiveStateData;

    // 3. Structure the snapshot for printing
    const debugTree = StructurePlayerSnapShotForPrinting(snapshot);

    // 4. Assert the structure and values
    expect(debugTree.label).toBe('Player State:');
    expect(debugTree.kind).toBe(2);

    // Check Position
    const positionNode = findNode(debugTree, 'Position:');
    expect(positionNode).toBeDefined();
    const posXNode = findNode(positionNode!, 'X:');
    expect(posXNode?.kind).toBe(1);
    expect(posXNode?.data).toBe(testPosition.x);
    const posYNode = findNode(positionNode!, 'Y:');
    expect(posYNode?.kind).toBe(1);
    expect(posYNode?.data).toBe(testPosition.y);

    // Check Velocity
    const velocityNode = findNode(debugTree, 'Velocity:');
    expect(velocityNode).toBeDefined();
    const velXNode = findNode(velocityNode!, 'Vx:');
    expect(velXNode?.kind).toBe(1);
    expect(velXNode?.data).toBe(testVelocity.x);
    const velYNode = findNode(velocityNode!, 'Vy:');
    expect(velYNode?.kind).toBe(1);
    expect(velYNode?.data).toBe(testVelocity.y);

    // Check State
    const stateNode = findNode(debugTree, 'State:');
    expect(stateNode).toBeDefined();
    const stateIdNode = findNode(stateNode!, 'State Id:');
    expect(stateIdNode?.data).toBe(testStateId);
    const stateNameNode = findNode(stateNode!, 'Name:');
    expect(stateNameNode?.data).toBe('WALK_S');
    const frameNode = findNode(stateNode!, 'Frame:');
    expect(frameNode?.data).toBe(testStateFrame);

    // Check Direction
    const directionNode = findNode(debugTree, 'Direction:');
    expect(directionNode?.kind).toBe(1);
    expect(directionNode?.data).toBe('Right');

    // Check Damage
    const damageNode = findNode(debugTree, 'Damage:');
    expect(damageNode?.kind).toBe(1);
    expect(damageNode?.data).toBe(testDamage);

    // Check ECB (and the bug fix)
    const ecbNode = findNode(debugTree, 'ECB:');
    expect(ecbNode).toBeDefined();
    const ecbBottomNode = findNode(ecbNode!, 'Bottom:');
    expect(ecbBottomNode).toBeDefined();
    const ecbBottomYNode = findNode(ecbBottomNode!, 'Y:');
    expect(ecbBottomYNode).toBeDefined();

    const expectedEcbBottomY =
      snapshot.Ecb.posY + snapshot.Ecb.ecbShape.yOffset.AsNumber;
    expect(ecbBottomYNode!.data).toBe(expectedEcbBottomY);
  });
});
