import { HitBubblesConifg, AttackConfig } from '../../../character/shared';
import { Command } from '../../command/command';
import { AttackGameEventMappings } from '../../finiteStateMachines/player/PlayerStateCollections';
import { AttackId, GameEventId } from '../../finiteStateMachines/player/shared';
import {
  FixedPoint,
  MAX_RAW_VALUE,
  MIN_RAW_VALUE
} from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { AABBDTO } from '../../pools/AABBDTO';
import { ActiveHitBubblesDTO } from '../../pools/ActiveAttackBubbles';
import { Pool } from '../../pools/Pool';
import { PooledVector } from '../../pools/PooledVector';
import { ToFV } from '../../utils';
import { AABB } from './shared/AABB';

type bubbleId = number;
export type frameNumber = number;

export class HitBubble {
  private readonly posRef: FlatVec;
  private readonly facingRight: () => boolean;
  public readonly BubbleId: bubbleId;
  public readonly Damage = new FixedPoint(0);
  public readonly Priority: number;
  public readonly Radius = new FixedPoint(0);
  public readonly launchAngle = new FixedPoint(0);
  public readonly activeFrames = new Set<number>();
  public readonly frameOffsets = new Map<frameNumber, FlatVec>();
  public readonly ThresholdAngle: boolean;

  constructor(
    hbc: HitBubblesConifg,
    posRef: FlatVec,
    facingRight: () => boolean
  ) {
    this.posRef = posRef;
    this.facingRight = facingRight;
    this.BubbleId = hbc.BubbleId;
    this.Damage.SetFromNumber(hbc.Damage);
    this.Priority = hbc.Priority;
    this.Radius.SetFromNumber(hbc.Radius);
    this.launchAngle.SetFromNumber(hbc.LaunchAngle);
    this.ThresholdAngle = hbc.ThresholdAngle;
    for (const [k, v] of hbc.frameOffsets) {
      this.frameOffsets.set(k, ToFV(v.x, v.y));
      this.activeFrames.add(k);
    }
  }

  public IsActive(attackFrameNumber: frameNumber): boolean {
    return this.activeFrames.has(attackFrameNumber);
  }

  public GetLocalPosiitionOffsetForFrame(
    frameNumber: frameNumber
  ): FlatVec | undefined {
    return this.frameOffsets.get(frameNumber);
  }

  public GetGlobalPosition(
    vecPool: Pool<PooledVector>,
    attackFrameNumber: frameNumber
  ): PooledVector | undefined {
    const offset = this.frameOffsets.get(attackFrameNumber);

    if (offset === undefined) {
      return undefined;
    }

    const xRaw = this.posRef.X.Raw;
    const yRaw = this.posRef.Y.Raw;

    const globalXRaw = this.facingRight()
      ? xRaw + offset.X.Raw
      : xRaw - offset.X.Raw;
    const globalYRaw = yRaw + offset.Y.Raw;

    return vecPool.Rent().SetXYRaw(globalXRaw, globalYRaw);
  }

  public GetPreviousGlobalPosition(
    vecPool: Pool<PooledVector>,
    prevPosXRaw: number,
    prevPosYRaw: number,
    prevFaingRight: boolean,
    attackFrameNumber: frameNumber
  ): PooledVector | undefined {
    const offset = this.frameOffsets.get(attackFrameNumber);

    if (offset === undefined) {
      return undefined;
    }

    const globalXRaw = prevFaingRight
      ? prevPosXRaw + offset.X.Raw
      : prevPosXRaw - offset.X.Raw;
    const globalYRaw = prevPosYRaw + offset.Y.Raw;

    return vecPool.Rent().SetXYRaw(globalXRaw, globalYRaw);
  }
}

//Need to know if an attack should reverse the x axis for the angle when hitting behinde
//Need to know if an attack has a threshold angle
export class Attack {
  public readonly AttackId: AttackId;
  public readonly Name: string;
  public readonly TotalFrameLength: number;
  public readonly InteruptableFrame: number;
  public readonly GravityActive: boolean;
  public readonly BaseKnockBack = new FixedPoint(0);
  public readonly KnockBackScaling = new FixedPoint(0);
  public readonly ImpulseClamp: FixedPoint | undefined;
  public readonly Impulses: Map<frameNumber, FlatVec> | undefined;
  public readonly CanOnlyFallOffLedgeIfFacingAwayFromIt: boolean = false;
  public readonly HitBubbles: Array<HitBubble>;
  public readonly onEnterCommands: Array<Command> = [];
  public readonly onUpdateCommands = new Map<number, Array<Command>>();
  public readonly onExitCommands: Array<Command> = [];

