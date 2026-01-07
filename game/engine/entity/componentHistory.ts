import { Player } from './playerOrchestrator';
import { AttackSnapShot } from './components/attack';
import { ECBSnapShot } from './components/ecb';
import { FlagsSnapShot } from './components/flags';
import { FSMInfoSnapShot } from './components/fsmInfo';
import { HurtCapsule } from './components/hurtCircles';
import { LedgeDetectorSnapShot } from './components/ledgeDetector';
import { PositionSnapShot } from './components/position';
import { SensorSnapShot } from './components/sensor';
import { ShieldSnapShot } from './components/shield';
import { VelocitySnapShot } from './components/velocity';
import { hitStunSnapShot } from './components/hitStun';
import { PlayerPointsSnapShot } from './components/damage';
import { hitStopSnapShot } from './components/hitStop';
import { GrabSnapShot } from './components/grab';
import { GrabMeterSnapShot } from './components/grabMeter';

export class StaticHistory {
  public ledgDetecorHeight: number = 0;
  public LedgeDetectorWidth: number = 0;
  public HurtCapsules: Array<HurtCapsule> = [];
  public ShieldOffset: number = 0;
}

export class ComponentHistory {
  readonly StaticPlayerHistory = new StaticHistory();
  readonly ShieldHistory: Array<ShieldSnapShot> = [];
  readonly PositionHistory: Array<PositionSnapShot> = [];
  readonly FsmInfoHistory: Array<FSMInfoSnapShot> = [];
  readonly PlayerPointsHistory: Array<PlayerPointsSnapShot> = [];
  readonly PlayerHitStunHistory: Array<hitStunSnapShot> = [];
  readonly PlayerHitStopHistory: Array<hitStopSnapShot> = [];
  readonly VelocityHistory: Array<VelocitySnapShot> = [];
  readonly FlagsHistory: Array<FlagsSnapShot> = [];
  readonly EcbHistory: Array<ECBSnapShot> = [];
  readonly JumpHistroy: Array<number> = [];
  readonly LedgeDetectorHistory: Array<LedgeDetectorSnapShot> = [];
  readonly SensorsHistory: Array<SensorSnapShot> = [];
  readonly AttackHistory: Array<AttackSnapShot> = [];
  readonly GrabHistory: Array<GrabSnapShot> = [];
  readonly GrabMeterHistory: Array<GrabMeterSnapShot> = [];

  public SetPlayerToFrame(p: Player, frameNumber: number) {
    p.Shield.SetFromSnapShot(this.ShieldHistory[frameNumber]);
    p.Position.SetFromSnapShot(this.PositionHistory[frameNumber]);
    p.FSMInfo.SetFromSnapShot(this.FsmInfoHistory[frameNumber]);
    p.Velocity.SetFromSnapShot(this.VelocityHistory[frameNumber]);
    p.Damage.SetFromSnapShot(this.PlayerPointsHistory[frameNumber]);
    p.HitStop.SetFromSnapShot(this.PlayerHitStopHistory[frameNumber]);
    p.HitStun.SetFromSnapShot(this.PlayerHitStunHistory[frameNumber]);
    p.Flags.SetFromSnapShot(this.FlagsHistory[frameNumber]);
    p.ECB.SetFromSnapShot(this.EcbHistory[frameNumber]);
    p.LedgeDetector.SetFromSnapShot(this.LedgeDetectorHistory[frameNumber]);
    p.Sensors.SetFromSnapShot(this.SensorsHistory[frameNumber]);
    p.Jump.SetFromSnapShot(this.JumpHistroy[frameNumber]);
    p.Attacks.SetFromSnapShot(this.AttackHistory[frameNumber]);
    p.Grabs.SetFromSnapShot(this.GrabHistory[frameNumber]);
    p.GrabMeter.SetFromSnapShot(this.GrabMeterHistory[frameNumber]);
  }
}

export interface IHistoryEnabled<T> {
  SnapShot(): T;
  SetFromSnapShot(snapShot: T): void;
}
