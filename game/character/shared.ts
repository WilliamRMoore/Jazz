import { Command } from '../engine/command/command';
import {
  StateId,
  AttackId,
} from '../engine/finite-state-machine/playerStates/shared';

type frameNumber = number;

export type ConfigVec = {
  x: number;
  y: number;
};

export type ECBShape = {
  readonly height: number;
  readonly width: number;
  readonly yOffset: number;
};

export type ECBShapesConfig = Map<StateId, ECBShape>;

export type HurtCapsuleConfig = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  radius: number;
};

export type SpeedsComponentConfig = {
  groundedVelocityDecay: number;
  aerialVelocityDecay: number;
  aerialSpeedInpulseLimit: number;
  aerialSpeedMultiplier: number;
  airDodgeSpeed: number;
  dodgeRollSpeed: number;
  maxWalkSpeed: number;
  maxRunSpeed: number;
  dashMutiplier: number;
  maxDashSpeed: number;
  walkSpeedMulitplier: number;
  runSpeedMultiplier: number;
  fastFallSpeed: number;
  fallSpeed: number;
  gravity: number;
};

export type CharacterConfig = {
  FrameLengths: Map<StateId, number>;
  ECBHeight: number;
  ECBWidth: number;
  ECBOffset: number;
  ECBShapes: ECBShapesConfig;
  HurtCapsules: Array<HurtCapsuleConfig>;
  JumpVelocity: number;
  NumberOfJumps: number;
  LedgeBoxHeight: number;
  LedgeBoxWidth: number;
  ledgeBoxYOffset: number;
  attacks: Map<AttackId, AttackConfig>;
  Weight: number;
  ShieldRadius: number;
  ShieldYOffset: number;
  groundedVelocityDecay: number;
  aerialVelocityDecay: number;
  aerialSpeedInpulseLimit: number;
  aerialSpeedMultiplier: number;
  airDodgeSpeed: number;
  dodgeRollSpeed: number;
  maxWalkSpeed: number;
  maxRunSpeed: number;
  dashMutiplier: number;
  maxDashSpeed: number;
  walkSpeedMulitplier: number;
  runSpeedMultiplier: number;
  fastFallSpeed: number;
  fallSpeed: number;
  gravity: number;
};

export type HitBubblesConifg = {
  BubbleId: number;
  Damage: number;
  Priority: number;
  Radius: number;
  LaunchAngle: number;
  frameOffsets: Map<frameNumber, ConfigVec>;
};

export type AttackConfig = {
  Name: string;
  AttackId: number;
  TotalFrameLength: number;
  InteruptableFrame: number;
  GravityActive: boolean;
  BaseKnockBack: number;
  KnockBackScaling: number;
  ImpulseClamp: number | undefined;
  Impulses: Map<frameNumber, ConfigVec> | undefined;
  CanOnlyFallOffLedgeIfFacingAwayFromIt: boolean;
  HitBubbles: Array<HitBubblesConifg>;
  onEnterCommands: Array<Command>;
  onUpdateCommands: Map<number, Command>;
  onExitCommands: Array<Command>;
};

export class AttackConfigBuilder {
  private attackId: AttackId = 0;
  private name: string = '';
  private totalFrames: number = 0;
  private interuptableFrame: number = 0;
  private hasGravtity: boolean = true;
  private baseKnockBack: number = 0;
  private knockBackScaling: number = 0;
  private impulseClamp: number | undefined;
  private impulses: Map<frameNumber, ConfigVec> | undefined;
  private hitBubbles: Array<HitBubblesConifg> = [];
  private canOnlyFallOffLedgeIfFacingAwayFromIt: boolean = false;
  private onEnterCommands: Array<Command> = [];
  private onUpdateCommands = new Map<number, Command>();
  private onExitCommands: Array<Command> = [];

  constructor(name: string) {
    this.name = name;
  }

  public WithAttackId(attackId: AttackId): AttackConfigBuilder {
    this.attackId = attackId;
    return this;
  }

  public WithTotalFrames(totalFrames: number): AttackConfigBuilder {
    this.totalFrames = totalFrames;
    return this;
  }

  public WithImpulses(
    impulses: Map<frameNumber, ConfigVec>,
    impulseClamp: number | undefined = undefined
  ): AttackConfigBuilder {
    this.impulses = impulses;
    this.impulseClamp = impulseClamp !== undefined ? impulseClamp : undefined;
    return this;
  }

  public WithInteruptableFrame(interuptFrame: number): AttackConfigBuilder {
    this.interuptableFrame = interuptFrame;
    return this;
  }

  public WithGravity(gravity: boolean): AttackConfigBuilder {
    this.hasGravtity = gravity;
    return this;
  }

  public CanOnlyFallOffLedgeIfFacingIt(): AttackConfigBuilder {
    this.canOnlyFallOffLedgeIfFacingAwayFromIt = true;
    return this;
  }

  public WithBaseKnockBack(baseKb: number): AttackConfigBuilder {
    this.baseKnockBack = baseKb;
    return this;
  }

  public WithKnockBackScaling(kbScaling: number): AttackConfigBuilder {
    this.knockBackScaling = kbScaling;
    return this;
  }

  public WithOnEnterCommand(event: Command): AttackConfigBuilder {
    this.onEnterCommands.push(event);
    return this;
  }

  public WithOnUpdateEvent(
    frameNumber: number,
    event: Command
  ): AttackConfigBuilder {
    this.onUpdateCommands.set(frameNumber, event);
    return this;
  }

  public WithOnExitEvent(event: Command): AttackConfigBuilder {
    this.onExitCommands.push(event); // = event;
    return this;
  }

  public WithHitBubble(
    damage: number,
    radius: number,
    priority: number,
    launchAngle: number,
    frameOffsets: Map<frameNumber, ConfigVec>
  ): AttackConfigBuilder {
    const hitBubId = this.hitBubbles.length;

    const hitBub: HitBubblesConifg = {
      BubbleId: hitBubId,
      Damage: damage,
      Priority: priority,
      Radius: radius,
      LaunchAngle: launchAngle,
      frameOffsets: frameOffsets,
    };

    this.hitBubbles.push(hitBub);

    return this;
  }

  public Build(): AttackConfig {
    if (this.attackId == undefined) {
      throw new Error('ATTACK ID CANNOT BE NULL!');
    }
    const atkConf: AttackConfig = {
      Name: this.name,
      AttackId: this.attackId,
      TotalFrameLength: this.totalFrames,
      InteruptableFrame: this.interuptableFrame,
      GravityActive: this.hasGravtity,
      BaseKnockBack: this.baseKnockBack,
      KnockBackScaling: this.knockBackScaling,
      ImpulseClamp: this.impulseClamp,
      Impulses: this.impulses,
      CanOnlyFallOffLedgeIfFacingAwayFromIt:
        this.canOnlyFallOffLedgeIfFacingAwayFromIt,
      HitBubbles: this.hitBubbles,
      onEnterCommands: this.onEnterCommands,
      onUpdateCommands: this.onUpdateCommands,
      onExitCommands: this.onExitCommands,
    };

    return atkConf;
  }
}
