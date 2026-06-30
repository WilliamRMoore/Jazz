import { ThrowConfig } from '../../../character/shared';
import { StateId } from '../../finite-state-machine/stateConfigurations/shared';
import { NumberToRaw } from '../../math/fixedPoint';
import { FlatVec } from '../../physics/vector';
import { ToFV } from '../../utils';

export class PlayerThrow {
  public readonly Name: string;
  private readonly MoveOps: FlatVec[];
  public readonly LaucnhAngle: number;
  public readonly baseKnockBack: number;
  public readonly knockBackScaling: number;
  public readonly TotalFrames: number;
  public readonly Damage: number;
  public readonly ReleaseFrame: number;

  constructor(config: ThrowConfig) {
    this.Name = config.Name;
    this.MoveOps = [];
    config.MoveOps.forEach((moveOp) => {
      this.MoveOps.push(ToFV(moveOp.x, moveOp.y));
    });
    this.LaucnhAngle = NumberToRaw(config.LaunchAngle);
    this.baseKnockBack = NumberToRaw(config.BaseKnockBack);
    this.knockBackScaling = NumberToRaw(config.KnockBackScaling);
    this.TotalFrames = config.TotalFrames;
    this.Damage = NumberToRaw(config.Damage);
    this.ReleaseFrame = config.ReleaseFrame;
  }

  public GetMoveOpForFrame(frame: number): FlatVec | undefined {
    if (frame < this.MoveOps.length) {
      return this.MoveOps[frame];
    }
    return undefined;
  }
}

export class ThrowComponent {
  private readonly Throws: Map<StateId, PlayerThrow>;

  constructor(throwCCs: ThrowConfig[]) {
    this.Throws = new Map<StateId, PlayerThrow>();
    throwCCs.forEach((t) => {
      this.Throws.set(t.StateId, new PlayerThrow(t));
    });
  }
  public GetThrowForState(stateId: StateId): PlayerThrow | undefined {
    return this.Throws.get(stateId);
  }
}
