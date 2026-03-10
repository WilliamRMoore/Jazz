import { GAME_EVENT_IDS } from '../../game/engine/finite-state-machine/stateConfigurations/shared';
import { NewInputAction } from '../../game/engine/input/Input';
import {
  InputStore,
  RemoteInputManager,
} from '../../game/engine/managers/inputManager';
import { RollBackManager } from '../../game/engine/managers/rollBack';

describe('rollback testing', () => {
  let localFrame = 0;
  let getWorldFrame = () => localFrame;
  let rb: RollBackManager;
  let rim: RemoteInputManager;

  beforeEach(() => {
    rim = new RemoteInputManager(new InputStore());
    rb = new RollBackManager(getWorldFrame, rim);
  });

  test('IsWithInFrameAdvantage returns false when local is ahead greater than maxFrameAdvanatge', () => {
    localFrame = 5;

    const fa = rb.IsWithInFrameAdvantage;

    expect(fa).toBe(false);
  });

  test('IsWithInFrameAdvantage returns false when remote user out of frame advantage range', () => {
    localFrame = 16;

    rb.SetRemoteInputForFrame(10, 1, NewInputAction());

    const fa = rb.IsWithInFrameAdvantage;

    expect(fa).toBe(false);
  });

  test('Updates sync frame correctly', () => {
    const moveInput = NewInputAction();
    moveInput.Action = GAME_EVENT_IDS.MOVE_GE;
    const moveFastInput = NewInputAction();
    moveFastInput.Action = GAME_EVENT_IDS.MOVE_FAST_GE;

    localFrame = 10;
    rb.SetRemoteInputForFrame(10, 1, moveInput);
    rb.UpdateSyncFrame();
    expect(rb.SyncFrame).toBe(10);
    localFrame = 11;
    rb.SetRemoteInputForFrame(11, 1, moveInput);
    rb.UpdateSyncFrame();
    expect(rb.SyncFrame).toBe(11);
    localFrame = 12;
    rb.SetRemoteInputForFrame(12, 1, moveInput);
    localFrame = 13;
    rim.guessedInputStore.set(13, moveInput);
    rb.SetRemoteInputForFrame(13, 1, moveFastInput);
    localFrame = 14;
    rb.SetRemoteInputForFrame(14, 1, moveInput);
    rb.UpdateSyncFrame();
    expect(rb.SyncFrame).toBe(12);
  });
});
