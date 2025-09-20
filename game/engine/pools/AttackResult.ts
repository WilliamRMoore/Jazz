import { IPooledObject } from './Pool';

type playerIndex = number;

export class AttackResult implements IPooledObject {
  private hit: boolean = false;
  private shieldHit: boolean = false;
  private damage: number = 0;
  private baseKnockBack: number = 0;
  private knockBackScaling: number = 1;
  private launchAngle: number = 0;
  private priority: number = Number.MAX_SAFE_INTEGER;
  private normX: number = 0;
  private normY: number = 0;
  private depth: number = 0;
  private playerIndexOfPlayerHit: playerIndex = -1;

  public Zero(): void {
    this.hit = false;
    this.shieldHit = false;
    this.damage = 0;
    this.baseKnockBack = 0;
    this.knockBackScaling = 1;
    this.launchAngle = 0;
    this.priority = Number.MAX_SAFE_INTEGER;
    this.normX = 0;
    this.normY = 0;
    this.depth = 0;
    this.playerIndexOfPlayerHit = -1;
  }

  public SetHitTrue(
    playerIndex: number,
    damage: number,
    priority: number,
    normX: number,
    normY: number,
    depth: number,
    baseKnockBack: number,
    knockBackScaling: number,
    launchAngle: number
  ) {
    this.hit = true;
    this.playerIndexOfPlayerHit = playerIndex;
    this.damage = damage;
    this.priority = priority;
    this.normX = normX;
    this.normY = normY;
    this.depth = depth;
    this.baseKnockBack = baseKnockBack;
    this.knockBackScaling = knockBackScaling;
    this.launchAngle = launchAngle;
  }

  public SetShieldHitTrue(
    playerIndex: number,
    damage: number,
    priority: number,
    normX: number,
    normY: number,
    depth: number,
    baseKnockBack: number,
    knockBackScaling: number,
    launchAngle: number
  ) {
    this.shieldHit = true;
    this.playerIndexOfPlayerHit = playerIndex;
    this.damage = damage;
    this.priority = priority;
    this.normX = normX;
    this.normY = normY;
    this.depth = depth;
    this.baseKnockBack = baseKnockBack;
    this.knockBackScaling = knockBackScaling;
    this.launchAngle = launchAngle;
  }

  public get Hit(): boolean {
    return this.hit;
  }

  public get ShieldHit(): boolean {
    return this.shieldHit;
  }

  public get Damage(): number {
    return this.damage;
  }

  public get Priority(): number {
    return this.priority;
  }

  public get NormX(): number {
    return this.normX;
  }

  public get NormY(): number {
    return this.normY;
  }

  public get Depth(): number {
    return this.depth;
  }

  public get BaseKnockBack(): number {
    return this.baseKnockBack;
  }

  public get LaunchAngle(): number {
    return this.launchAngle;
  }

  public get KnockBackScaling(): number {
    return this.knockBackScaling;
  }

  public get PlayerIndex(): number {
    return this.playerIndexOfPlayerHit;
  }
}
