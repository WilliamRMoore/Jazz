import { DefaultCharacterConfig } from '../../game/character/default';
import { Player } from '../../game/engine/entity/playerOrchestrator';
import {
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../../game/engine/finite-state-machine/stateConfigurations/shared';
import { InputAction, NewInputAction } from '../../game/engine/input/Input';
import { JazzNetwork } from '../../game/engine/jazz';
import { RollBackManager } from '../../game/engine/managers/rollBack';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { ToFV } from '../../game/engine/utils';
import { World } from '../../game/engine/world/world';

/**
 * Helper function to compare player state snapshots component by component.
 * This provides detailed output on which component has a state mismatch.
 * @param name A descriptive name for the player (e.g., 'Player 1').
 * @param expected The expected player state snapshot (from `player.toJSON()`).
 * @param actual The actual player state snapshot (from `player.toJSON()`).
 */
function comparePlayerStates(name: string, expected: any, actual: any) {
  const components = Object.keys(expected);

  for (const component of components) {
    try {
      expect(actual[component]).toEqual(expected[component]);
    } catch (e) {
      console.error(`\n❌ Mismatch found in ${name}'s component: ${component}`);
      // Re-throw to let Jest print a detailed diff and fail the test.
      throw e;
    }
  }
}

describe('state reset testing', () => {
  let nj: JazzNetwork;
  let pl: Player;
  let pr: Player;
  let w: World;
  let rb: RollBackManager;

  let curInputForLocal: InputAction = NewInputAction();
  let getInput = () => {
    return curInputForLocal;
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

  test('world can reset deterministically', () => {
    const input1 = NewInputAction();
    const input2 = NewInputAction();
    input2.Action = GAME_EVENT_IDS.DOWN_ATTACK_GE;
    input2.RYAxis.SetFromNumber(-1);
    const input3 = NewInputAction();
    input3.Action = GAME_EVENT_IDS.DOWN_ATTACK_GE;
    input3.RYAxis.SetFromNumber(-1);
    const input4 = NewInputAction();
    input4.Action = GAME_EVENT_IDS.DOWN_ATTACK_GE;
    input4.RYAxis.SetFromNumber(-1);
    const input5 = NewInputAction();
    const input6 = NewInputAction();
    const input7 = NewInputAction();
    const input8 = NewInputAction();
    const input9 = NewInputAction();
    const input10 = NewInputAction();
    const input11 = NewInputAction();
    const input12 = NewInputAction();

    const rinput1 = NewInputAction();
    const rinput2 = NewInputAction();
    const rinput3 = NewInputAction();
    const rinput4 = NewInputAction();
    rinput4.Action = GAME_EVENT_IDS.JUMP_GE;
    const rinput5 = NewInputAction();
    const rinput6 = NewInputAction();
    const rinput7 = NewInputAction();
    const rinput8 = NewInputAction();
    const rinput9 = NewInputAction();
    const rinput10 = NewInputAction();
    const rinput11 = NewInputAction();
    const rinput12 = NewInputAction();

    const localInputs = [
      input1,
      input2,
      input3,
      input4,
      input5,
      input6,
      input7,
      input8,
      input9,
      input10,
      input11,
      input12,
    ];
    const remoteInputs = [
      rinput1,
      rinput2,
      rinput3,
      rinput4,
      rinput5,
      rinput6,
      rinput7,
      rinput8,
      rinput9,
      rinput10,
      rinput11,
      rinput12,
    ];

    let p1SnapshotForFrame4: any;
    let p2SnapshotForFrame4: any;
    for (let i = 0; i < 12; i++) {
      curInputForLocal = localInputs[i];
      const RemoteInput = remoteInputs[i];
      nj.AddRemoteInputForFrame(i, 1, RemoteInput);
      nj.Tick();
      if (i === 3) {
        p1SnapshotForFrame4 = pl.ToState();
        p2SnapshotForFrame4 = pr.ToState();
      }
    }

    w.GetComponentHistory(0)?.SetPlayerToFrame(pl, 3);
    w.GetComponentHistory(1)?.SetPlayerToFrame(pr, 3);

    expect(pl.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.DOWN_CHARGE_S);

    const newPLSnapshot = pl.ToState();
    const newPRSnapshot = pr.ToState();

    comparePlayerStates('Player 1', p1SnapshotForFrame4, newPLSnapshot);
    comparePlayerStates('Player 2', p2SnapshotForFrame4, newPRSnapshot);
  });

  test('fuzzing test for state reset', () => {
    const fuzzFrames = 100;
    const resetFrame = Math.floor(fuzzFrames / 2);

    const createRandomInput = (): InputAction => {
      const input = NewInputAction();
      const possibleActions = [
        GAME_EVENT_IDS.IDLE_GE,
        GAME_EVENT_IDS.MOVE_GE,
        GAME_EVENT_IDS.MOVE_FAST_GE,
        GAME_EVENT_IDS.JUMP_GE,
        GAME_EVENT_IDS.ATTACK_GE,
        GAME_EVENT_IDS.SIDE_ATTACK_GE,
        GAME_EVENT_IDS.UP_ATTACK_GE,
        GAME_EVENT_IDS.DOWN_ATTACK_GE,
        GAME_EVENT_IDS.GUARD_GE,
        GAME_EVENT_IDS.GRAB_GE,
        GAME_EVENT_IDS.SPCL_GE,
        GAME_EVENT_IDS.SIDE_SPCL_GE,
        GAME_EVENT_IDS.UP_SPCL_GE,
        GAME_EVENT_IDS.DOWN_SPCL_GE,
      ];

      input.Action =
        possibleActions[Math.floor(Math.random() * possibleActions.length)];

      // Random analog values
      input.LXAxis.SetFromNumber(Math.random() * 2 - 1); // -1 to 1
      input.LYAxis.SetFromNumber(Math.random() * 2 - 1); // -1 to 1
      input.RXAxis.SetFromNumber(Math.random() * 2 - 1); // -1 to 1
      input.RYAxis.SetFromNumber(Math.random() * 2 - 1); // -1 to 1
      input.LTVal.SetFromNumber(Math.random()); // 0 to 1
      input.RTVal.SetFromNumber(Math.random()); // 0 to 1

      return input;
    };

    const localInputs = Array.from({ length: fuzzFrames }, createRandomInput);
    const remoteInputs = Array.from({ length: fuzzFrames }, createRandomInput);

    let p1Snapshot: any;
    let p2Snapshot: any;

    for (let i = 0; i < fuzzFrames; i++) {
      curInputForLocal = localInputs[i];
      nj.AddRemoteInputForFrame(i, 1, remoteInputs[i]);
      nj.Tick();

      if (i === resetFrame) {
        p1Snapshot = pl.ToState();
        p2Snapshot = pr.ToState();
      }
    }

    // Reset to the state at `resetFrame`
    w.GetComponentHistory(0)?.SetPlayerToFrame(pl, resetFrame);
    w.GetComponentHistory(1)?.SetPlayerToFrame(pr, resetFrame);

    const newPLSnapshot = pl.ToState();
    const newPRSnapshot = pr.ToState();

    comparePlayerStates('Player 1 (Fuzz)', p1Snapshot, newPLSnapshot);
    comparePlayerStates('Player 2 (Fuzz)', p2Snapshot, newPRSnapshot);
  });
});
