import { DefaultCharacterConfig } from '../../game/character/default';
import {
  Player,
  SetPlayerInitialPositionRaw
} from '../../game/engine/entity/playerOrchestrator';
import { StateMachine } from '../../game/engine/finiteStateMachines/player/PlayerStateMachine';
import {
  GAME_EVENT_IDS,
  STATE_IDS
} from '../../game/engine/finiteStateMachines/player/shared';
import { IInputStore } from '../../game/engine/managers/inputManager';
import { NumberToRaw, RawToNumber } from '../../game/engine/math/fixedPoint';
import { PlayerThrows } from '../../game/engine/systems/throw';
import { World } from '../../game/engine/world/world';
import { NewInputAction } from '../../game/engine/input/Input';

describe('Throws System Tests', () => {
  let w: World;
  let p1: Player;
  let p2: Player;
  let p1Sm: StateMachine;
  let p2Sm: StateMachine;
  let p1InputStore: IInputStore;
  let p2InputStore: IInputStore;

  beforeEach(() => {
    const defaultCharConfig = new DefaultCharacterConfig();
    w = new World();
    p1 = new Player(0, defaultCharConfig);
    p2 = new Player(1, defaultCharConfig);
    w.SetPlayer(p1);
    w.SetPlayer(p2);
    p1Sm = w.PlayerData.StateMachine(0);
    p2Sm = w.PlayerData.StateMachine(1);
    p1InputStore = w.PlayerData.InputStore(0);
    p2InputStore = w.PlayerData.InputStore(1);
  });

  test('Player should transition from hold to UpThrow, launch the enemy, and enemy transitions to idle', () => {
    SetPlayerInitialPositionRaw(p1, NumberToRaw(1000), NumberToRaw(650));
    SetPlayerInitialPositionRaw(p2, NumberToRaw(1050), NumberToRaw(650));

    // Set initial states
    p1Sm.ForceState(STATE_IDS.GRAB_HOLD_S);
    p2Sm.ForceState(STATE_IDS.GRAB_HELD_S);
    p1.Hold.heldPlayerId = p2.ID;
    p2.GrabMeter.SetHoldingPlayerId(p1.ID);

    // Initial input: neutral
    let ia = NewInputAction();
    p1InputStore.StoreInputForFrame(w.LocalFrame, ia);
    p2InputStore.StoreInputForFrame(w.LocalFrame, ia);
    w.LocalFrame++;

    // Input to trigger Up Throw
    ia = NewInputAction();
    ia.LYAxis.SetFromNumber(1); // C-stick up
    p1InputStore.StoreInputForFrame(w.LocalFrame, ia);
    p2InputStore.StoreInputForFrame(w.LocalFrame, ia);

    p1Sm.UpdateFromInput(ia, w);
    expect(p1.FSMInfo.CurrentStateId).toBe(STATE_IDS.UP_THROW_S);

    // Get throw config
    const upThrowConfig = p1.Throw.GetThrowForState(STATE_IDS.UP_THROW_S)!;
    const releaseFrame = upThrowConfig.ReleaseFrame;
    const damage = RawToNumber(upThrowConfig.Damage);

    // Advance to release frame
    while (p1.FSMInfo.CurrentStateFrame < releaseFrame) {
      w.LocalFrame++;
      ia = NewInputAction();
      p1InputStore.StoreInputForFrame(w.LocalFrame, ia);
      p2InputStore.StoreInputForFrame(w.LocalFrame, ia);
      p1Sm.UpdateFromInput(ia, w);
      p2Sm.UpdateFromInput(ia, w);
    }

    // Call PlayerThrows to process the throw release
    PlayerThrows(w);

    // Enemy should be launched
    expect(p2.FSMInfo.CurrentStateId).toBe(STATE_IDS.LAUNCH_S);

    // Check damage
    expect(RawToNumber(p2.Damage.Damage.Raw)).toBe(damage);

    // Check Launch Angle
    expect(RawToNumber(p2.HitStun.VY.Raw)).not.toBe(0);
    expect(RawToNumber(p2.HitStun.VX.Raw)).toBeCloseTo(0, 1); // 90 degree angle should have near 0 X velocity

    const hitStunFrames = p2.HitStun.Frames;
    expect(hitStunFrames).toBeGreaterThan(0);

    // Advance frames to exhaust hitstun
    for (let i = 0; i <= hitStunFrames; i++) {
      w.LocalFrame++;
      ia = NewInputAction();
      p1InputStore.StoreInputForFrame(w.LocalFrame, ia);
      p2InputStore.StoreInputForFrame(w.LocalFrame, ia);
      // Hitstun decreases in LAUNCH_S OnUpdate
      p2Sm.UpdateFromInput(ia, w);
    }

    // After hitstun, should transition to TUMBLE_S
    expect(p2.FSMInfo.CurrentStateId).toBe(STATE_IDS.TUMBLE_S);

    // Trigger a landing event to return to idle
    p2Sm.UpdateFromWorld(GAME_EVENT_IDS.LAND_GE);

    // It should now be in LAND_S
    expect(p2.FSMInfo.CurrentStateId).toBe(STATE_IDS.LAND_S);

    // Advance frames for LAND_S to finish or provide input to go to IDLE_S
    const landFrames = p2.FSMInfo.GetCurrentStateFrameLength()!;
    for (let i = 0; i < landFrames; i++) {
      w.LocalFrame++;
      ia = NewInputAction();
      p2InputStore.StoreInputForFrame(w.LocalFrame, ia);
      p2Sm.UpdateFromInput(ia, w);
    }

    expect(p2.FSMInfo.CurrentStateId).toBe(STATE_IDS.IDLE_S);
  });
});
