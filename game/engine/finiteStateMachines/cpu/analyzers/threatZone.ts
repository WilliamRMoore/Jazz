import { Player } from '../../../entity/playerOrchestrator';
import { DistanceRaw } from '../../../math/fixedPoint';

export const IsPlayerWithinRange = (pA: Player, pB: Player, range: number) => {
  const myPostion = pA.Position;
  const therePosition = pB.Position;
  const dist = DistanceRaw(
    myPostion.X.Raw,
    myPostion.Y.Raw,
    therePosition.X.Raw,
    therePosition.Y.Raw
  );
  return dist <= range;
};
