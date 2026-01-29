import { Command } from '../engine/command/command';
import {
  StateId,
  AttackId,
  GrabId,
} from '../engine/finite-state-machine/stateConfigurations/shared';

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
  LedgeBoxYOffset: number;
  Attacks: Map<AttackId, AttackConfig>;
  Grabs: Map<GrabId, GrabConfig>;
  Weight: number;
  ShieldRadius: number;
  ShieldYOffset: number;
  GroundedVelocityDecay: number;
  AerialVelocityDecay: number;
  AerialSpeedInpulseLimit: number;
  AerialSpeedMultiplier: number;
  AirDodgeSpeed: number;
  DodgeRollSpeed: number;
  MaxWalkSpeed: number;
  MaxRunSpeed: number;
  DashMutiplier: number;
  MaxDashSpeed: number;
  WalkSpeedMulitplier: number;
  RunSpeedMultiplier: number;
  FastFallSpeed: number;
  FallSpeed: number;
  Gravity: number;
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
  onUpdateCommands: Map<number, Array<Command>>;
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
  private onUpdateCommands = new Map<number, Array<Command>>();
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
    impulseClamp: number | undefined = undefined,
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

  public WithOnEnterCommand(command: Command): AttackConfigBuilder {
    this.onEnterCommands.push(command);
    return this;
  }

  public WithOnUpdateEvent(
    frameNumber: number,
    command: Command,
  ): AttackConfigBuilder {
    if (!this.onUpdateCommands.has(frameNumber)) {
      this.onUpdateCommands.set(frameNumber, [command]);
    } else {
      this.onUpdateCommands.get(frameNumber)!.push(command);
    }
    return this;
  }

  public WithOnExitEvent(command: Command): AttackConfigBuilder {
    this.onExitCommands.push(command);
    return this;
  }

  public WithHitBubble(
    damage: number,
    radius: number,
    priority: number,
    launchAngle: number,
    frameOffsets: Map<frameNumber, ConfigVec>,
  ): AttackConfigBuilder {
    const hitBubId = this.hitBubbles.length;

    if (hitBubId >= 25) {
      throw new Error('CANNOT HAVE MORE THAN 25 HIT BUBBLES PER ATTACK!');
    }
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

export type GrabBubbleConfig = {
  BubbleId: number;
  Radius: number;
  frameOffsets: Map<frameNumber, ConfigVec>;
};

export type GrabConfig = {
  Name: string;
  GrabId: number;
  TotalFrameLength: number;
  ImpulseClamp: number | undefined;
  Impulses: Map<frameNumber, ConfigVec> | undefined;
  GrabBubbles: Array<GrabBubbleConfig>;
};

export class GrabConfigBuilder {
  private grabId: GrabId = 0;
  private name: string = '';
  private totalFrames: number = 0;
  private impulseClamp: number | undefined;
  private impulses: Map<frameNumber, ConfigVec> | undefined;
  private grabBubbles: Array<GrabBubbleConfig> = [];

  constructor(name: string) {
    this.name = name;
  }

  public WithGrabId(grabId: GrabId): GrabConfigBuilder {
    this.grabId = grabId;
    return this;
  }

  public WithTotalFrames(totalFrames: number): GrabConfigBuilder {
    this.totalFrames = totalFrames;
    return this;
  }

  public WithImpulses(
    impulses: Map<frameNumber, ConfigVec>,
    impulseClamp: number | undefined = undefined,
  ): GrabConfigBuilder {
    this.impulses = impulses;
    this.impulseClamp = impulseClamp !== undefined ? impulseClamp : undefined;
    return this;
  }

  public WithGrabBubble(
    radius: number,
    frameOffsets: Map<frameNumber, ConfigVec>,
  ): GrabConfigBuilder {
    const grabBubId = this.grabBubbles.length;
    if (grabBubId >= 25) {
      throw new Error('CANNOT HAVE MORE THAN 25 GRAB BUBBLES PER GRAB!');
    }
    const grabBub: GrabBubbleConfig = {
      BubbleId: grabBubId,
      Radius: radius,
      frameOffsets: frameOffsets,
    };
    this.grabBubbles.push(grabBub);
    return this;
  }

  public Build(): GrabConfig {
    if (this.grabId == undefined) {
      throw new Error('GRAB ID CANNOT BE NULL!');
    }
    const grabConf: GrabConfig = {
      Name: this.name,
      GrabId: this.grabId,
      TotalFrameLength: this.totalFrames,
      ImpulseClamp: this.impulseClamp,
      Impulses: this.impulses,
      GrabBubbles: this.grabBubbles,
    };

    return grabConf;
  }
}
