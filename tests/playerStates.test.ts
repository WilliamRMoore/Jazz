import { DefaultCharacterConfig } from '../game/character/default';
import { Player } from '../game/engine/player/playerOrchestrator';
import { World } from '../game/engine/world/world';
import {
  AirDodge,
  GetAtan2IndexRaw,
} from '../game/engine/finite-state-machine/playerStates/states';
import { STATE_IDS } from '../game/engine/finite-state-machine/playerStates/shared';
import { NewInputAction } from '../game/input/Input';
import { MultiplyRaw, NumberToRaw, RawToNumber } from '../game/math/fixedPoint';
import { COS_LUT, SIN_LUT } from '../game/math/LUTS';

describe('Player states tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;
  });

  test('test Air Dodge', () => {
    const inputStore = w.PlayerData.InputStore(p.ID);
    const frame = 10;
    w.localFrame = frame;

    const input = NewInputAction();
    const lx = 0.707;
    const ly = 0.707;
    input.LXAxis.SetFromRaw(NumberToRaw(lx));
    input.LYAxis.SetFromRaw(NumberToRaw(ly));
    inputStore.StoreInputForFrame(frame, input);

    const fsm = w.PlayerData.StateMachine(p.ID);
    fsm.ForceState(STATE_IDS.AIR_DODGE_S);

    const angleIndex = GetAtan2IndexRaw(input.LYAxis.Raw, input.LXAxis.Raw);
    const expectedSpeedRaw = p.Speeds.AirDogeSpeed.Raw;
    const expectedVelXRaw = RawToNumber(
      MultiplyRaw(NumberToRaw(COS_LUT[angleIndex]), expectedSpeedRaw)
    );
    const expectedVelYRaw = RawToNumber(
      MultiplyRaw(NumberToRaw(-SIN_LUT[angleIndex]), expectedSpeedRaw)
    );

    expect(p.Velocity.X.Raw).toBeCloseTo(expectedVelXRaw, -1);
    expect(p.Velocity.Y.Raw).toBeCloseTo(expectedVelYRaw, -1);
    expect(p.Flags.HasNoVelocityDecay()).toBeTruthy();

    const initialVelX = p.Velocity.X.Raw;
    const initialVelY = p.Velocity.Y.Raw;

    fsm.UpdateFromInput(NewInputAction(), w);

    expect(p.Velocity.X.Raw).toBeLessThan(initialVelX);
    expect(p.Velocity.Y.Raw).toBeGreaterThan(initialVelY);

    fsm.UpdateFromInput(NewInputAction(), w);
    expect(p.Flags.GetIntangabilityFrames()).toBe(15);

    // OnExit
    AirDodge.OnExit(p, w);
    expect(p.Flags.HasNoVelocityDecay()).toBeFalsy();
    expect(p.Flags.GetIntangabilityFrames()).toBe(0);
  });
});
