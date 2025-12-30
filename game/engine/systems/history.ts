import { World, PlayerData, HistoryData } from '../world/world';

export function RecordHistory(
  w: World,
  playerData: PlayerData,
  historyData: HistoryData,
  frameNumber: number
): void {
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const history = historyData.PlayerComponentHistories[playerIndex];
    history.ShieldHistory[frameNumber] = p.Shield.SnapShot();
    history.PositionHistory[frameNumber] = p.Position.SnapShot();
    history.FsmInfoHistory[frameNumber] = p.FSMInfo.SnapShot();
    history.PlayerPointsHistory[frameNumber] = p.Damage.SnapShot();
    history.VelocityHistory[frameNumber] = p.Velocity.SnapShot();
    history.FlagsHistory[frameNumber] = p.Flags.SnapShot();
    history.PlayerHitStopHistory[frameNumber] = p.HitStop.SnapShot();
    history.PlayerHitStunHistory[frameNumber] = p.HitStun.SnapShot();
    history.LedgeDetectorHistory[frameNumber] = p.LedgeDetector.SnapShot();
    history.SensorsHistory[frameNumber] = p.Sensors.SnapShot();
    history.EcbHistory[frameNumber] = p.ECB.SnapShot();
    history.JumpHistroy[frameNumber] = p.Jump.SnapShot();
    history.AttackHistory[frameNumber] = p.Attacks.SnapShot();
    history.GrabHistory[frameNumber] = p.Grabs.SnapShot();
    history.GrabMeterHistory[frameNumber] = p.GrabMeter.SnapShot();
  }
  w.SetPoolHistory();
}
