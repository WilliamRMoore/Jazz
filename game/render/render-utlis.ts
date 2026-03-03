import { World } from '../engine/world/world';
import { Lerp } from '../engine/utils';
import { frameNumber } from '../engine/entity/components/attack';
import { MainConfig } from '../engine/config/main-config';
import { RawToNumber } from '../engine/math/fixedPoint';

class PlayerLerper {
  private pool: LerpedPlayer[] = [];
  private poolIndex = 0;
  private maxAtkB: number;
  private maxHurtB: number;
  private maxGrabB: number;
  private maxSensors: number;

  constructor(ec: MainConfig) {
    const maxAtkB = ec.get('MaxAtkBubblesPerPlayer') as number;
    const maxHurtB = ec.get('MaxHurtBubblesPerPlayer') as number;
    const maxGrabB = ec.get('MaxGrabBubblesPerPlayer') as number;
    const maxSensors = ec.get('MaxSensorsPerPlayer') as number;
    this.maxAtkB = maxAtkB;
    this.maxHurtB = maxHurtB;
    this.maxGrabB = maxGrabB;
    this.maxSensors = maxSensors;
  }

  public Lerp(
    w: World,
    pIndex: number,
    alpha: number,
    now: frameNumber,
    then: frameNumber | undefined = undefined,
  ): LerpedPlayer {
    const dto = this.rent();
    if (then === undefined) {
      then = now < 1 ? 0 : now - 1;
    }
    LerpPlayer(then, now, alpha, pIndex, w, dto);
    return dto;
  }

  private rent(): LerpedPlayer {
    if (this.poolIndex >= this.pool.length) {
      const newLp = new LerpedPlayer(
        this.maxAtkB,
        this.maxHurtB,
        this.maxGrabB,
        this.maxSensors,
      );
      this.pool.push(newLp);
      this.poolIndex++;
      return newLp;
    }
    const lp = this.pool[this.poolIndex];
    lp.Zero();
    this.poolIndex++;
    return lp;
  }

  public Zero() {
    this.poolIndex = 0;
  }
}

