import { DefaultCharacterConfig } from '../../game/character/default';
import { Player } from '../../game/engine/entity/playerOrchestrator';
import { NumberToRaw } from '../../game/engine/math/fixedPoint';
import { RecordHistory } from '../../game/engine/systems/history';
import { World } from '../../game/engine/world/world';

describe('History System Tests', () => {
  let w: World;
  let p: Player;

  beforeEach(() => {
    w = new World();
    const pc = new DefaultCharacterConfig();
    p = new Player(0, pc);
    w.SetPlayer(p);
  });

  test('RecordHistory2 records basic fields correctly', () => {
    const frame = 10;
    w.LocalFrame = frame;
    p.Position.X.SetFromNumber(100);
    p.Position.Y.SetFromNumber(200);
    p.Velocity.X.SetFromNumber(5);
    p.Velocity.Y.SetFromNumber(-5);
    p.Flags.FaceLeft();
    p.Damage.Damage.SetFromNumber(50);

    RecordHistory(w);

    const historyDB = w.HistoryData.PlayerHistoryDB[0];
    const record = historyDB.get(frame);

    expect(record.posXRaw).toBe(NumberToRaw(100));
    expect(record.posYRaw).toBe(NumberToRaw(200));
    expect(record.velXRaw).toBe(NumberToRaw(5));
    expect(record.velYRaw).toBe(NumberToRaw(-5));
    expect(record.facingRight).toBe(false);
    expect(record.damageRaw).toBe(NumberToRaw(50));
  });

  test('RecordHistory2 computes attack circles correctly', () => {
    const frame = 20;
    w.LocalFrame = frame;
    p.Position.X.SetFromNumber(300);
    p.Position.Y.SetFromNumber(400);
    p.Flags.FaceRight();

    const mockAttack = {
      AttackId: 'MOCK_ATTACK',
      HitBubbles: [
        {
          IsActive: () => true,
          Radius: { Raw: NumberToRaw(10) },
          frameOffsets: {
            get: () => ({
              X: { Raw: NumberToRaw(20) },
              Y: { Raw: NumberToRaw(-30) },
            }),
          },
        },
      ],
    };

    jest.spyOn(p.Attacks, 'GetAttack').mockReturnValue(mockAttack as any);
    (p.FSMInfo as any)._db_currentStateFrame = 5;

    RecordHistory(w);

    const record = w.HistoryData.PlayerHistoryDB[0].get(frame);
    expect(record.atkId).toBe('MOCK_ATTACK');

    const circle = record.comp_attackCircles[0];
    expect(circle.active).toBe(true);
    // x = pos.x + offset.x (facing right)
    // 300 + 20 = 320
    expect(circle.xRaw).toBe(NumberToRaw(320));
    // y = pos.y + offset.y
    // 400 + (-30) = 370
    expect(circle.yRaw).toBe(NumberToRaw(370));
    expect(circle.radiusRaw).toBe(NumberToRaw(10));
  });

  test('RecordHistory2 computes grab circles correctly', () => {
    const frame = 30;
    w.LocalFrame = frame;
    p.Position.X.SetFromNumber(500);
    p.Position.Y.SetFromNumber(600);
    p.Flags.FaceLeft();

    const mockGrab = {
      GrabId: 'MOCK_GRAB',
      GrabBubbles: [
        {
          BubbleId: 1,
          IsActive: () => true,
          Radius: { Raw: NumberToRaw(15) },
          GetLocalPositionOffsetForFrame: () => ({
            X: { Raw: NumberToRaw(25) },
            Y: { Raw: NumberToRaw(35) },
          }),
        },
      ],
    };

    jest.spyOn(p.Grabs, 'GetGrab').mockReturnValue(mockGrab as any);
    (p.FSMInfo as any)._db_currentStateFrame = 5;

    RecordHistory(w);

    const record = w.HistoryData.PlayerHistoryDB[0].get(frame);
    expect(record.grabId).toBe('MOCK_GRAB');

    const circle = record.comp_grabCircles[0];
    expect(circle.active).toBe(true);
    // x = pos.x - offset.x (facing left)
    // 500 - 25 = 475
    expect(circle.xRaw).toBe(NumberToRaw(475));
    // y = pos.y + offset.y
    // 600 + 35 = 635
    expect(circle.yRaw).toBe(NumberToRaw(635));
    expect(circle.radiusRaw).toBe(NumberToRaw(15));
  });

  test('RecordHistory2 computes ECB correctly', () => {
    const frame = 40;
    w.LocalFrame = frame;
    p.Position.X.SetFromNumber(100);
    p.Position.Y.SetFromNumber(200);
    p.ECB.MoveToPosition();

    RecordHistory(w);

    const record = w.HistoryData.PlayerHistoryDB[0].get(frame);
    const ecb = record.comp_ecbDiamond;
    const currentEcb = p.ECB.GetActiveVerts();

    for (let i = 0; i < 4; i++) {
      expect(ecb[i].xRaw).toBe(currentEcb[i].X.Raw);
      expect(ecb[i].yRaw).toBe(currentEcb[i].Y.Raw);
    }
  });

  test('RecordHistory2 computes LedgeDetector correctly', () => {
    const frame = 50;
    w.LocalFrame = frame;
    p.Position.X.SetFromNumber(100);
    p.Position.Y.SetFromNumber(200);
    p.LedgeDetector.MoveToPos();

    RecordHistory(w);

    const record = w.HistoryData.PlayerHistoryDB[0].get(frame);
    const ldLeft = p.LedgeDetector.LeftSide;
    const histLeft = record.comp_ledgeDetectorLeft;
    const ldRight = p.LedgeDetector.RightSide;
    const histRight = record.comp_ledgeDetectorRight;

    for (let i = 0; i < 4; i++) {
      expect(histLeft[i].xRaw).toBe(ldLeft[i].X.Raw);
      expect(histLeft[i].yRaw).toBe(ldLeft[i].Y.Raw);
      expect(histRight[i].xRaw).toBe(ldRight[i].X.Raw);
      expect(histRight[i].yRaw).toBe(ldRight[i].Y.Raw);
    }
  });
});
