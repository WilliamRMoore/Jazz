import { objectToMap } from './configConverter';

const config = {
  MaxAtkBubblesPerPlayer: 25,
  MaxHurtBubblesPerPlayer: 25,
  MaxGrabBubblesPerPlayer: 25,
  MaxSensorsPerPlayer: 25,
  MaxHurtCapsulesPerPlayer: 25,
  PoolSizes: {
    PooledVectorCount: 1000,
    CollisionResultCount: 500,
    ProjectionResultCount: 500,
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
  State: {
    MaxFrameStorage: 1000,
  },
};

export type MainConfig = Map<string, number | string>;

export const envConfig = objectToMap(config);
