import { DefaultCharacterConfig } from '../../game/character/default';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { Player } from '../../game/engine/player/playerOrchestrator';
import { ApplyVelocityDecay } from '../../game/engine/systems/velocityDecay';
import { World } from '../../game/engine/world/world';
import { FixedPoint, NumberToRaw } from '../../game/math/fixedPoint';

describe('Velocity Decay system tests', () => {
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
  });

  test('Velocity decay is not applied when in hit pause', () => {
    p.Flags.SetHitPauseFrames(10);
    p.Velocity.X.SetFromNumber(10);
    p.Velocity.Y.SetFromNumber(10);
    const initialVelocityX = p.Velocity.X.Raw;
    const initialVelocityY = p.Velocity.Y.Raw;

    ApplyVelocityDecay(w.PlayerData, w.StageData);

    expect(p.Velocity.X.Raw).toBe(initialVelocityX);
    expect(p.Velocity.Y.Raw).toBe(initialVelocityY);
  });

  test('Velocity decay is not applied when inactive', () => {
    p.Flags.VelocityDecayOff();
    p.Velocity.X.SetFromNumber(10);
    p.Velocity.Y.SetFromNumber(10);
    const initialVelocityX = p.Velocity.X.Raw;
    const initialVelocityY = p.Velocity.Y.Raw;

    ApplyVelocityDecay(w.PlayerData, w.StageData);

    expect(p.Velocity.X.Raw).toBe(initialVelocityX);
    expect(p.Velocity.Y.Raw).toBe(initialVelocityY);
  });

  test('Grounded velocity decay for X velocity', () => {
    p.ECB.MoveToPosition(new FixedPoint(500), new FixedPoint(650)); // On ground
    p.Velocity.X.SetFromNumber(10); // Positive X velocity
    const decayAmount = p.Speeds.GroundedVelocityDecay.Raw;

    ApplyVelocityDecay(w.PlayerData, w.StageData);

    expect(p.Velocity.X.Raw).toBe(NumberToRaw(10) - decayAmount);

    p.Velocity.X.SetFromNumber(-10); // Negative X velocity
    ApplyVelocityDecay(w.PlayerData, w.StageData);
    // It will be 10 - decay - decay
    expect(p.Velocity.X.Raw).toBe(NumberToRaw(-10) + decayAmount);
  });

  test('Grounded velocity Y is set to zero if positive', () => {
    p.ECB.MoveToPosition(new FixedPoint(500), new FixedPoint(650)); // On ground
    p.Velocity.Y.SetFromNumber(10); // Positive Y velocity

    ApplyVelocityDecay(w.PlayerData, w.StageData);

    expect(p.Velocity.Y.Raw).toBe(0);
  });

  test('Aerial velocity decay for X velocity', () => {
    p.ECB.MoveToPosition(new FixedPoint(0), new FixedPoint(-100)); // In air
    p.Velocity.X.SetFromNumber(10);
    const decayAmount = p.Speeds.AerialVelocityDecay.Raw;

    ApplyVelocityDecay(w.PlayerData, w.StageData);
    expect(p.Velocity.X.Raw).toBeCloseTo(NumberToRaw(10) - decayAmount);

    p.Velocity.X.SetFromNumber(-10);
    ApplyVelocityDecay(w.PlayerData, w.StageData);
    expect(p.Velocity.X.Raw).toBeCloseTo(NumberToRaw(-10) + decayAmount);
  });

  test('Aerial velocity decay for Y velocity (positive, greater than fall speed)', () => {
    p.ECB.MoveToPosition(new FixedPoint(0), new FixedPoint(-100)); // In air
    p.Velocity.Y.SetFromNumber(NumberToRaw(20)); // Positive Y velocity, greater than default fall speed
    const aerialDecay = p.Speeds.AerialVelocityDecay.Raw;
    const initialVel = p.Velocity.Y.Raw;

    ApplyVelocityDecay(w.PlayerData, w.StageData);

    expect(p.Velocity.Y.Raw).toBeCloseTo(initialVel - aerialDecay);
  });

  test('Aerial velocity decay for Y velocity (negative)', () => {
    p.ECB.MoveToPosition(new FixedPoint(0), new FixedPoint(-100)); // In air
    p.Velocity.Y.SetFromNumber(-10); // Negative Y velocity
    const aerialDecay = p.Speeds.AerialVelocityDecay.Raw;
    const initialVel = p.Velocity.Y.Raw;

    ApplyVelocityDecay(w.PlayerData, w.StageData);

    expect(p.Velocity.Y.Raw).toBeCloseTo(initialVel + aerialDecay);
  });

  test('X velocity is zeroed if it falls below threshold', () => {
    p.ECB.MoveToPosition(new FixedPoint(0), new FixedPoint(-100)); // In air
    p.Velocity.X.SetFromRaw(NumberToRaw(0.1)); // Small X velocity
    ApplyVelocityDecay(w.PlayerData, w.StageData);
    expect(p.Velocity.X.Raw).toBe(0);
  });
});
