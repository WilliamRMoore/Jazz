import {
  STATE_IDS
} from '../../finiteStateMachines/player/shared';
import { FixedPoint, NumberToRaw } from '../../math/fixedPoint';
import { JazzDebugger } from '../jazzDebugWrapper';

export function LaunchPlayerDownward(jazz: JazzDebugger, playerId: number) {
  const pd = jazz.World.PlayerData;
  const p = pd.Player(playerId);
  const sm = pd.StateMachine(p.ID);
  const currentY = p.Position.Y.Raw;
  const newY = currentY - NumberToRaw(100);
  p.Position.Y.SetFromRaw(newY);
  p.HitStun.NextStateId = STATE_IDS.LAUNCH_S;
  p.HitStun.SetHitStun(60, new FixedPoint(0), new FixedPoint(20));
  sm.ForceState(STATE_IDS.LAUNCH_S);
}
