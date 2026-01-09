import { InputAction } from '../../input/Input';
import { InputStoreLocal } from '../engine-state-management/Managers';
import { ComponentHistory, PlayerSnapShot } from '../entity/componentHistory';
import { frameNumber } from '../entity/components/attack';
import {
  Player,
  SetPlayerPosition,
  SetPlayerPositionRaw,
} from '../entity/playerOrchestrator';
import { StateMachine } from '../finite-state-machine/PlayerStateMachine';
import { StateId } from '../finite-state-machine/stateConfigurations/shared';
import { NumberToRaw } from '../math/fixedPoint';
import { World } from '../world/world';

const ntr = NumberToRaw;

export class PlayerDebugAdapter {
  private world: World;
  private hist: ComponentHistory;
  private player: Player;
  private pId: number;
  private stateMachine: StateMachine;
  private inputStore: InputStoreLocal<InputAction>;

  constructor(p: Player, w: World) {
    this.player = p;
    this.world = w;
    this.stateMachine = w.PlayerData.StateMachine(p.ID);
    this.inputStore = w.PlayerData.InputStore(p.ID);
    this.hist = w.HistoryData.PlayerComponentHistories[p.ID];
    this.pId = p.ID;
  }

  public get Player(): Player | undefined {
    return this.player;
  }

  public ForceState(stateId: StateId) {
    this.stateMachine.ForceState(stateId);
  }

  public SetInputs(inputs: Map<frameNumber, InputAction>) {
    inputs.forEach((v, k) => {
      this.inputStore.StoreInputForFrame(k, v);
    });
  }

  public MoveTo(x: number, y: number) {
    SetPlayerPositionRaw(this.player, ntr(x), ntr(y));
  }

  public ForceStateFrame(frame: frameNumber) {
    this.player.FSMInfo._currentStateFrame = frame;
  }

  public LookLeft() {
    this.player.Flags.FaceLeft();
  }

  public LookRight() {
    this.player.Flags.FaceRight();
  }

  public set VelX(velX: number) {
    this.player.Velocity.X.SetFromRaw(ntr(velX));
  }

  public set VelY(velY: number) {
    this.player.Velocity.Y.SetFromRaw(ntr(velY));
  }

  public GetPlayerDataForFrame(frame: frameNumber) {
    const hist = this.hist;

    const pd = {
      Shield: hist.ShieldHistory[frame],
      Position: hist.PositionHistory[frame],
      FSMInfo: hist.FsmInfoHistory[frame],
      Damage: hist.DamageHistory[frame],
      Velocity: hist.VelocityHistory[frame],
      Flags: hist.FlagsHistory[frame],
      PlayerHitStop: hist.PlayerHitStopHistory[frame],
      PlayerHitStun: hist.PlayerHitStunHistory[frame],
      LedgeDetector: hist.LedgeDetectorHistory[frame],
      Sensors: hist.SensorsHistory[frame],
      Ecb: hist.EcbHistory[frame],
      Jump: hist.JumpHistroy[frame],
      Attack: hist.AttackHistory[frame],
      Grab: hist.GrabHistory[frame],
      GrabMeter: hist.GrabMeterHistory[frame],
    } as PlayerSnapShot;

    return pd;
  }

  public get LiveStateData(): PlayerSnapShot {
    const p = this.player;
    const pd = {
      Shield: p.Shield.SnapShot(),
      Position: p.Position.SnapShot(),
      FSMInfo: p.FSMInfo.SnapShot(),
      Damage: p.Damage.SnapShot(),
      Velocity: p.Velocity.SnapShot(),
      Flags: p.Flags.SnapShot(),
      PlayerHitStop: p.HitStop.SnapShot(),
      PlayerHitStun: p.HitStun.SnapShot(),
      LedgeDetector: p.LedgeDetector.SnapShot(),
      Sensors: p.Sensors.SnapShot(),
      Ecb: p.ECB.SnapShot(),
      Jump: p.Jump.SnapShot(),
      Attack: p.Attacks.SnapShot(),
      Grab: p.Grabs.SnapShot(),
      GrabMeter: p.GrabMeter.SnapShot(),
    } as PlayerSnapShot;
    return pd;
  }
}
