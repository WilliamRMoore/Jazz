import { DefaultCharacterConfig } from '../game/character/default';
import { Player } from '../game/engine/entity/playerOrchestrator';
import { World } from '../game/engine/world/world';
import { STATE_IDS } from '../game/engine/finite-state-machine/stateConfigurations/shared';
import { NumberToRaw } from '../game/engine/math/fixedPoint';
import { ECBComponent } from '../game/engine/entity/components/ecb';
import { ToFV } from '../game/engine/utils';

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
    const x = 10;
    const y = 20;
    p.Position.X.SetFromNumber(x);
    p.Position.Y.SetFromNumber(y);
    ecb.Update();

    expect(ecb.Bottom.X.AsNumber).toBe(10);
    expect(ecb.Bottom.Y.AsNumber).toBe(20);

    p.Position.X.SetFromRaw(NumberToRaw(30));
    p.Position.Y.SetFromRaw(NumberToRaw(40));
    ecb.Update();
    expect(ecb.Bottom.X.AsNumber).toBe(30);
    expect(ecb.Bottom.Y.AsNumber).toBe(40);
  });

  test('MoveToPosition and MoveToPositionRaw work correctly', () => {
    const x = 10;
    const y = 20;
    p.Position.X.SetFromNumber(x);
    p.Position.Y.SetFromNumber(y);
    ecb.Update();

    expect(ecb.Bottom.X.AsNumber).toBe(10);
    expect(ecb.Bottom.Y.AsNumber).toBe(20);

    p.Position.X.SetFromRaw(NumberToRaw(30));
    p.Position.Y.SetFromRaw(NumberToRaw(40));
    ecb.Update();
    expect(ecb.Bottom.X.AsNumber).toBe(30);
    expect(ecb.Bottom.Y.AsNumber).toBe(40);
  });

  test('SetECBShape and ResetECBShape work correctly', () => {
    const originalHeight = ecb.Height.AsNumber;
    const originalWidth = ecb.Width.AsNumber;
    const originalYOffset = ecb.YOffset.AsNumber;

    ecb.SetECBShape(STATE_IDS.CROUCH_S);
    const crouchShape = ecb._db_ecbShapes.get(STATE_IDS.CROUCH_S);

    expect(ecb.Height.AsNumber).toBe(crouchShape!.height.AsNumber);
    expect(ecb.Width.AsNumber).toBe(crouchShape!.width.AsNumber);
    expect(ecb.YOffset.AsNumber).toBe(crouchShape!.yOffset.AsNumber);

    ecb.ResetECBShape();
    expect(ecb.Height.AsNumber).toBe(originalHeight);
    expect(ecb.Width.AsNumber).toBe(originalWidth);
    expect(ecb.YOffset.AsNumber).toBe(originalYOffset);
  });

  test('Getters should return correct vertices', () => {
    const x = 10;
    const y = 20;
    const height = ecb.Height.AsNumber;
    const width = ecb.Width.AsNumber;
    const yOffset = ecb.YOffset.AsNumber;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    p.Position.X.SetFromNumber(x);
    p.Position.Y.SetFromNumber(y);
    ecb.Update();

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

import { HurtCapsulesComponent } from '../game/engine/entity/components/hurtCircles';
import { RawToNumber } from '../game/engine/math/fixedPoint';
import { HitBubblesConifg, AttackConfig } from '../game/character/shared';
import { AttackComponment } from '../game/engine/entity/components/attack';
import { ATTACK_IDS } from '../game/engine/finite-state-machine/stateConfigurations/shared';

describe('HurtCapsulesComponent AABB tests', () => {
  test('BuildAABBFromHurtCircles computes correct bounding box', () => {
    const hurtCapsules = [
      { x1: 0, y1: 0, x2: 10, y2: 10, radius: 5 },
      { x1: 20, y1: 20, x2: 20, y2: 30, radius: 10 }
    ];

    const comp = new HurtCapsulesComponent(hurtCapsules);
    const aabb = comp.AABB;

    // Capsule 1:
    // start: 0,0. end: 10,10. radius: 5
    // minX: 0-5 = -5, minY: 0-5 = -5
    // maxX: 10+5 = 15, maxY: 10+5 = 15

    // Capsule 2:
    // start: 20,20. end: 20,30. radius: 10
    // minX: 20-10 = 10, minY: 20-10 = 10
    // maxX: 20+10 = 30, maxY: 30+10 = 40

    // Overall:
    // minX: -5, minY: -5
    // maxX: 30, maxY: 40
    // width: 35, height: 45

    expect(RawToNumber(aabb.minXRaw)).toBeCloseTo(-5, 0);
    expect(RawToNumber(aabb.minYRaw)).toBeCloseTo(-5, 0);
    expect(RawToNumber(aabb.widthRaw)).toBeCloseTo(35, 0);
    expect(RawToNumber(aabb.heightRaw)).toBeCloseTo(45, 0);
  });
});

describe('AttackComponment AABB tests', () => {
  test('BuildAABBFromAttack computes correct bounding box for hit bubbles', () => {
    const bubbles: HitBubblesConifg[] = [
      {
        BubbleId: 0,
        Damage: 10,
        Priority: 1,
        Radius: 5,
        LaunchAngle: 45,
        ThresholdAngle: false,
        frameOffsets: new Map([
          [1, { x: 0, y: 0 }],
          [2, { x: 10, y: 10 }]
        ])
      },
      {
        BubbleId: 1,
        Damage: 10,
        Priority: 2,
        Radius: 10,
        LaunchAngle: 45,
        ThresholdAngle: false,
        frameOffsets: new Map([
          [2, { x: 20, y: 20 }],
          [3, { x: 30, y: 30 }]
        ])
      }
    ];

    const attackConfig: AttackConfig = {
      AttackId: ATTACK_IDS.N_AIR_ATK,
      Name: 'test',
      TotalFrameLength: 10,
      InteruptableFrame: 10,
      GravityActive: true,
      BaseKnockBack: 10,
      KnockBackScaling: 1,
      CanOnlyFallOffLedgeIfFacingAwayFromIt: false,
      HitBubbles: bubbles,
      onEnterCommands: [],
      onUpdateCommands: new Map(),
      onExitCommands: [],
      Impulses: undefined,
      ImpulseClamp: undefined
    };

    const configs = new Map([[ATTACK_IDS.N_AIR_ATK, attackConfig]]);

    // posRef can just be an empty vector for the component init
    const posRef = ToFV(0, 0);
    const comp = new AttackComponment(configs, posRef, () => true);

    const aabb = comp.AABBs.get(ATTACK_IDS.N_AIR_ATK)!;

    // Bubble 0: radius 5, offsets (0,0), (10,10)
    // minX = min(0-5, 10-5) = -5
    // minY = min(0-5, 10-5) = -5
    // maxX = max(0+5, 10+5) = 15
    // maxY = max(0+5, 10+5) = 15

    // Bubble 1: radius 10, offsets (20,20), (30,30)
    // minX = min(20-10, 30-10) = 10
    // minY = min(20-10, 30-10) = 10
    // maxX = max(20+10, 30+10) = 40
    // maxY = max(20+10, 30+10) = 40

    // Overall:
    // minX: -5
    // minY: -5
    // maxX: 40
    // maxY: 40
    // width: 45
    // height: 45

    expect(RawToNumber(aabb.minXRaw)).toBeCloseTo(-5, 0);
    expect(RawToNumber(aabb.minYRaw)).toBeCloseTo(-5, 0);
    expect(RawToNumber(aabb.widthRaw)).toBeCloseTo(45, 0);
    expect(RawToNumber(aabb.heightRaw)).toBeCloseTo(45, 0);
  });
  test('AttackComponent correctly calculates AABB when all hit bubbles are strictly positive', () => {
    const bubbles: HitBubblesConifg[] = [
      {
        BubbleId: 0,
        Damage: 10,
        Priority: 1,
        Radius: 5,
        LaunchAngle: 45,
        ThresholdAngle: false,
        frameOffsets: new Map([
          [1, { x: 50, y: 50 }]
        ])
      }
    ];

    const attackConfig: AttackConfig = {
      AttackId: ATTACK_IDS.N_AIR_ATK,
      Name: 'test_strictly_positive',
      TotalFrameLength: 10,
      InteruptableFrame: 10,
      GravityActive: true,
      BaseKnockBack: 10,
      KnockBackScaling: 1,
      CanOnlyFallOffLedgeIfFacingAwayFromIt: false,
      HitBubbles: bubbles,
      onEnterCommands: [],
      onUpdateCommands: new Map(),
      onExitCommands: [],
      Impulses: undefined,
      ImpulseClamp: undefined
    };

    const configs = new Map([[ATTACK_IDS.N_AIR_ATK, attackConfig]]);
    const posRef = ToFV(0, 0);
    const comp = new AttackComponment(configs, posRef, () => true);

    const aabb = comp.AABBs.get(ATTACK_IDS.N_AIR_ATK)!;

    // Bubble 0: radius 5, offset (50, 50)
    // minX = 50 - 5 = 45
    // minY = 50 - 5 = 45
    // width = 10, height = 10
    expect(RawToNumber(aabb.minXRaw)).toBeCloseTo(45, 0);
    expect(RawToNumber(aabb.minYRaw)).toBeCloseTo(45, 0);
    expect(RawToNumber(aabb.widthRaw)).toBeCloseTo(10, 0);
    expect(RawToNumber(aabb.heightRaw)).toBeCloseTo(10, 0);
  });
});
