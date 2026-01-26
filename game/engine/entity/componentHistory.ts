import { Player } from './playerOrchestrator';
import { AttackSnapShot } from './components/attack';
import { ECBSnapShot } from './components/ecb';
import { FlagsSnapShot } from './components/flags';
import { FSMInfoSnapShot } from './components/fsmInfo';
import { LedgeDetectorSnapShot } from './components/ledgeDetector';
import { PositionSnapShot } from './components/position';
import { SensorSnapShot } from './components/sensor';
import { ShieldSnapShot } from './components/shield';
import { VelocitySnapShot } from './components/velocity';
import { hitStunSnapShot } from './components/hitStun';
import { DamageSnapShot } from './components/damage';
import { hitStopSnapShot } from './components/hitStop';
import { GrabSnapShot } from './components/grab';
import { GrabMeterSnapShot } from './components/grabMeter';
import { DebugSnapShot } from './components/debug';
import { HurtCapsule } from './components/hurtCircles';

export class BaseConfigValues {
  public ledgDetecorHeight: number = 0;
  public LedgeDetectorWidth: number = 0;
  public HurtCapsules: Array<HurtCapsule> = [];
  public ShieldOffset: number = 0;
}

export type PlayerSnapShot = {
  Shield: ShieldSnapShot;
  Position: PositionSnapShot;
  FSMInfo: FSMInfoSnapShot;
  Damage: DamageSnapShot;
  Velocity: VelocitySnapShot;
  Flags: FlagsSnapShot;
  PlayerHitStop: hitStopSnapShot;
  PlayerHitStun: hitStunSnapShot;
  LedgeDetector: LedgeDetectorSnapShot;
  Sensors: SensorSnapShot;
  Ecb: ECBSnapShot;
  Jump: number;
  Attack: AttackSnapShot;
  Grab: GrabSnapShot;
  GrabMeter: GrabMeterSnapShot;
};

export class ComponentHistory {
  // readonly _deb_hist: DebugSnapShot[] | undefined;
  readonly BaseConfigValues = new BaseConfigValues();
  readonly ShieldHistory: Array<ShieldSnapShot> = [];
  readonly PositionHistory: Array<PositionSnapShot> = [];
  readonly FsmInfoHistory: Array<FSMInfoSnapShot> = [];
  readonly DamageHistory: Array<DamageSnapShot> = [];
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
    p.Damage.SetFromSnapShot(this.DamageHistory[frameNumber]);
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
