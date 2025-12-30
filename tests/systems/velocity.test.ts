import { DefaultCharacterConfig } from '../../game/character/default';
import { Player } from '../../game/engine/entity/playerOrchestrator';
import { ApplyVelocity } from '../../game/engine/systems/velocity';
import { World } from '../../game/engine/world/world';

describe('Velocity system tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;
  });

  test('Velocity is applied to player position', () => {
    // Set initial position and velocity
    p.Position.X.SetFromNumber(10);
    p.Position.Y.SetFromNumber(20);
    p.Velocity.X.SetFromNumber(5);
    p.Velocity.Y.SetFromNumber(-5);

    const initialPositionX = p.Position.X.AsNumber;
    const initialPositionY = p.Position.Y.AsNumber;

    ApplyVelocity(w);

    const expectedX = initialPositionX + p.Velocity.X.AsNumber;
    const expectedY = initialPositionY + p.Velocity.Y.AsNumber;

    expect(p.Position.X.AsNumber).toBeCloseTo(expectedX);
    expect(p.Position.Y.AsNumber).toBeCloseTo(expectedY);
  });

  test('Velocity is not applied when player is in hit pause', () => {
    // Set initial position and velocity
    p.Position.X.SetFromNumber(10);
    p.Position.Y.SetFromNumber(20);
    p.Velocity.X.SetFromNumber(5);
    p.Velocity.Y.SetFromNumber(-5);
    p.Flags.SetHitPauseFrames(5);

    const initialPositionX = p.Position.X.AsNumber;
    const initialPositionY = p.Position.Y.AsNumber;

    ApplyVelocity(w);

    expect(p.Position.X.AsNumber).toBe(initialPositionX);
    expect(p.Position.Y.AsNumber).toBe(initialPositionY);
  });
});
