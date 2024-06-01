import { ECS } from '../../ECS/ECS';
import { ECSBuilderExtension } from '../../ECS/Extensions/ECSBuilderExtensions';
import { InputStorageManager } from '../../input/InputStorageManager';
import {
  InputAction,
  InputActionPacket,
  InvalidGuessSpec,
} from '../../input/GamePadInput';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { FrameComparisonManager } from '../../network/FrameComparisonManager';
import { RollBackManager } from '../../network/rollBackManager';
import { SyncroManager } from '../../network/SyncroManager';

export function initLoop() {
  console.log('init');
  const ecs = new ECS();
  const extension = new ECSBuilderExtension();
  extension.Visit(ecs);

  const playerEnt = extension.BuildDefaultPlayer();
  const ism = new InputStorageManager(InvalidGuessSpec);
  const fsm = new FrameStorageManager();
  const syncMan = initSynchroManager(
    fsm,
    ism,
    (frameAdvantage, frame) => {
      let def = {
        input: {
          Action: 'idle',
          LXAxis: 0,
          LYAxis: 0,
          RYAxis: 0,
          RXAxis: 0,
        },
        frame,
        frameAdvantage,
        hash: '',
      } as InputActionPacket<InputAction>;
      return def;
    },
    (inputAction: InputActionPacket<InputAction>, frame: number) => {
      let n = {
        input: inputAction.input,
        frame,
        frameAdvantage: inputAction.frameAdvantage,
        hash: inputAction.hash,
      } as InputActionPacket<InputAction>;
      return n;
    }
  );
}

function initSynchroManager<Type>(
  fsm: FrameStorageManager,
  ism: InputStorageManager<Type>,
  defaultInputFactory: (frameAdvantage: number, frame: number) => Type,
  guessToRealCopy: (item: Type, frame: number) => Type
) {
  const FCM = new FrameComparisonManager(ism, fsm);
  const RBM = new RollBackManager<Type>(FCM, fsm);

  const syncMan = new SyncroManager<Type>(
    fsm,
    ism,
    FCM,
    RBM,
    guessToRealCopy,
    defaultInputFactory
  );
  return syncMan;
}
