import { InputStorageManager } from '../input/InputStorageManager';
import { FrameComparisonManager } from '../network/FrameComparisonManager';
import { FrameStorageManager } from '../network/FrameStorageManager';
import { RollBackManager } from '../network/rollBackManager';
import { SyncroManager } from '../network/SyncroManager';

export type InvalidGuessSpec<Type> = (guess: Type, real: Type) => boolean;
export type DefaultInputFactory<Type> = (
  frameAdvantage: number,
  frame: number
) => Type;

export function BuildSynchroService<Type>(
  igs: InvalidGuessSpec<Type>,
  dif: DefaultInputFactory<Type>
) {
  const FSM = new FrameStorageManager();
  const ISM = new InputStorageManager<Type>(igs);
  const FCM = new FrameComparisonManager<Type>(ISM, FSM);
  const RBM = new RollBackManager<Type>(FCM, FSM);

  const SM = new SyncroManager<Type>(FSM, ISM, FCM, RBM, dif);

  return SM;
}