type lerpHurt = {
  a: boolean;
  r: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function makeLerpHurt(): lerpHurt {
  return { a: false, r: 0, x1: 0, y1: 0, x2: 0, y2: 0 };
}

class LerpedPlayer {
  public Position = { X: 0, Y: 0 };
  public PreviousEcb = {
    b: { x: 0, y: 0 },
    l: { x: 0, y: 0 },
    t: { x: 0, y: 0 },
    r: { x: 0, y: 0 },
  };
  public Ecb = {
    b: { x: 0, y: 0 },
    l: { x: 0, y: 0 },
    t: { x: 0, y: 0 },
    r: { x: 0, y: 0 },
  };
  public Shield = { a: false, radius: 0, X: 0, Y: 0 };
  public Flags = { FacingRight: true, intangible: false, inHitPause: false };
  public LedgeDetectorRight = {
    bottomLeftX: 0,
    bottomLeftY: 0,
    topLeftX: 0,
    topLeftY: 0,
    topRightX: 0,
    topRightY: 0,
    bottomRightX: 0,
    bottomRightY: 0,
  };
  public LedgeDetectorLeft = {
    bottomLeftX: 0,
    bottomLeftY: 0,
    topLeftX: 0,
    topLeftY: 0,
    topRightX: 0,
    topRightY: 0,
    bottomRightX: 0,
    bottomRightY: 0,
  };
  public Sensors: { a: boolean; x: number; y: number; r: number }[] = [];
  public HurtBubbles: lerpHurt[] = [];
  public AttackBubbles: { a: boolean; x: number; y: number; r: number }[] = [];
  public GrabBubbles: { a: boolean; x: number; y: number; r: number }[] = [];

  constructor(
    maxAtkB: number,
    maxHurtB: number,
    maxGrabB: number,
    maxSensors: number,
  ) {
    for (let i = 0; i < maxSensors; i++) {
      this.Sensors.push({ a: false, x: 0, y: 0, r: 0 });
    }
    for (let i = 0; i < maxAtkB; i++) {
      this.AttackBubbles.push({ a: false, x: 0, y: 0, r: 0 });
    }
    for (let i = 0; i < maxHurtB; i++) {
      this.HurtBubbles.push(makeLerpHurt());
    }
    for (let i = 0; i < maxGrabB; i++) {
      this.GrabBubbles.push({ a: false, x: 0, y: 0, r: 0 });
    }
  }

  Zero() {
    const pos = this.Position;
    pos.X = 0;
    pos.Y = 0;
    const previousEcb = this.PreviousEcb;
    previousEcb.b.x = 0;
    previousEcb.b.y = 0;
    previousEcb.l.x = 0;
    previousEcb.l.y = 0;
    previousEcb.t.x = 0;
    previousEcb.t.y = 0;
    previousEcb.r.x = 0;
    previousEcb.r.y = 0;
    const ecb = this.Ecb;
    ecb.b.x = 0;
    ecb.b.y = 0;
    ecb.l.x = 0;
    ecb.l.y = 0;
    ecb.t.x = 0;
    ecb.t.y = 0;
    ecb.r.x = 0;
    ecb.r.y = 0;
    const shield = this.Shield;
    shield.radius = 0;
    shield.a = false;
    shield.X = 0;
    shield.Y = 0;
    const flags = this.Flags;
    flags.FacingRight = true;
    flags.intangible = false;
    flags.inHitPause = false;
    const ldr = this.LedgeDetectorRight;
    ldr.bottomLeftX = 0;
    ldr.bottomLeftY = 0;
    ldr.bottomRightX = 0;
    ldr.bottomRightY = 0;
    ldr.topLeftX = 0;
    ldr.topLeftY = 0;
    ldr.topRightX = 0;
    ldr.topRightY = 0;
    const ldl = this.LedgeDetectorLeft;
    ldl.bottomLeftX = 0;
    ldl.bottomLeftY = 0;
    ldl.bottomRightX = 0;
    ldl.bottomRightY = 0;
    ldl.topLeftX = 0;
    ldl.topLeftY = 0;
    ldl.topRightX = 0;
    ldl.topRightY = 0;
    const sensorLength = this.Sensors.length;
    for (let i = 0; i < sensorLength; i++) {
      const sensor = this.Sensors[i];
      sensor.a = false;
      sensor.r = 0;
      sensor.x = 0;
      sensor.y = 0;
    }
    const hurtLength = this.HurtBubbles.length;
    for (let i = 0; i < hurtLength; i++) {
      const hurt = this.HurtBubbles[i];
      hurt.a = false;
      hurt.r = 0;
      hurt.x1 = 0;
      hurt.y1 = 0;
      hurt.x2 = 0;
      hurt.y2 = 0;
    }
    const atkLength = this.AttackBubbles.length;
    for (let i = 0; i < atkLength; i++) {
      const atk = this.AttackBubbles[i];
      atk.a = false;
      atk.x = 0;
      atk.y = 0;
      atk.r = 0;
    }
    const grabLength = this.GrabBubbles.length;
    for (let i = 0; i < grabLength; i++) {
      const grab = this.GrabBubbles[i];
      grab.a = false;
      grab.x = 0;
      grab.y = 0;
      grab.r = 0;
    }
  }
}

const lerpAndConvert = (
  thenRaw: number,
  nowRaw: number,
  alpha: number,
): number => {
  return RawToNumber(Lerp(thenRaw, nowRaw, alpha)) as number;
};

function LerpPlayer(
  then: frameNumber,
  now: frameNumber,
  alpha: number,
  pIndex: number,
  w: World,
  dto: LerpedPlayer,
) {
  const pTable = w.HistoryData.PlayerHistoryDB[pIndex];
  const previousECBFrame = then < 1 ? 0 : then - 1;
  const previousState = pTable.get(previousECBFrame);
  const thenState = pTable.get(then);
  const nowState = pTable.get(now);
  const lp = dto;
  const lc = lerpAndConvert;
  lp.Position.X = lc(thenState.posXRaw, nowState.posXRaw, alpha);
  lp.Position.Y = lc(thenState.posYRaw, nowState.posYRaw, alpha);
  lp.PreviousEcb.b.x = lc(
    previousState.comp_ecbDiamond[0].xRaw,
    thenState.comp_ecbDiamond[0].xRaw,
    alpha,
  );
  lp.PreviousEcb.b.y = lc(
    previousState.comp_ecbDiamond[0].yRaw,
    thenState.comp_ecbDiamond[0].yRaw,
    alpha,
  );
  lp.PreviousEcb.l.x = lc(
    previousState.comp_ecbDiamond[1].xRaw,
    thenState.comp_ecbDiamond[1].xRaw,
    alpha,
  );
  lp.PreviousEcb.l.y = lc(
    previousState.comp_ecbDiamond[1].yRaw,
    thenState.comp_ecbDiamond[1].yRaw,
    alpha,
  );
  lp.PreviousEcb.t.x = lc(
    previousState.comp_ecbDiamond[2].xRaw,
    thenState.comp_ecbDiamond[2].xRaw,
    alpha,
  );
  lp.PreviousEcb.t.y = lc(
    previousState.comp_ecbDiamond[2].yRaw,
    thenState.comp_ecbDiamond[2].yRaw,
    alpha,
  );
  lp.PreviousEcb.r.x = lc(
    previousState.comp_ecbDiamond[3].xRaw,
    thenState.comp_ecbDiamond[3].xRaw,
    alpha,
  );
  lp.PreviousEcb.r.y = lc(
    previousState.comp_ecbDiamond[3].yRaw,
    thenState.comp_ecbDiamond[3].yRaw,
    alpha,
  );
  lp.Ecb.b.x = lc(
    thenState.comp_ecbDiamond[0].xRaw,
    nowState.comp_ecbDiamond[0].xRaw,
    alpha,
  );
  lp.Ecb.b.y = lc(
    thenState.comp_ecbDiamond[0].yRaw,
    nowState.comp_ecbDiamond[0].yRaw,
    alpha,
  );
  lp.Ecb.l.x = lc(
    thenState.comp_ecbDiamond[1].xRaw,
    nowState.comp_ecbDiamond[1].xRaw,
    alpha,
  );
  lp.Ecb.l.y = lc(
    thenState.comp_ecbDiamond[1].yRaw,
    nowState.comp_ecbDiamond[1].yRaw,
    alpha,
  );
  lp.Ecb.t.x = lc(
    thenState.comp_ecbDiamond[2].xRaw,
    nowState.comp_ecbDiamond[2].xRaw,
    alpha,
  );
  lp.Ecb.t.y = lc(
    thenState.comp_ecbDiamond[2].yRaw,
    nowState.comp_ecbDiamond[2].yRaw,
    alpha,
  );
  lp.Ecb.r.x = lc(
    thenState.comp_ecbDiamond[3].xRaw,
    nowState.comp_ecbDiamond[3].xRaw,
    alpha,
  );
  lp.Ecb.r.y = lc(
    thenState.comp_ecbDiamond[3].yRaw,
    nowState.comp_ecbDiamond[3].yRaw,
    alpha,
  );
  lp.Shield.a = nowState.shieldActive;
  const compShieldThen = thenState.comp_shield;
  const compShieldNow = nowState.comp_shield;
  if (lp.Shield.a) {
    const shieldWasActiveThen = thenState.shieldActive;
    const thenRadiusRaw = shieldWasActiveThen
      ? compShieldThen.calcRadiusRaw
      : compShieldNow.calcRadiusRaw;
    const thenXRaw = shieldWasActiveThen
      ? compShieldThen.calcXRaw
      : compShieldNow.calcXRaw;
    const thenYRaw = shieldWasActiveThen
      ? compShieldThen.calcYRaw
      : compShieldNow.calcYRaw;
    lp.Shield.radius = lc(thenRadiusRaw, compShieldNow.calcRadiusRaw, alpha);
    lp.Shield.X = lc(thenXRaw, compShieldNow.calcXRaw, alpha);
    lp.Shield.Y = lc(thenYRaw, compShieldNow.calcYRaw, alpha);
  }
  const ldr = lp.LedgeDetectorRight;
  ldr.bottomLeftX = lc(
    thenState.comp_ledgeDetectorRight[0].xRaw,
    nowState.comp_ledgeDetectorRight[0].xRaw,
    alpha,
  );
  ldr.bottomLeftY = lc(
    thenState.comp_ledgeDetectorRight[0].yRaw,
    nowState.comp_ledgeDetectorRight[0].yRaw,
    alpha,
  );
  ldr.topLeftX = lc(
    thenState.comp_ledgeDetectorRight[1].xRaw,
    nowState.comp_ledgeDetectorRight[1].xRaw,
    alpha,
  );
  ldr.topLeftY = lc(
    thenState.comp_ledgeDetectorRight[1].yRaw,
    nowState.comp_ledgeDetectorRight[1].yRaw,
    alpha,
  );
  ldr.topRightX = lc(
    thenState.comp_ledgeDetectorRight[2].xRaw,
    nowState.comp_ledgeDetectorRight[2].xRaw,
    alpha,
  );
  ldr.topRightY = lc(
    thenState.comp_ledgeDetectorRight[2].yRaw,
    nowState.comp_ledgeDetectorRight[2].yRaw,
    alpha,
  );
  ldr.bottomRightX = lc(
    thenState.comp_ledgeDetectorRight[3].xRaw,
    nowState.comp_ledgeDetectorRight[3].xRaw,
    alpha,
  );
  ldr.bottomRightY = lc(
    thenState.comp_ledgeDetectorRight[3].yRaw,
    nowState.comp_ledgeDetectorRight[3].yRaw,
    alpha,
  );
  const ldl = lp.LedgeDetectorLeft;
  ldl.bottomLeftX = lc(
    thenState.comp_ledgeDetectorLeft[0].xRaw,
    nowState.comp_ledgeDetectorLeft[0].xRaw,
    alpha,
  );
  ldl.bottomLeftY = lc(
    thenState.comp_ledgeDetectorLeft[0].yRaw,
    nowState.comp_ledgeDetectorLeft[0].yRaw,
    alpha,
  );
  ldl.topLeftX = lc(
    thenState.comp_ledgeDetectorLeft[1].xRaw,
    nowState.comp_ledgeDetectorLeft[1].xRaw,
    alpha,
  );
  ldl.topLeftY = lc(
    thenState.comp_ledgeDetectorLeft[1].yRaw,
    nowState.comp_ledgeDetectorLeft[1].yRaw,
    alpha,
  );
  ldl.topRightX = lc(
    thenState.comp_ledgeDetectorLeft[2].xRaw,
    nowState.comp_ledgeDetectorLeft[2].xRaw,
    alpha,
  );
  ldl.topRightY = lc(
    thenState.comp_ledgeDetectorLeft[2].yRaw,
    nowState.comp_ledgeDetectorLeft[2].yRaw,
    alpha,
  );
  ldl.bottomRightX = lc(
    thenState.comp_ledgeDetectorLeft[3].xRaw,
    nowState.comp_ledgeDetectorLeft[3].xRaw,
    alpha,
  );
  ldl.bottomRightY = lc(
    thenState.comp_ledgeDetectorLeft[3].yRaw,
    nowState.comp_ledgeDetectorLeft[3].yRaw,
    alpha,
  );
  const nowSensors = nowState.comp_sensors;
  const thenSensors = thenState.comp_sensors;
  const sensorLength = lp.Sensors.length;
  for (let i = 0; i < sensorLength; i++) {
    const nowSensor = nowSensors[i];
    const isActive = nowSensor.active;
    if (!isActive) {
      lp.Sensors[i].a = false;
      continue;
    }
    const thenSensor = thenSensors[i];
    const wasActive = thenSensor.active;
    const thenRadiusRaw = wasActive
      ? thenSensor.radiusRaw
      : nowSensor.radiusRaw;
    const thenXRaw = wasActive ? thenSensor.globalXRaw : nowSensor.globalXRaw;
    const thenYRaw = wasActive ? thenSensor.globalYRaw : nowSensor.globalYRaw;
    const lpSensor = lp.Sensors[i];
    lpSensor.a = true;
    lpSensor.r = lc(thenRadiusRaw, nowSensor.radiusRaw, alpha);
    lpSensor.x = lc(thenXRaw, nowSensor.globalXRaw, alpha);
    lpSensor.y = lc(thenYRaw, nowSensor.globalYRaw, alpha);
  }
  const hsLength = nowState.comp_hurtCapsules.length;
  for (let i = 0; i < hsLength; i++) {
    const nowHurt = nowState.comp_hurtCapsules[i];
    const thenHurt = thenState.comp_hurtCapsules[i];
    if (nowHurt.active) {
      const lpHurt = lp.HurtBubbles[i];
      lpHurt.a = true;
      lpHurt.r = lc(thenHurt.radiusRaw, nowHurt.radiusRaw, alpha);
      lpHurt.x1 = lc(thenHurt.x1Raw, nowHurt.x1Raw, alpha);
      lpHurt.y1 = lc(thenHurt.y1Raw, nowHurt.y1Raw, alpha);
      lpHurt.x2 = lc(thenHurt.x2Raw, nowHurt.x2Raw, alpha);
      lpHurt.y2 = lc(thenHurt.y2Raw, nowHurt.y2Raw, alpha);
    }
  }
  const atkLength = nowState.comp_attackCircles.length;
  for (let i = 0; i < atkLength; i++) {
    const nowAtk = nowState.comp_attackCircles[i];
    if (!nowAtk.active) {
      lp.AttackBubbles[i].a = false;
      continue;
    }
    const thenAtk = thenState.comp_attackCircles[i];
    const lpAtk = lp.AttackBubbles[i];
    const thenRadiusRaw = thenAtk.active ? thenAtk.radiusRaw : nowAtk.radiusRaw;
    const thenXRaw = thenAtk.active ? thenAtk.xRaw : nowAtk.xRaw;
    const thenYRaw = thenAtk.active ? thenAtk.yRaw : nowAtk.yRaw;
    lpAtk.a = true;
    lpAtk.r = lc(thenRadiusRaw, nowAtk.radiusRaw, alpha);
    lpAtk.x = lc(thenXRaw, nowAtk.xRaw, alpha);
    lpAtk.y = lc(thenYRaw, nowAtk.yRaw, alpha);
  }
  const grabLength = nowState.comp_grabCircles.length;
  for (let i = 0; i < grabLength; i++) {
    const nowGrab = nowState.comp_grabCircles[i];
    if (!nowGrab.active) {
      lp.GrabBubbles[i].a = false;
      continue;
    }
    const thenGrab = thenState.comp_grabCircles[i];
    const lpGrab = lp.GrabBubbles[i];
    const thenRadiusRaw = thenGrab.active
      ? thenGrab.radiusRaw
      : nowGrab.radiusRaw;
    const thenXRaw = thenGrab.active ? thenGrab.xRaw : nowGrab.xRaw;
    const thenYRaw = thenGrab.active ? thenGrab.yRaw : nowGrab.yRaw;
    lpGrab.a = true;
    lpGrab.r = lc(thenRadiusRaw, nowGrab.radiusRaw, alpha);
    lpGrab.x = lc(thenXRaw, nowGrab.xRaw, alpha);
    lpGrab.y = lc(thenYRaw, nowGrab.yRaw, alpha);
  }
  const flags = lp.Flags;
  flags.intangible = nowState.intangabilityFrames > 0;
  flags.inHitPause = nowState.hitPauseFrames > 0;
  flags.FacingRight = nowState.facingRight;
}

function LerpRadiusFromTrigger(triggerValue: number, raddius: number): number {
  return raddius + (raddius * (1 - triggerValue)) / 2;
}
