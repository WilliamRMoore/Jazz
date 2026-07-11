import { GetAttackAABBHull, GetHurtCirclesAABBHull } from '../../game/engine/systems/shared/AABBHelper';
import { World } from '../../game/engine/world/world';
import { Player, SetPlayerInitialPositionRaw } from '../../game/engine/entity/playerOrchestrator';
import { DefaultCharacterConfig } from '../../game/character/default';
import { RecordIntoHistory } from '../../game/engine/systems/history';
import { defaultStage } from '../../game/engine/stage/stageMain';
import { Pool } from '../../game/engine/pools/Pool';
import { PooledVector } from '../../game/engine/pools/PooledVector';
import { AABBDTO } from '../../game/engine/pools/AABBDTO';
import { AABB } from '../../game/engine/entity/components/shared/AABB';
import { NumberToRaw, RawToNumber } from '../../game/engine/math/fixedPoint';

describe('AABBHelper getAttackAABBHull tests', () => {
  let vecPool: Pool<PooledVector>;
  let aabbPool: Pool<AABBDTO>;

  beforeEach(() => {
    vecPool = new Pool<PooledVector>(10, () => new PooledVector());
    aabbPool = new Pool<AABBDTO>(10, () => new AABBDTO());
  });

  test('facing right to facing right', () => {
    const prevPos = vecPool.Rent().SetXYRaw(NumberToRaw(10), NumberToRaw(20));
    const curPos = vecPool.Rent().SetXYRaw(NumberToRaw(15), NumberToRaw(25));

    const prevAABB: AABB = {
      minXRaw: NumberToRaw(-2),
      minYRaw: NumberToRaw(-3),
      widthRaw: NumberToRaw(10),
      heightRaw: NumberToRaw(10)
    };

    const curAABB: AABB = {
      minXRaw: NumberToRaw(-1),
      minYRaw: NumberToRaw(-2),
      widthRaw: NumberToRaw(8),
      heightRaw: NumberToRaw(8)
    };

    const hull = GetAttackAABBHull(
      true,
      true,
      prevPos,
      curPos,
      prevAABB,
      curAABB,
      aabbPool
    );

    // Prev:
    // minX = 10 + (-2) = 8
    // minY = 20 + (-3) = 17
    // maxX = 10 + (-2) + 10 = 18
    // maxY = 20 + (-3) + 10 = 27

    // Cur:
    // minX = 15 + (-1) = 14
    // minY = 25 + (-2) = 23
    // maxX = 15 + (-1) + 8 = 22
    // maxY = 25 + (-2) + 8 = 31

    // Hull:
    // minX = min(8, 14) = 8
    // minY = min(17, 23) = 17
    // maxX = max(18, 22) = 22
    // maxY = max(27, 31) = 31
    // width = 22 - 8 = 14
    // height = 31 - 17 = 14

    expect(RawToNumber(hull.minX.Raw)).toBe(8);
    expect(RawToNumber(hull.minY.Raw)).toBe(17);
    expect(RawToNumber(hull.width.Raw)).toBe(14);
    expect(RawToNumber(hull.height.Raw)).toBe(14);
  });

  test('facing left to facing left', () => {
    const prevPos = vecPool.Rent().SetXYRaw(NumberToRaw(10), NumberToRaw(20));
    const curPos = vecPool.Rent().SetXYRaw(NumberToRaw(15), NumberToRaw(25));

    // Note: the local AABB is defined as if facing right. The function mirrors it when facing left.
    const prevAABB: AABB = {
      minXRaw: NumberToRaw(-2),
      minYRaw: NumberToRaw(-3),
      widthRaw: NumberToRaw(10),
      heightRaw: NumberToRaw(10)
    };

    const curAABB: AABB = {
      minXRaw: NumberToRaw(-1),
      minYRaw: NumberToRaw(-2),
      widthRaw: NumberToRaw(8),
      heightRaw: NumberToRaw(8)
    };

    const hull = GetAttackAABBHull(
      false,
      false,
      prevPos,
      curPos,
      prevAABB,
      curAABB,
      aabbPool
    );

    // Prev (Mirrored):
    // The range [-2, 8] becomes [-8, 2]
    // minX = 10 + (-8) = 2
    // minY = 20 + (-3) = 17
    // maxX = 10 + 2 = 12
    // maxY = 20 + (-3) + 10 = 27

    // Cur (Mirrored):
    // The range [-1, 7] becomes [-7, 1]
    // minX = 15 + (-7) = 8
    // minY = 25 + (-2) = 23
    // maxX = 15 + 1 = 16
    // maxY = 25 + (-2) + 8 = 31

    // Hull:
    // minX = min(2, 8) = 2
    // minY = min(17, 23) = 17
    // maxX = max(12, 16) = 16
    // maxY = max(27, 31) = 31
    // width = 16 - 2 = 14
    // height = 31 - 17 = 14

    expect(RawToNumber(hull.minX.Raw)).toBe(2);
    expect(RawToNumber(hull.minY.Raw)).toBe(17);
    expect(RawToNumber(hull.width.Raw)).toBe(14);
    expect(RawToNumber(hull.height.Raw)).toBe(14);
  });

  test('facing right to facing left (turn around case)', () => {
    const prevPos = vecPool.Rent().SetXYRaw(NumberToRaw(10), NumberToRaw(20));
    const curPos = vecPool.Rent().SetXYRaw(NumberToRaw(15), NumberToRaw(25));

    const prevAABB: AABB = {
      minXRaw: NumberToRaw(0),
      minYRaw: NumberToRaw(0),
      widthRaw: NumberToRaw(10),
      heightRaw: NumberToRaw(10)
    };

    const curAABB: AABB = {
      minXRaw: NumberToRaw(0),
      minYRaw: NumberToRaw(0),
      widthRaw: NumberToRaw(10),
      heightRaw: NumberToRaw(10)
    };

    const hull = GetAttackAABBHull(
      false,
      true,
      prevPos,
      curPos,
      prevAABB,
      curAABB,
      aabbPool
    );

    // Prev (Facing Right):
    // minX = 10 + 0 = 10
    // minY = 20 + 0 = 20
    // maxX = 10 + 10 = 20
    // maxY = 20 + 10 = 30

    // Cur (Facing Left):
    // range [0, 10] becomes [-10, 0]
    // minX = 15 + (-10) = 5
    // minY = 25 + 0 = 25
    // maxX = 15 + 0 = 15
    // maxY = 25 + 10 = 35

    // Hull:
    // minX = min(10, 5) = 5
    // minY = min(20, 25) = 20
    // maxX = max(20, 15) = 20
    // maxY = max(30, 35) = 35
    // width = 20 - 5 = 15
    // height = 35 - 20 = 15

    expect(RawToNumber(hull.minX.Raw)).toBe(5);
    expect(RawToNumber(hull.minY.Raw)).toBe(20);
    expect(RawToNumber(hull.width.Raw)).toBe(15);
    expect(RawToNumber(hull.height.Raw)).toBe(15);
  });
});

