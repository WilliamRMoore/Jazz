import {
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../finite-state-machine/stateConfigurations/shared';
import { POINT_FOUR, POINT_SEVEN } from '../math/numberConstants';
import { LineSegmentIntersectionRaw } from '../physics/collisions';
import { World } from '../world/world';

export function WallKick(w: World) {
  const pd = w.PlayerData;
  const pLength = pd.PlayerCount;
  const pools = w.Pools;
  for (let i = 0; i < pLength; i++) {
    const p = pd.Player(i);
    const stateId = p.FSMInfo.CurrentStateId;
    if (stateId !== STATE_IDS.N_FALL_S) {
      continue;
    }
    const ecb = p.ECB;
    const leftECBPoint = ecb.Left;
    const rightECBPoint = ecb.Right;
    const sensor = ecb.SensorDepth;
    const rightSensorPoint = pools.VecPool.Rent().SetXYRaw(
      rightECBPoint.X.Raw - sensor.Raw,
      rightECBPoint.Y.Raw,
    );
    const stages = w.StageData.Stages;
    const stagesLength = stages.length;

    for (let stageIndex = 0; stageIndex < stagesLength; stageIndex++) {
      const stage = stages[stageIndex];
      const l = stage.StageVerticies.GetLeftWall()[0];
      const r = stage.StageVerticies.GetRightWall()[0];

      const leftSensorPoint = pools.VecPool.Rent().SetXYRaw(
        leftECBPoint.X.Raw + sensor.Raw,
        leftECBPoint.Y.Raw,
      );
      //RightPoint, left wall
      const rightCollision = LineSegmentIntersectionRaw(
        rightECBPoint.X.Raw,
        rightECBPoint.Y.Raw,
        rightSensorPoint.X.Raw,
        rightSensorPoint.Y.Raw,
        l.X1.Raw,
        l.Y1.Raw,
        l.X2.Raw,
        l.Y2.Raw,
      );
      //LeftPoint, right wall
      const leftCollision = LineSegmentIntersectionRaw(
        leftECBPoint.X.Raw,
        leftECBPoint.Y.Raw,
        leftSensorPoint.X.Raw,
        leftSensorPoint.Y.Raw,
        r.X1.Raw,
        r.Y1.Raw,
        r.X2.Raw,
        r.Y2.Raw,
      );

      if (rightCollision) {
        const is = pd.InputStore(i);
        const lastIa = is.GetInputForFrame(w.PreviousFrame);
        const curIa = is.GetInputForFrame(w.LocalFrame);
        if (lastIa.LXAxis.Raw >= 0 && curIa.LXAxis.Raw < -POINT_FOUR) {
          p.Flags.FaceLeft();
          const sm = pd.StateMachine(i);
          sm.UpdateFromWorld(GAME_EVENT_IDS.WALL_KICK_GE);
        }
      } else if (leftCollision) {
        const is = pd.InputStore(i);
        const lastIa = is.GetInputForFrame(w.PreviousFrame);
        const curIa = is.GetInputForFrame(w.LocalFrame);
        if (lastIa.LXAxis.Raw <= 0 && curIa.LXAxis.Raw > POINT_FOUR) {
          p.Flags.FaceRight();
          const sm = pd.StateMachine(i);
          sm.UpdateFromWorld(GAME_EVENT_IDS.WALL_KICK_GE);
        }
      }
    }
  }
}
