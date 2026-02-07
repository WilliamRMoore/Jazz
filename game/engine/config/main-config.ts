import { objectToMap } from './configConverter';

const config = {
  MaxAtkBubblesPerPlayer: 25,
  MaxHurtBubblesPerPlayer: 25,
  MaxGrabBubblesPerPlayer: 25,
  MaxSensorsPerPlayer: 10,
  PoolSizes: {
    PooledVectorCount: 1000,
    CollisionResultCount: 500,
    ProjectionResultCount: 300,
    AttackResultCount: 100,
    ClosestPointsResultCount: 500,
    ActiveHitBubblesDTOCount: 200,
    DiamondDTOCount: 50,
  },
  Physics: {
    MaxVelocity: 200,
  },
  NetWork: {
    MaxRollBackFrames: 100,
  },
};

export type MainConfig = Map<string, number | string>;

export const envConfig = objectToMap(config);
