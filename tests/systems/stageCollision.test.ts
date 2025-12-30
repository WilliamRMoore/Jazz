import { DefaultCharacterConfig } from '../../game/character/default';
import { defaultStage } from '../../game/engine/stage/stageMain';
import {
  Player,
  SetPlayerPosition,
} from '../../game/engine/entity/playerOrchestrator';
import { StageCollisionDetection } from '../../game/engine/systems/stageCollision';
import { World } from '../../game/engine/world/world';
import { NewInputAction } from '../../game/input/Input';
import { STATE_IDS } from '../../game/engine/finite-state-machine/stateConfigurations/shared';
import { ApplyVelocity } from '../../game/engine/systems/velocity';
import { NeutralFall } from '../../game/engine/finite-state-machine/stateConfigurations/states';
import { FixedPoint } from '../../game/engine/math/fixedPoint';

describe('Stage Collision system tests', () => {
  let p: Player;
  let w: World;

  beforeEach(() => {
    w = new World();
    w.SetStage(defaultStage());

    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;

    const input = NewInputAction();
    w.PlayerData.InputStore(0).StoreInputForFrame(0, input);
    w.PlayerData.InputStore(0).StoreInputForFrame(1, input);
    p.FSMInfo.SetCurrentState(NeutralFall);
  });

  function applyVelocity() {
    p.ECB.UpdatePreviousECB();
    ApplyVelocity(w);
  }

  test('Player should land on the ground when falling', () => {
    // Stage ground is at y=650
    // NeutralFall ECB: height 70, yOffset -25 -> bottom is at pos.y + 10
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(635)); // bottom at 645
    p.Velocity.Y.SetFromNumber(25);

    applyVelocity(); // pos.y = 660, bottom at 670. Intersects ground.
    StageCollisionDetection(w);

    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LAND_S);
    // Player's bottom should be at the ground level
    expect(p.ECB.Bottom.Y.AsNumber).toBeCloseTo(650, 0);
  });

  test('Player should collide with the left wall', () => {
    // Left wall is at x=500
    // NeutralFall ECB: width 70 -> right is at pos.x + 35
    // yOffset = -25
    // height = 70
    // right most y coord is posy -25 -35
    // right most ECB point coords at pos 495@600
    SetPlayerPosition(p, new FixedPoint(460), new FixedPoint(735));
    p.Velocity.X.SetFromNumber(20); // move to the irght, ECB right most point should be making contact with stage

    applyVelocity(); // pos: 480@735, right most ECB point:530@685,
    StageCollisionDetection(w);

    expect(p.ECB.Right.X.AsNumber).toBeCloseTo(500, 0);
  });

  test('Player should collide with the right wall', () => {
    // Right wall is at x=1600
    // NeutralFall ECB: width 70 -> right is at pos.x + 35
    SetPlayerPosition(p, new FixedPoint(1640), new FixedPoint(735)); // right at 1595
    p.Velocity.X.SetFromNumber(-20);

    applyVelocity(); // pos.x = 1580, right at 1615. Intersects wall.
    StageCollisionDetection(w);

    expect(p.ECB.Left.X.AsNumber).toBeCloseTo(1600, 0);
  });

  test('Player should collide with the ceiling', () => {
    // Ceiling is at y=700
    // NeutralFall ECB: height 70, yOffset -25 -> top is at pos.y - 60
    SetPlayerPosition(p, new FixedPoint(1000), new FixedPoint(765)); // top at 705. Intersects ceiling
    //p.Velocity.Y.SetFromNumber(-20);

    applyVelocity(); // pos.y = 745, top at 685.
    StageCollisionDetection(w);

    // Player should be pushed down
    expect(p.ECB.Top.Y.AsNumber).toBeCloseTo(700, 0);
  });

  test.skip('Player should collide with a bottom-left corner', () => {
    // Corner at 500, 650
    SetPlayerPosition(p, new FixedPoint(540), new FixedPoint(635)); // left at 505, bottom at 645
    p.Velocity.X.SetFromNumber(-20);
    p.Velocity.Y.SetFromNumber(25);

    applyVelocity(); // pos becomes (520, 660). left at 485, bottom at 670
    StageCollisionDetection(w);

    expect(p.ECB.Left.X.AsNumber).toBeGreaterThanOrEqual(500);
    expect(p.ECB.Bottom.Y.AsNumber).toBeCloseTo(650, 0);
    expect(p.FSMInfo.CurrentState.StateId).toBe(STATE_IDS.LAND_S);
  });
});
