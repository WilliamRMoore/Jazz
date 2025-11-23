import { DefaultCharacterConfig } from '../../game/character/default';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { Player } from '../../game/engine/player/playerOrchestrator';
import { OutOfBoundsCheck } from '../../game/engine/systems/outOfBounds';
import { World } from '../../game/engine/world/world';
import { STATE_IDS } from '../../game/engine/finite-state-machine/playerStates/shared';
import { NumberToRaw, FixedPoint } from '../../game/math/fixedPoint';

describe('OutOfBounds system tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    const stage = defaultStage();
    w.SetStage(stage);
    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;

    // Set some initial stats that should be reset
    p.Position.X.SetFromNumber(100);
    p.Position.Y.SetFromNumber(100);
    p.Velocity.X.SetFromNumber(10);
    p.Velocity.Y.SetFromNumber(10);
    p.Points.AddMatchPoints(4);
    p.Points.AddDamage(new FixedPoint(50));
    p.Jump.Set(1);
  });

  describe('when out of bounds', () => {
    const testCases = [
      { bound: 'top', x: 500, y: -2000 },
      { bound: 'bottom', x: 500, y: 2000 },
      { bound: 'left', x: -2000, y: 500 },
      { bound: 'right', x: 2100, y: 500 },
    ];

    test.each(testCases)(
      'player is reset when out of $bound bounds',
      ({ x, y }) => {
        p.Position.X.SetFromNumber(x);
        p.Position.Y.SetFromNumber(y);

        OutOfBoundsCheck(w.PlayerData, w.StageData);

        // Check position is reset
        expect(p.Position.X.Raw).toBe(NumberToRaw(610));
        expect(p.Position.Y.Raw).toBe(NumberToRaw(300));

        // Check stats are reset
        expect(p.Velocity.X.Raw).toBe(0);
        expect(p.Velocity.Y.Raw).toBe(0);
        expect(p.Points.Damage.Raw).toBe(0);
        // default is 4, so after 1 subtraction it should be 3
        expect(p.Points.MatchPoints).toBe(3);
        // Jumps are reset and then incremented
        expect(p.Jump.JumpCount).toBe(1);

        // Check state is reset
        expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.N_FALL_S);
      }
    );
  });

  test('player is not reset when within bounds', () => {
    const initialX = p.Position.X.Raw;
    const initialY = p.Position.Y.Raw;
    const initialVelX = p.Velocity.X.Raw;
    const initialVelY = p.Velocity.Y.Raw;
    const initialMatchPoints = p.Points.MatchPoints;
    const initialDamage = p.Points.Damage.Raw;
    const initialJumpCount = p.Jump.JumpCount;
    const initialState = p.FSMInfo.CurrentState.StateId;

    OutOfBoundsCheck(w.PlayerData, w.StageData);

    expect(p.Position.X.Raw).toBe(initialX);
    expect(p.Position.Y.Raw).toBe(initialY);
    expect(p.Velocity.X.Raw).toBe(initialVelX);
    expect(p.Velocity.Y.Raw).toBe(initialVelY);
    expect(p.Points.MatchPoints).toBe(initialMatchPoints);
    expect(p.Points.Damage.Raw).toBe(initialDamage);
    expect(p.Jump.JumpCount).toBe(initialJumpCount);
    expect(p.FSMInfo.CurrentState.StateId).toBe(initialState);
  });
});
