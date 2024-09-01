import { ECS, Entity } from '../../ECS/ECS';
import { ctx } from '../../Globals/globals';
import { ECSBuilderExtension } from '../../ECS/Extensions/ECSBuilderExtensions';
import { InputStorageManager } from '../../input/InputStorageManager';
import {
  GetInput,
  InputAction,
  InputActionPacket,
  InvalidGuessSpec,
  listenForGamePadInput,
} from '../../input/GamePadInput';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { InitStageManinComponent } from '../../ECS/Components/StageMain';
import { StageCollisionSystem } from '../../ECS/Systems/StageCollisionSystem';
import { LedgeDetectionSystem } from '../../ECS/Systems/LedgeDetectionSystem';
import { GravitySystem } from '../../ECS/Systems/GravitySystem';
import { EcsStateMachine, MakeStateMachine } from '../State/EcsStateMachine';
import { DrawSystem } from '../../ECS/Systems/DrawSystem';
import { VelocityECSSystem } from '../../ECS/Systems/VelocitySystem';

export function initLoop() {
  console.log('init');
  const lctx = CreateContext();
  listenForGamePadInput();
}

function Logic(lctx: loopCtx) {
  let currentFrame = lctx.FSM.LocalFrame;
  const localInput: InputActionPacket<InputAction> = {
    input: GetInput(),
    frame: currentFrame,
    frameAdvantage: 0,
    hash: 'oui!',
  };

  TickEngine(lctx, localInput);
}

function TickEngine(lctx: loopCtx, ia: InputActionPacket<InputAction>) {
  lctx.ISM.StoreLocalInput(ia, ia.frame);
}

function CreateContext() {
  const ecs = new ECS();
  const extension = new ECSBuilderExtension();
  ecs.ExtendEcs(extension);

  const playerEnt = extension.BuildDefaultPlayer();
  const players = new Array<Entity>();
  players.push(playerEnt);

  const stageEnt = ecs.CreateEntity();
  stageEnt.Attach(InitStageManinComponent());
  const ISM = new InputStorageManager(InvalidGuessSpec);
  const FSM = new FrameStorageManager();
  const SCS = new StageCollisionSystem(stageEnt, players);
  const LDS = new LedgeDetectionSystem(stageEnt, players);
  const PGS = new GravitySystem(ecs);
  const PVS = new VelocityECSSystem(players);
  const DS = new DrawSystem(players, stageEnt, ctx);
  const SM = MakeStateMachine(playerEnt);
  const SMArray = new Array<EcsStateMachine>();
  SMArray.push(SM);

  const loopContext = {
    ISM,
    FSM,
    SCS,
    LDS,
    PGS,
    PVS,
    DS,
    SMArray,
  } as loopCtx;

  return loopContext;
}

type loopCtx = {
  ISM: InputStorageManager<InputActionPacket<InputAction>>;
  FSM: FrameStorageManager;
  SCS: StageCollisionSystem;
  PGS: GravitySystem;
  PVS: VelocityECSSystem;
  DS: DrawSystem;
  SMArray: Array<EcsStateMachine>;
  LDS: LedgeDetectionSystem;
  //PSHM: PlayerStateHistoryManager;
};
