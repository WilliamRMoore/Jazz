import { DefaultCharacterConfig } from '../../game/character/default';
import { Player } from '../../game/engine/player/playerOrchestrator';
import { World } from '../../game/engine/world/world';
import { PlayerCollisionDetection } from '../../game/engine/systems/playerCollision';
import { STATE_IDS } from '../../game/engine/finite-state-machine/playerStates/shared';
import { FixedPoint } from '../../game/math/fixedPoint';

describe('Player Collision system tests', () => {
  let p1: Player;
  let p2: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    const pc1 = new DefaultCharacterConfig();
    const player1 = new Player(0, pc1);
    w.SetPlayer(player1);
    p1 = w.PlayerData.Player(0)!;

    const pc2 = new DefaultCharacterConfig();
    const player2 = new Player(1, pc2);
    w.SetPlayer(player2);
    p2 = w.PlayerData.Player(1)!;
  });

  test('Players are moved apart when overlapping', () => {
    p1.ECB.MoveToPosition(new FixedPoint(500), new FixedPoint(500));
    p2.ECB.MoveToPosition(new FixedPoint(500), new FixedPoint(500));
    p1.ECB.UpdatePreviousECB();
    p2.ECB.UpdatePreviousECB();
    
    const p1InitialX = p1.Position.X.AsNumber;
    const p2InitialX = p2.Position.X.AsNumber;

    PlayerCollisionDetection(w.PlayerData, w.Pools);

    expect(p1.Position.X.AsNumber).not.toBe(p1InitialX);
    expect(p2.Position.X.AsNumber).not.toBe(p2InitialX);
    // p1 should be moved to the right, p2 to the left
    expect(p1.Position.X.AsNumber).toBeGreaterThan(p1InitialX);
    expect(p2.Position.X.AsNumber).toBeLessThan(p2InitialX);
  });

  test('Players are not moved when not overlapping', () => {
    p1.ECB.MoveToPosition(new FixedPoint(300), new FixedPoint(500));
    p2.ECB.MoveToPosition(new FixedPoint(700), new FixedPoint(500));
    p1.ECB.UpdatePreviousECB();
    p2.ECB.UpdatePreviousECB();

    const p1InitialX = p1.Position.X.AsNumber;
    const p2InitialX = p2.Position.X.AsNumber;

    PlayerCollisionDetection(w.PlayerData, w.Pools);

    expect(p1.Position.X.AsNumber).toBe(p1InitialX);
    expect(p2.Position.X.AsNumber).toBe(p2InitialX);
  });

  test('Players are not moved if one is in ledge grab state', () => {
    p1.ECB.MoveToPosition(new FixedPoint(500), new FixedPoint(500));
    p2.ECB.MoveToPosition(new FixedPoint(500), new FixedPoint(500));
    p1.ECB.UpdatePreviousECB();
    p2.ECB.UpdatePreviousECB();

    const fsm1 = w.PlayerData.StateMachine(p1.ID);
    fsm1.ForceState(STATE_IDS.LEDGE_GRAB_S);

    const p1InitialX = p1.Position.X.AsNumber;
    const p2InitialX = p2.Position.X.AsNumber;

    PlayerCollisionDetection(w.PlayerData, w.Pools);

    expect(p1.Position.X.AsNumber).toBe(p1InitialX);
    expect(p2.Position.X.AsNumber).toBe(p2InitialX);
  });
});
