import {
  InitGrabEscapeRelations,
  InitGrabRelations,
  InitGrabReleaseRelations,
  InitHeldRelations,
  InitHoldRelations,
} from '../../game/engine/finite-state-machine/stateConfigurations/relationshipMappings';
import {
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../../game/engine/finite-state-machine/stateConfigurations/shared';

describe('grab translation tests', () => {
  const grabTranslations = InitGrabRelations();
  const holdTranslations = InitHoldRelations();
  const heldTranslations = InitHeldRelations();
  const grabReleaseTranslations = InitGrabReleaseRelations();
  const grabEscapeTranslations = InitGrabEscapeRelations();
  beforeEach(() => {});

  test('held should be able to trnasition to grab escape', () => {
    const stateId = heldTranslations.mappings.GetMapping(
      GAME_EVENT_IDS.GRAB_ESCAPE_GE
    );
    expect(stateId).toBeDefined();

    expect(stateId).toBe(STATE_IDS.GRAB_ESCAPE_S);
  });
});
