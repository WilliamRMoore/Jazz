import { World } from '../engine/world/world';
import { Lerp } from '../engine/utils';
import { frameNumber } from '../engine/entity/components/attack';
import { MainConfig } from '../engine/config/main-config';

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

type lerpLine = { a: boolean; x1: number; y1: number; x2: number; y2: number };

function makeLerpLine(): lerpLine {
  return { a: false, x1: 0, y1: 0, x2: 0, y2: 0 };
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
  public LedgeDetector = {
    midTopX: 0,
    midTopY: 0,
    topRightX: 0,
    topRightY: 0,
    bottomRightX: 0,
    bottomRightY: 0,
    midBottomX: 0,
    midBottomY: 0,
    topLeftX: 0,
    topLeftY: 0,
    bottomLeftX: 0,
    bottomLeftY: 0,
  };
  public Sensors: { a: boolean; r: number; x: number; y: number }[] = [];
  public HurtBubbles: lerpLine[] = [];
  public AttackBubbles: { a: boolean; x: number; y: number; r: number }[] = [];
  public GrabBubbles: { a: boolean; x: number; y: number; r: number }[] = [];

  constructor(
    maxAtkB: number,
    maxHurtB: number,
    maxGrabB: number,
    maxSensors: number,
  ) {
    for (let i = 0; i < maxSensors; i++) {
      this.Sensors.push({ a: false, r: 0, x: 0, y: 0 });
    }
    for (let i = 0; i < maxAtkB; i++) {
      this.AttackBubbles.push({ a: false, x: 0, y: 0, r: 0 });
    }
    for (let i = 0; i < maxHurtB; i++) {
      this.HurtBubbles.push(makeLerpLine());
    }
    for (let i = 0; i < maxGrabB; i++) {
      this.GrabBubbles.push({ a: false, x: 0, y: 0, r: 0 });
    }
  }

  Zero() {
    const pos = this.Position;
    pos.X = 0;
    pos.Y = 0;
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
    const ld = this.LedgeDetector;
    ld.bottomLeftX = 0;
    ld.bottomLeftY = 0;
    ld.bottomRightX = 0;
    ld.bottomRightY = 0;
    ld.midBottomX = 0;
    ld.midBottomY = 0;
    ld.midTopX = 0;
    ld.midTopY = 0;
    ld.topLeftX = 0;
    ld.topLeftY = 0;
    ld.topRightX = 0;
    ld.topRightY = 0;
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

function LerpPlayer(
  then: frameNumber,
  now: frameNumber,
  alpha: number,
  pIndex: number,
  w: World,
  dto: LerpedPlayer,
) {
  const playerHist = w.HistoryData.PlayerComponentHistories[pIndex];
  const inputHist = w.PlayerData.InputStore(pIndex);
  const input = inputHist.GetInputForFrame(now);
  const lastInput = inputHist.GetInputForFrame(then);
  const lastPos = playerHist.PositionHistory[then];
  const currentPos = playerHist.PositionHistory[now];
  const weightedFrame = alpha < 0.5 ? then : now;
  dto.Flags.FacingRight = playerHist.FlagsHistory[weightedFrame].FacingRight;
  dto.Flags.intangible =
    playerHist.FlagsHistory[weightedFrame].IntangabilityFrames > 0;
  dto.Flags.inHitPause =
    playerHist.FlagsHistory[weightedFrame].HitPauseFrames > 0;
  dto.Position.X = Lerp(lastPos.X, currentPos.X, alpha);
  dto.Position.Y = Lerp(lastPos.Y, currentPos.Y, alpha);
  dto.Shield.a = playerHist.ShieldHistory[weightedFrame].Active;

  if (dto.Shield.a) {
    const lastTriggerVal =
      lastInput.RTValRaw > lastInput.LTValRaw
        ? lastInput.RTValRaw
        : lastInput.LTValRaw;
    const currentTriggerVal =
      input.RTValRaw > input.LTValRaw ? input.RTValRaw : input.LTValRaw;
    const lerpedTriggerRaw = Lerp(lastTriggerVal, currentTriggerVal, alpha);
    const radius = Lerp(
      playerHist.ShieldHistory[then].CurrentRadius,
      playerHist.ShieldHistory[now].CurrentRadius,
      alpha,
    );
    const shieldRadius = LerpRadiusFromTrigger(lerpedTriggerRaw, radius);
    dto.Shield.radius = shieldRadius;
    const tiltx = Lerp(
      playerHist.ShieldHistory[then].ShieldTiltX,
      playerHist.ShieldHistory[now].ShieldTiltX,
      alpha,
    );
    const tilty = Lerp(
      playerHist.ShieldHistory[then].ShieldTiltY,
      playerHist.ShieldHistory[now].ShieldTiltY,
      alpha,
    );
    dto.Shield.X = dto.Position.X + tiltx;
    dto.Shield.Y =
      dto.Position.Y + tilty + playerHist.BaseConfigValues.ShieldOffset;
  }

  const lastLastEcb = playerHist.EcbHistory[then < 1 ? 0 : then - 1];
  const lastEcb = playerHist.EcbHistory[then];
  const currentEcb = playerHist.EcbHistory[now];
  const lastLastYOffset = lastLastEcb.ecbShape.yOffset.AsNumber;
  const lastYOffset = lastEcb.ecbShape.yOffset.AsNumber;
  const currentYOffset = currentEcb.ecbShape.yOffset.AsNumber;

  const lastlastecbWidth = lastLastEcb.ecbShape.width.AsNumber;
  const lastecbWidth = lastEcb.ecbShape.width.AsNumber;
  const currentecbWidth = currentEcb.ecbShape.width.AsNumber;
  const lastlastecbHeight = lastLastEcb.ecbShape.height.AsNumber;
  const lastecbHeight = lastEcb.ecbShape.height.AsNumber;
  const currentecbHeight = currentEcb.ecbShape.height.AsNumber;

  const lastlastecbWidthHalf = lastlastecbWidth / 2;
  const lastecbWidthHalf = lastecbWidth / 2;
  const currentecbWidthHalf = currentecbWidth / 2;
  const lastlastecbHeightHalf = lastlastecbHeight / 2;
  const lastecbHeightHalf = lastecbHeight / 2;
  const currentecbHeightHalf = currentecbHeight / 2;

  dto.PreviousEcb.b.x = Lerp(lastLastEcb.posX, lastEcb.posX, alpha);
  dto.PreviousEcb.b.y = Lerp(
    lastLastEcb.posY + lastLastYOffset,
    lastEcb.posY + lastYOffset,
    alpha,
  );
  dto.PreviousEcb.l.x = Lerp(
    lastLastEcb.posX - lastlastecbWidthHalf,
    lastEcb.posX - lastecbWidthHalf,
    alpha,
  );
  dto.PreviousEcb.l.y = Lerp(
    lastLastEcb.posY + lastLastYOffset + lastlastecbHeightHalf,
    lastEcb.posY + lastYOffset + lastecbHeightHalf,
    alpha,
  );
  dto.PreviousEcb.t.x = Lerp(
    lastLastEcb.posX - lastlastecbWidthHalf,
    lastEcb.posX - lastecbWidthHalf,
    alpha,
  );
  dto.PreviousEcb.t.y = Lerp(
    lastLastEcb.posY + lastLastYOffset + lastlastecbHeight,
    lastEcb.posY + lastYOffset + lastecbHeight,
    alpha,
  );
  dto.PreviousEcb.r.x = Lerp(
    lastLastEcb.posX + lastlastecbWidthHalf,
    lastEcb.posX + lastecbWidthHalf,
    alpha,
  );
  dto.PreviousEcb.r.y = Lerp(
    lastLastEcb.posY + lastLastYOffset + lastlastecbHeightHalf,
    lastEcb.posY + lastYOffset + lastecbHeightHalf,
    alpha,
  );

  dto.Ecb.b.x = Lerp(lastEcb.posX, currentEcb.posX, alpha);
  dto.Ecb.b.y = Lerp(
    lastEcb.posY + lastYOffset,
    currentEcb.posY + currentYOffset,
    alpha,
  );
  dto.Ecb.l.x = Lerp(
    lastEcb.posX - lastecbWidthHalf,
    currentEcb.posX - currentecbWidthHalf,
    alpha,
  );
  dto.Ecb.l.y = Lerp(
    lastEcb.posY + lastYOffset + lastecbHeightHalf,
    currentEcb.posY + currentYOffset + currentecbHeightHalf,
    alpha,
  );
  dto.Ecb.t.x = Lerp(
    lastEcb.posX - lastecbWidthHalf,
    currentEcb.posX - currentecbWidthHalf,
    alpha,
  );
  dto.Ecb.t.y = Lerp(
    lastEcb.posY + lastYOffset + lastecbHeight,
    currentEcb.posY + currentYOffset + currentecbHeight,
    alpha,
  );
  dto.Ecb.r.x = Lerp(
    lastEcb.posX + lastecbWidthHalf,
    currentEcb.posX + currentecbWidthHalf,
    alpha,
  );
  dto.Ecb.r.y = Lerp(
    lastEcb.posY + lastYOffset + lastecbHeightHalf,
    currentEcb.posY + currentYOffset + currentecbHeightHalf,
    alpha,
  );

  const hcs = playerHist.BaseConfigValues.HurtCapsules;
  const numHcs = hcs.length;
  for (let i = 0; i < numHcs; i++) {
    const hc = hcs[i];
    dto.HurtBubbles[i].x1 = dto.Position.X + hc.StartOffsetX.AsNumber;
    dto.HurtBubbles[i].y1 = dto.Position.Y + hc.StartOffsetY.AsNumber;
    dto.HurtBubbles[i].x2 = dto.Position.X + hc.EndOffsetX.AsNumber;
    dto.HurtBubbles[i].y2 = dto.Position.Y + hc.EndOffsetY.AsNumber;
  }

  const ldHeight = playerHist.BaseConfigValues.LedgeDetectorHeight;
  const ldWidth = playerHist.BaseConfigValues.LedgeDetectorWidth;
  const prevLd = playerHist.LedgeDetectorHistory[then];
  const currentLd = playerHist.LedgeDetectorHistory[now];

  const lerpMiddleTopX = Lerp(prevLd.middleX, currentLd.middleX, alpha);
  const lerpMiddleTopY = Lerp(prevLd.middleY, currentLd.middleY, alpha);
  const lerpTopRightX = lerpMiddleTopX + ldWidth;
  const lerpTopRightY = lerpMiddleTopY;
  const lerpBottomRightX = lerpMiddleTopX + ldWidth;
  const lerpBottomRightY = lerpMiddleTopY + ldHeight;
  const lerpMidBottomX = lerpMiddleTopX;
  const lerpMidBottomY = lerpMiddleTopY + ldHeight;
  const lerpTopLeftX = lerpMiddleTopX - ldWidth;
  const lerpTopLeftY = lerpMiddleTopY;
  const lerpBottomLeftX = lerpMiddleTopX - ldWidth;
  const lerpBottomLeftY = lerpMiddleTopY + ldHeight;

  dto.LedgeDetector.midTopX = lerpMiddleTopX;
  dto.LedgeDetector.midTopY = lerpMiddleTopY;
  dto.LedgeDetector.topRightX = lerpTopRightX;
  dto.LedgeDetector.topRightY = lerpTopRightY;
  dto.LedgeDetector.bottomRightX = lerpBottomRightX;
  dto.LedgeDetector.bottomRightY = lerpBottomRightY;
  dto.LedgeDetector.midBottomX = lerpMidBottomX;
  dto.LedgeDetector.midBottomY = lerpMidBottomY;
  dto.LedgeDetector.topLeftX = lerpTopLeftX;
  dto.LedgeDetector.topLeftY = lerpTopLeftY;
  dto.LedgeDetector.bottomLeftX = lerpBottomLeftX;
  dto.LedgeDetector.bottomLeftY = lerpBottomLeftY;

  const sensors = playerHist.SensorsHistory[now];
  const numSensors = sensors.sensors?.length ?? 0;
  for (let i = 0; i < numSensors; i++) {
    const sensor = sensors.sensors![i];
    const dtoSensor = dto.Sensors[i];
    dtoSensor.a = true;
    dtoSensor.r = sensor.radius;
    dtoSensor.x = Lerp(
      lastPos.X + sensor.xOffset,
      currentPos.X + sensor.xOffset,
      alpha,
    );
    dtoSensor.y = Lerp(
      lastPos.Y + sensor.yOffset,
      currentPos.Y + sensor.yOffset,
      alpha,
    );
  }

  const attackHist = playerHist.AttackHistory[now];
  const atk = attackHist.attack;
  const hitBubbles = atk?.HitBubbles;
  const numBubbles = hitBubbles?.length ?? 0;
  for (let i = 0; i < numBubbles; i++) {
    const bubble = hitBubbles![i];
    if (!bubble.IsActive(now)) {
      continue;
    }
    const lp = bubble.GetLocalPosiitionOffsetForFrame(now);
    if (lp === undefined) {
      continue;
    }
    dto.AttackBubbles[i].a = true;
    dto.AttackBubbles[i].r = bubble.Radius.AsNumber;
    dto.AttackBubbles[i].x = dto.Position.X + lp.X.AsNumber;
    dto.AttackBubbles[i].y = dto.Position.Y + lp.Y.AsNumber;
  }

  const grabHist = playerHist.GrabHistory[now];
  const grab = grabHist?.GrabBubbles;

  if (grab !== undefined) {
    const numBubbles = grab.length;
    for (let i = 0; i < numBubbles; i++) {
      const bubble = grab![i];
      if (!bubble.IsActive(now)) {
        continue;
      }
      const lp = bubble.GetLocalPositionOffsetForFrame(now);
      if (lp === undefined) {
        continue;
      }
      dto.GrabBubbles[i].a = true;
      dto.GrabBubbles[i].r = bubble.Radius.AsNumber;
      dto.GrabBubbles[i].x = dto.Position.X + lp.X.AsNumber;
      dto.GrabBubbles[i].y = dto.Position.Y + lp.Y.AsNumber;
    }
  }
}

function LerpRadiusFromTrigger(triggerValue: number, raddius: number): number {
  return raddius + (raddius * (1 - triggerValue)) / 2;
}
