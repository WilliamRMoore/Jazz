import { ComponentHistory } from '../entity/componentHistory';
import { frameNumber } from '../entity/components/attack';
import { Player } from '../entity/playerOrchestrator';
import { World } from '../world/world';

export function RecordHistory(w: World): void {
  const playerData = w.PlayerData;
  const historyData = w.HistoryData;
  const frameNumber = w.LocalFrame;
  const playerCount = playerData.PlayerCount;
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const p = playerData.Player(playerIndex);
    const history = historyData.PlayerComponentHistories[playerIndex];
    record(p, history, frameNumber);
  }
  w.SetPoolHistory();
}

function record(p: Player, h: ComponentHistory, fn: frameNumber) {
  h.ShieldHistory[fn] = p.Shield.SnapShot();
  h.PositionHistory[fn] = p.Position.SnapShot();
  h.FsmInfoHistory[fn] = p.FSMInfo.SnapShot();
  h.DamageHistory[fn] = p.Damage.SnapShot();
  h.VelocityHistory[fn] = p.Velocity.SnapShot();
  h.FlagsHistory[fn] = p.Flags.SnapShot();
  h.PlayerHitStopHistory[fn] = p.HitStop.SnapShot();
  h.PlayerHitStunHistory[fn] = p.HitStun.SnapShot();
  h.LedgeDetectorHistory[fn] = p.LedgeDetector.SnapShot();
  h.SensorsHistory[fn] = p.Sensors.SnapShot();
  h.EcbHistory[fn] = p.ECB.SnapShot();
  h.JumpHistroy[fn] = p.Jump.SnapShot();
  h.AttackHistory[fn] = p.Attacks.SnapShot();
  h.GrabHistory[fn] = p.Grabs.SnapShot();
  h.GrabMeterHistory[fn] = p.GrabMeter.SnapShot();
}

export function InitPlayerHistory(p: Player, w: World) {
  const pId = p.ID;
  const hist = w.HistoryData.PlayerComponentHistories[pId];
  const lastFrame = w.LocalFrame === 0 ? 0 : w.LocalFrame - 1;
  const lastLastFrame = lastFrame === 0 ? 0 : lastFrame - 1;
  record(p, hist, lastFrame);
  record(p, hist, lastLastFrame);
}
