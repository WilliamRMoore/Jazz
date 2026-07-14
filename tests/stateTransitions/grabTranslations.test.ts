import { ActionMappings } from '../../game/engine/finiteStateMachines/player/PlayerStateCollections';
import {
  GAME_EVENT_IDS,
  STATE_IDS
} from '../../game/engine/finiteStateMachines/player/shared';

describe('grab translation tests', () => {
  const heldTranslations = ActionMappings.get(STATE_IDS.GRAB_HELD_S);
  
  beforeEach(() => {});

  test('held should be able to trnasition to grab escape', () => {
    const stateId = heldTranslations?.GetMapping(
      GAME_EVENT_IDS.GRAB_ESCAPE_GE
    );
    expect(stateId).toBeDefined();

    expect(stateId).toBe(STATE_IDS.GRAB_ESCAPE_S);
  });
});