describe('GetHurtCirclesAABBHull tests', () => {
  let w: World;
  let p: Player;

  beforeEach(() => {
    w = new World();
    w.SetStage(defaultStage());
    const pc = new DefaultCharacterConfig();
    p = new Player(0, pc);
    w.SetPlayer(p);
  });

  test('creates hull containing both current and previous AABB', () => {
    p.Flags.FaceRight();
    SetPlayerInitialPositionRaw(p, NumberToRaw(100), NumberToRaw(200));

    // mock AABB on HurtCircles
    p.HurtCircles.AABB.minXRaw = NumberToRaw(-10);
    p.HurtCircles.AABB.minYRaw = NumberToRaw(-10);
    p.HurtCircles.AABB.widthRaw = NumberToRaw(20);
    p.HurtCircles.AABB.heightRaw = NumberToRaw(20);

    RecordIntoHistory(p, w.HistoryData.PlayerHistoryDB[p.ID].get(0));

    // Move player for next frame
    w.LocalFrame = 1;
    p.Position.X.SetFromNumber(150);
    p.Position.Y.SetFromNumber(250);

    const hull = GetHurtCirclesAABBHull(p, w);

    // Prev:
    // minX = 100 - 10 = 90
    // minY = 200 - 10 = 190
    // maxX = 100 + 10 = 110
    // maxY = 200 + 10 = 210

    // Cur:
    // minX = 150 - 10 = 140
    // minY = 250 - 10 = 240
    // maxX = 150 + 10 = 160
    // maxY = 250 + 10 = 260

    // Hull:
    // minX = 90
    // minY = 190
    // maxX = 160
    // maxY = 260
    // width = 70
    // height = 70

    expect(RawToNumber(hull.minX.Raw)).toBe(90);
    expect(RawToNumber(hull.minY.Raw)).toBe(190);
    expect(RawToNumber(hull.width.Raw)).toBe(70);
    expect(RawToNumber(hull.height.Raw)).toBe(70);
  });
});

