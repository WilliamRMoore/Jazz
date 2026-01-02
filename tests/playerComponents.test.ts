import { DefaultCharacterConfig } from '../game/character/default';
import { Player } from '../game/engine/entity/playerOrchestrator';
import { World } from '../game/engine/world/world';
import { STATE_IDS } from '../game/engine/finite-state-machine/stateConfigurations/shared';
import { FixedPoint, NumberToRaw } from '../game/engine/math/fixedPoint';
import { ECBComponent } from '../game/engine/entity/components/ecb';

describe('PlayerComponents ECB tests', () => {
  let p: Player;
  let w: World;
  let ecb: ECBComponent;

  beforeEach(() => {
    w = new World();
    const pc = new DefaultCharacterConfig();
    const player = new Player(0, pc);
    w.SetPlayer(player);
    p = w.PlayerData.Player(0)!;
    ecb = p.ECB;
  });

  test('ECB is correctly initialized', () => {
    expect(ecb.Height.AsNumber).toBe(100);
    expect(ecb.Width.AsNumber).toBe(100);
    expect(ecb.YOffset.AsNumber).toBe(0);

    const halfWidth = 50;
    const height = 100;

    // test initial position which is 0,0
    expect(ecb.Bottom.X.AsNumber).toBe(0);
    expect(ecb.Bottom.Y.AsNumber).toBe(0);

    expect(ecb.Top.X.AsNumber).toBe(0);
    expect(ecb.Top.Y.AsNumber).toBe(-height);

    expect(ecb.Left.X.AsNumber).toBe(-halfWidth);
    expect(ecb.Left.Y.AsNumber).toBe(-height / 2);

    expect(ecb.Right.X.AsNumber).toBe(halfWidth);
    expect(ecb.Right.Y.AsNumber).toBe(-height / 2);
  });

  test('SetInitialPosition and SetInitialPositionRaw work correctly', () => {
    const x = new FixedPoint(10);
    const y = new FixedPoint(20);
    ecb.SetInitialPosition(x, y);

    expect(ecb.Bottom.X.AsNumber).toBe(10);
    expect(ecb.Bottom.Y.AsNumber).toBe(20);

    ecb.SetInitialPositionRaw(NumberToRaw(30), NumberToRaw(40));
    expect(ecb.Bottom.X.AsNumber).toBe(30);
    expect(ecb.Bottom.Y.AsNumber).toBe(40);
  });

  test('MoveToPosition and MoveToPositionRaw work correctly', () => {
    const x = new FixedPoint(10);
    const y = new FixedPoint(20);
    ecb.MoveToPosition(x, y);

    expect(ecb.Bottom.X.AsNumber).toBe(10);
    expect(ecb.Bottom.Y.AsNumber).toBe(20);

    ecb.MoveToPositionRaw(NumberToRaw(30), NumberToRaw(40));
    expect(ecb.Bottom.X.AsNumber).toBe(30);
    expect(ecb.Bottom.Y.AsNumber).toBe(40);
  });

  test('SetECBShape and ResetECBShape work correctly', () => {
    const originalHeight = ecb.Height.AsNumber;
    const originalWidth = ecb.Width.AsNumber;
    const originalYOffset = ecb.YOffset.AsNumber;

    ecb.SetECBShape(STATE_IDS.CROUCH_S);
    const crouchShape = ecb._ecbShapes.get(STATE_IDS.CROUCH_S);

    expect(ecb.Height.AsNumber).toBe(crouchShape!.height.AsNumber);
    expect(ecb.Width.AsNumber).toBe(crouchShape!.width.AsNumber);
    expect(ecb.YOffset.AsNumber).toBe(crouchShape!.yOffset.AsNumber);

    ecb.ResetECBShape();
    expect(ecb.Height.AsNumber).toBe(originalHeight);
    expect(ecb.Width.AsNumber).toBe(originalWidth);
    expect(ecb.YOffset.AsNumber).toBe(originalYOffset);
  });

  test('SnapShot and SetFromSnapShot work correctly', () => {
    const x = 10;
    const y = 20;
    ecb.MoveToPositionRaw(NumberToRaw(x), NumberToRaw(y));
    ecb.SetECBShape(STATE_IDS.CROUCH_S);

    const snapshot = ecb.SnapShot();

    const newEcb = new ECBComponent(new Map(), 200, 200, 10);
    newEcb.SetFromSnapShot(snapshot);

    expect(newEcb.Height.AsNumber).toBe(snapshot.ecbShape.height.AsNumber);
    expect(newEcb.Width.AsNumber).toBe(snapshot.ecbShape.width.AsNumber);
    expect(newEcb.YOffset.AsNumber).toBe(snapshot.ecbShape.yOffset.AsNumber);
    expect(newEcb.Bottom.X.AsNumber).toBe(snapshot.posX);
    expect(newEcb.Bottom.Y.AsNumber).toBe(
      snapshot.posY + snapshot.ecbShape.yOffset.AsNumber
    );
  });

  test('Getters should return correct vertices', () => {
    const x = 10;
    const y = 20;
    const height = ecb.Height.AsNumber;
    const width = ecb.Width.AsNumber;
    const yOffset = ecb.YOffset.AsNumber;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    ecb.MoveToPositionRaw(NumberToRaw(x), NumberToRaw(y));

    expect(ecb.Bottom.X.AsNumber).toBe(x);
    expect(ecb.Bottom.Y.AsNumber).toBe(y + yOffset);

    expect(ecb.Top.X.AsNumber).toBe(x);
    expect(ecb.Top.Y.AsNumber).toBe(y + yOffset - height);

    expect(ecb.Left.X.AsNumber).toBe(x - halfWidth);
    expect(ecb.Left.Y.AsNumber).toBe(y + yOffset - halfHeight);

    expect(ecb.Right.X.AsNumber).toBe(x + halfWidth);
    expect(ecb.Right.Y.AsNumber).toBe(y + yOffset - halfHeight);
  });

  // test('GetHull and GetActiveVerts return correct vertices', () => {
  //   const activeVerts = ecb.GetActiveVerts();
  //   expect(activeVerts.length).toBe(4);
  //   expect(activeVerts[0]).toBe(ecb.Bottom);
  //   expect(activeVerts[1]).toBe(ecb.Left);
  //   expect(activeVerts[2]).toBe(ecb.Top);
  //   expect(activeVerts[3]).toBe(ecb.Right);

  //   ecb.MoveToPositionRaw(NumberToRaw(10), NumberToRaw(10));

  //   const hull = ecb.GetHull();
  //   // with no movement, hull should be same as active verts
  //   expect(hull.length).toBe(4);
  // });
});
