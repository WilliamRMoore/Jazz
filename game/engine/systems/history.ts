import { Command } from '../command/command';
import { envConfig } from '../config/main-config';
import { ComponentHistory } from '../entity/componentHistory';
import { frameNumber } from '../entity/components/attack';
import { Player } from '../entity/playerOrchestrator';
import {
  AttackId,
  GRAB_IDS,
  GrabId,
  STATE_IDS,
} from '../finite-state-machine/stateConfigurations/shared';
import { FlatVec } from '../physics/vector';
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
  const curFrame = w.LocalFrame;
  const hist = w.HistoryData.PlayerComponentHistories[pId];
  for (let i = 0; i <= curFrame; i++) {
    record(p, hist, i);
  }
}

export function RecordHistory2() {}

class PlayerStateHistory {
  // pos
  posXRaw = 0;
  posYRaw = 0;
  // vel
  velXRaw = 0;
  velYRaw = 0;
  // damage
  damageRaw = 0;
  // flags
  facingRight = false;
  fasFalling = false;
  hitPauseFrames = 0;
  intangabilityFrames = 0;
  disablePlatformDetection = 0;
  velocityDecayActive = true;
  shieldJump = false;
  // jump
  jumpCount = 0;
  // FSM
  stateId = STATE_IDS.IDLE_S;
  stateFrame = 0;
  // hitStop
  hitStopFrames = 0;
  // hitStun
  hitStunFrames = 0;
  hitStunVxRaw = 0;
  hitStunVyRaw = 0;
  hitStunNextStateId = STATE_IDS.IDLE_S;
  // grab
  grabId: GrabId | undefined = undefined;
  // grabMeter
  grabMeter = 0;
  holdingPlayerId: number | undefined = undefined;
  // shield
  shieldActive = false;
  shieldRadiusRaw = 0;
  shieldTiltXRaw = 0;
  shieldTiltYRaw = 0;
  // sensors
  sensors: Array<{
    xOffset: number;
    yOffset: number;
    radius: number;
    active: boolean;
  }> = new Array<{
    xOffset: number;
    yOffset: number;
    radius: number;
    active: boolean;
  }>(envConfig.get('MaxSensorsPerPlayer') as number);
  sensorReactor: Command | undefined = undefined;
  // hold
  heldPlayerId: number | undefined = undefined;
  // ledge detector
  ldgMidXRaw = 0;
  ldgMdyRaw = 0;
  ldGrabCount = 0;
  ldgGrbdLdg: FlatVec[] | undefined = undefined;
  //
  atkId: AttackId | undefined = undefined;
  playersHit: Set<number> = new Set<number>();
  //
}
