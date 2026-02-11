import { DefaultCharacterConfig } from '../../game/character/default';
import { Player } from '../../game/engine/entity/playerOrchestrator';
import { InputAction, NewInputAction } from '../../game/engine/input/Input';
import { JazzLocal, JazzNetwork } from '../../game/engine/jazz';
import { RollBackManager } from '../../game/engine/managers/rollBack';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { ToFV } from '../../game/engine/utils';
import { World } from '../../game/engine/world/world';

describe('rollback integration testing', () => {
  let nj: JazzNetwork;
  let pl: Player;
  let pr: Player;
  let w: World;
  let rb: RollBackManager;

  let getInput = () => {
    return NewInputAction();
  };
  let sendInput = (ia: InputAction) => {};

  beforeEach(() => {
    nj = new JazzNetwork();
    nj.SetStage(defaultStage());
    nj.SetLocalPlayer(
      new DefaultCharacterConfig(),
      ToFV(600, 650),
      0,
      getInput,
      sendInput,
    );
    nj.SetRemotePlayer(new DefaultCharacterConfig(), ToFV(600, 650), 1);
    nj.init();
    w = nj.World;
    pl = w.PlayerData.Player(0)!;
    pr = w.PlayerData.Player(1)!;
    rb = nj._rollBackManager();
  });

  test('IsWithInFrameAdvantage returns false when local is ahead greater than maxFrameAdvanatge', () => {
    w.LocalFrame = 5;

    const fa = rb.IsWithInFrameAdvantage;

    expect(fa).toBe(false);
  });

  test('IsWithInFrameAdvantage returns false when remote user out of frame advantage range', () => {
    w.LocalFrame = 16;

    rb.SetRemoteInputForFrame(10, 1, NewInputAction());

    const fa = rb.IsWithInFrameAdvantage;

    expect(fa).toBe(false);
  });
});
