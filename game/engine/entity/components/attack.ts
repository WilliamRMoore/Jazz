import { HitBubblesConifg, AttackConfig } from '../../../character/shared';
import { Command } from '../../command/command';
import { AttackGameEventMappings } from '../../finite-state-machine/PlayerStates';
import {
  AttackId,
  GameEventId,
} from '../../finite-state-machine/stateConfigurations/shared';
import { FixedPoint } from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { ActiveHitBubblesDTO } from '../../pools/ActiveAttackBubbles';
import { Pool } from '../../pools/Pool';
import { PooledVector } from '../../pools/PooledVector';
import { ToFV } from '../../utils';
import { IHistoryEnabled } from '../componentHistory';

type bubbleId = number;
export type frameNumber = number;

export class HitBubble {
  public readonly BubbleId: bubbleId;
  public readonly Damage = new FixedPoint(0);
  public readonly Priority: number;
  public readonly Radius = new FixedPoint(0);
  public readonly launchAngle = new FixedPoint(0);
  public readonly activeFrames = new Set<number>();
  public readonly frameOffsets = new Map<frameNumber, FlatVec>();

  constructor(hbc: HitBubblesConifg) {
    this.BubbleId = hbc.BubbleId;
    this.Damage.SetFromNumber(hbc.Damage);
    this.Priority = hbc.Priority;
    this.Radius.SetFromNumber(hbc.Radius);
    this.launchAngle.SetFromNumber(hbc.LaunchAngle);
    for (const [k, v] of hbc.frameOffsets) {
      this.frameOffsets.set(k, ToFV(v.x, v.y));
      this.activeFrames.add(k);
    }
  }

  public IsActive(attackFrameNumber: frameNumber): boolean {
    return this.activeFrames.has(attackFrameNumber);
  }

  public GetLocalPosiitionOffsetForFrame(
    frameNumber: frameNumber,
  ): FlatVec | undefined {
    return this.frameOffsets.get(frameNumber);
  }

  public GetGlobalPosition(
    vecPool: Pool<PooledVector>,
    playerX: FixedPoint,
    playerY: FixedPoint,
    facinRight: boolean,
    attackFrameNumber: frameNumber,
  ): PooledVector | undefined {
    const offset = this.frameOffsets.get(attackFrameNumber);

    if (offset === undefined) {
      return undefined;
    }

    const xRaw = playerX.Raw;
    const yRaw = playerY.Raw;

    const globalXRaw = facinRight ? xRaw + offset.X.Raw : xRaw - offset.X.Raw;
    const globalYRaw = yRaw + offset.Y.Raw;

    return vecPool.Rent().SetXYRaw(globalXRaw, globalYRaw);
  }
}

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

  constructor(conf: AttackConfig) {
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

    const hbs = conf.HitBubbles.map((hbc) => new HitBubble(hbc));
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
    activeHBs: ActiveHitBubblesDTO,
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

export type AttackSnapShot = {
  attack: Attack | undefined;
  playersHit: Array<number> | undefined;
};

export class AttackComponment implements IHistoryEnabled<AttackSnapShot> {
  private readonly attacks: Map<AttackId, Attack>;
  private currentAttack: Attack | undefined = undefined;
  public readonly PlayerIdsHit = new Set<number>();

  public constructor(attacksConfigs: Map<AttackId, AttackConfig>) {
    const attacks = new Map<AttackId, Attack>();
    attacksConfigs.forEach((ac) => {
      const atk = new Attack(ac);
      attacks.set(ac.AttackId, atk);
    });
    this.attacks = attacks;
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

  public SnapShot(): AttackSnapShot {
    const snapShot = {
      attack: undefined,
      playersHit: undefined,
    } as AttackSnapShot;
    if (this.currentAttack !== undefined) {
      snapShot.attack = this.currentAttack;
    }
    if (this.PlayerIdsHit.size > 0) {
      snapShot.playersHit = Array.from(this.PlayerIdsHit);
    }
    return snapShot;
  }

  public SetFromSnapShot(snapShot: AttackSnapShot): void {
    this.currentAttack = snapShot.attack;
    this.PlayerIdsHit.clear();
    if (snapShot.playersHit !== undefined) {
      for (let i = 0; i < snapShot.playersHit.length; i++) {
        this.PlayerIdsHit.add(snapShot.playersHit[i]);
      }
    } else {
      this.PlayerIdsHit.clear();
    }
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
}
