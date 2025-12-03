import { FixedPoint } from '../math/fixedPoint';
import { IPooledObject } from './Pool';

type playerIndex = number;

export class AttackResult implements IPooledObject {
  private hit: boolean = false;
  private shieldHit: boolean = false;
  private readonly damage = new FixedPoint();
  private readonly baseKnockBack = new FixedPoint();
  private readonly knockBackScaling = new FixedPoint();
  private readonly launchAngle = new FixedPoint();
  private priority: number = Number.MAX_SAFE_INTEGER;
  private readonly normX = new FixedPoint();
  private readonly normY = new FixedPoint();
  private readonly depth = new FixedPoint();
  private playerIndexOfPlayerHit: playerIndex = -1;

  public Zero(): void {
    this.hit = false;
    this.shieldHit = false;
    this.damage.Zero();
    this.baseKnockBack.Zero();
    this.knockBackScaling.Zero();
    this.launchAngle.Zero();
    this.priority = Number.MAX_SAFE_INTEGER;
    this.normX.Zero();
    this.normY.Zero();
    this.depth.Zero();
    this.playerIndexOfPlayerHit = -1;
  }

  public SetHitTrue(
    playerIndex: number,
    damage: FixedPoint,
    priority: number,
    normX: FixedPoint,
    normY: FixedPoint,
    depth: FixedPoint,
    baseKnockBack: FixedPoint,
    knockBackScaling: FixedPoint,
    launchAngle: FixedPoint
  ) {
    this.hit = true;
    this.playerIndexOfPlayerHit = playerIndex;
    this.damage.SetFromFp(damage);
    this.priority = priority;
    this.normX.SetFromFp(normX);
    this.normY.SetFromFp(normY);
    this.depth.SetFromFp(depth);
    this.baseKnockBack.SetFromFp(baseKnockBack);
    this.knockBackScaling.SetFromFp(knockBackScaling);
    this.launchAngle.SetFromFp(launchAngle);
  }

  public SetShieldHitTrue(
    playerIndex: number,
    damage: FixedPoint,
    priority: number,
    normX: FixedPoint,
    normY: FixedPoint,
    depth: FixedPoint,
    baseKnockBack: FixedPoint,
    knockBackScaling: FixedPoint,
    launchAngle: FixedPoint
  ) {
    this.shieldHit = true;
    this.playerIndexOfPlayerHit = playerIndex;
    this.damage.SetFromFp(damage);
    this.priority = priority;
    this.normX.SetFromFp(normX);
    this.normY.SetFromFp(normY);
    this.depth.SetFromFp(depth);
    this.baseKnockBack.SetFromFp(baseKnockBack);
    this.knockBackScaling.SetFromFp(knockBackScaling);
    this.launchAngle.SetFromFp(launchAngle);
  }

  public get Hit(): boolean {
    return this.hit;
  }

  public get ShieldHit(): boolean {
    return this.shieldHit;
  }

  public get Damage(): FixedPoint {
    return this.damage;
  }

  public get Priority(): number {
    return this.priority;
  }

  public get NormX(): FixedPoint {
    return this.normX;
  }

  public get NormY(): FixedPoint {
    return this.normY;
  }

  public get Depth(): FixedPoint {
    return this.depth;
  }

  public get BaseKnockBack(): FixedPoint {
    return this.baseKnockBack;
  }

  public get LaunchAngle(): FixedPoint {
    return this.launchAngle;
  }

  public get KnockBackScaling(): FixedPoint {
    return this.knockBackScaling;
  }

  public get PlayerIndex(): number {
    return this.playerIndexOfPlayerHit;
  }
}
