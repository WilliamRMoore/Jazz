import {
  GAME_EVENT_IDS,
  STATE_IDS,
} from '../finite-state-machine/stateConfigurations/shared';
import { POINT_FIVE } from '../math/numberConstants';
import { LineSegmentIntersectionRaw } from '../physics/collisions';
import { World } from '../world/world';

export function WallSlide(w: World) {
  const pd = w.PlayerData;
  const pLength = pd.PlayerCount;
  const pools = w.Pools;
  for (let i = 0; i < pLength; i++) {
    const p = pd.Player(i);
    const stateId = p.FSMInfo.CurrentStatetId;
    if (stateId !== STATE_IDS.N_FALL_S || p.Velocity.Y.Raw < 0) {
      continue;
    }
    const stages = w.StageData.Stages;
    const stagesLength = stages.length;

    for (let stageIndex = 0; stageIndex < stagesLength; stageIndex++) {
      const stage = stages[stageIndex];
      const l = stage.StageVerticies.GetLeftWall()[0];
      const r = stage.StageVerticies.GetRightWall()[0];
      const ecb = p.ECB;
      const leftECBPoint = ecb.Left;
      const rightECBPoint = ecb.Right;
      const sensor = ecb.SensorDepth;
      const rightSensorPoint = pools.VecPool.Rent().SetXYRaw(
        rightECBPoint.X.Raw - sensor.Raw,
        rightECBPoint.Y.Raw,
      );
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
      const sm = pd.StateMachine(i);
      if (
        !rightCollision &&
        !leftCollision &&
        stateId === STATE_IDS.WALL_SLIDE_S
      ) {
        sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
        continue;
      }
      const is = pd.InputStore(i);
      const ia = is.GetInputForFrame(w.LocalFrame);
      if (rightCollision) {
        if (ia.LXAxis.Raw > POINT_FIVE) {
          p.Flags.FaceLeft();
          sm.UpdateFromWorld(GAME_EVENT_IDS.WALL_SLIDE_GE);
        }
      } else {
        if (ia.LXAxis.Raw < -POINT_FIVE) {
          p.Flags.FaceRight();
          sm.UpdateFromWorld(GAME_EVENT_IDS.WALL_SLIDE_GE);
        }
      }
    }
  }
}