  constructor(conf: AttackConfig, posRef: FlatVec, facingRight: () => boolean) {
    this.AttackId = conf.AttackId;
    this.Name = conf.Name;
    this.TotalFrameLength = conf.TotalFrameLength;
    this.InteruptableFrame = conf.InteruptableFrame;
    this.GravityActive = conf.GravityActive;
    this.CanOnlyFallOffLedgeIfFacingAwayFromIt =
      conf.CanOnlyFallOffLedgeIfFacingAwayFromIt;
    this.BaseKnockBack.SetFromNumber(conf.BaseKnockBack);
    this.KnockBackScaling.SetFromNumber(conf.KnockBackScaling);

    if (conf.ImpulseClamp != undefined) {
      this.ImpulseClamp = new FixedPoint().SetFromNumber(conf.ImpulseClamp);
    }

    const hbs = conf.HitBubbles.map(
      (hbc) => new HitBubble(hbc, posRef, facingRight)
    );
    hbs.sort((a, b) => a.BubbleId - b.BubbleId);

    let lastBubbleId = -1;

    for (let i = 0; i < hbs.length; i++) {
      const hb = hbs[i];

      if (hb.BubbleId === lastBubbleId) {
        throw new Error(
          'Duplicate BubbleId found in HitBubbles. BubbleId must be unique.'
        );
      }
      lastBubbleId = hb.BubbleId;
    }

    this.HitBubbles = hbs.sort((a, b) => a.Priority - b.Priority);

    if (conf.Impulses !== undefined) {
      this.Impulses = new Map<frameNumber, FlatVec>();
      for (const [k, v] of conf.Impulses) {
        this.Impulses.set(k, ToFV(v.x, v.y));
      }
    }
    if (conf.onEnterCommands !== undefined) {
      this.onEnterCommands = conf.onEnterCommands;
    }
    if (conf.onUpdateCommands !== undefined) {
      this.onUpdateCommands = conf.onUpdateCommands;
    }
    if (conf.onExitCommands !== undefined) {
      this.onExitCommands = conf.onExitCommands;
    }
  }

  public GetImpulseForFrame(frameNumber: number): FlatVec | undefined {
    if (this.Impulses === undefined) {
      return undefined;
    }
    return this.Impulses.get(frameNumber);
  }

  public GetActiveBubblesForFrame(
    frameNumber: frameNumber,
    activeHBs: ActiveHitBubblesDTO
  ): ActiveHitBubblesDTO {
    const hitBubbleslength = this.HitBubbles.length;

    if (hitBubbleslength === 0) {
      return activeHBs;
    }

    for (let i = 0; i < hitBubbleslength; i++) {
      const hb = this.HitBubbles[i];
      if (hb.IsActive(frameNumber)) {
        activeHBs.AddBubble(hb);
      }
    }
    return activeHBs;
  }
}

export class AttackComponment {
  private readonly attacks = new Map<AttackId, Attack>();
  public readonly AABBs = new Map<AttackId, AABB>();
  private currentAttack: Attack | undefined = undefined;
  public readonly PlayerIdsHit = new Set<number>();

  public constructor(
    attacksConfigs: Map<AttackId, AttackConfig>,
    posRef: FlatVec,
    facingRight: () => boolean
  ) {
    attacksConfigs.forEach((ac) => {
      const atk = new Attack(ac, posRef, facingRight);
      this.attacks.set(ac.AttackId, atk);
    });
    this.attacks.forEach((atk) => {
      const aabb = BuildAABBFromAttack(atk);
      if (aabb !== false) {
        this.AABBs.set(atk.AttackId, aabb);
      }
    });
  }

  public GetAttack(): Attack | undefined {
    return this.currentAttack;
  }

  public SetCurrentAttack(gameEventId: GameEventId): void {
    const attackId = AttackGameEventMappings.get(gameEventId);
    if (attackId === undefined) {
      return;
    }
    const attack = this.attacks.get(attackId);
    if (attack === undefined) {
      return;
    }
    this.currentAttack = attack;
  }

  public ZeroCurrentAttack(): void {
    if (this.currentAttack === undefined) {
      return;
    }
    this.ResetPlayerIdsHit();
    this.currentAttack = undefined;
  }

  public HitPlayer(playerID: number): void {
    this.PlayerIdsHit.add(playerID);
  }

  public HasHitPlayer(playerID: number): boolean {
    return this.PlayerIdsHit.has(playerID);
  }

  public ResetPlayerIdsHit(): void {
    this.PlayerIdsHit.clear();
  }

  public get _attacks(): Map<AttackId, Attack> {
    return this.attacks;
  }

  public set CompState(history: ATKHist) {
    this.currentAttack =
      history.atkId !== undefined ? this.attacks.get(history.atkId) : undefined;
    this.PlayerIdsHit.clear();
    for (const p of history.playersHit) {
      this.PlayerIdsHit.add(p);
    }
  }
}

export type ATKHist = {
  atkId: AttackId | undefined;
  playersHit: Set<number>;
};

function BuildAABBFromAttack(attack: Attack): AABB | false {
  if (attack.HitBubbles.length === 0) {
    return false;
  }

  const bubs = attack.HitBubbles;
  let minX = MAX_RAW_VALUE;
  let minY = MAX_RAW_VALUE;
  let maxX = MIN_RAW_VALUE;
  let maxY = MIN_RAW_VALUE;
  let width = 0;
  let height = 0;

  bubs.forEach((hb) => {
    hb.frameOffsets.forEach((off) => {
      minX = Math.min(minX, off.X.Raw - hb.Radius.Raw);
      minY = Math.min(minY, off.Y.Raw - hb.Radius.Raw);
      maxX = Math.max(maxX, off.X.Raw + hb.Radius.Raw);
      maxY = Math.max(maxY, off.Y.Raw + hb.Radius.Raw);
    });
  });
  width = maxX - minX;
  height = maxY - minY;
  return { minXRaw: minX, minYRaw: minY, widthRaw: width, heightRaw: height };
}
