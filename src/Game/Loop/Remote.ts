import { FlatVec } from '../../Physics/FlatVec';
import { DataConnection, Peer } from 'peerjs';
import {
  ConfigureConnectionsFactory,
  ConnectionConfiguratorOLD,
} from '../../network/Host';
import { ctx } from '../../Globals/globals';
import { InputStorageManager } from '../../input/InputStorageManager';
import { PlayerVelocitySystem } from '../Velocity/PlayerVelocitySystem';
import { PlayerGravitySystem } from '../Gravity/PlayerGravitySystem';
import { FrameComparisonManager } from '../../network/FrameComparisonManager';
import { RollBackManager } from '../../network/rollBackManager';
import { AddDebug, debugComs } from '../../input/DebugInput';
import { FrameStorageManager } from '../../network/FrameStorageManager';
import { StageCollisionSystem } from '../Collision/StageCollisionSystem';
import { LedgeDetectionSystem } from '../Collision/LedgeDetectionSystem';
import { StateMachine } from '../State/StateMachine';
import { DrawSystem } from '../Draw/DrawSystem';
import { DefaultECB } from '../ECB';
import { Player } from '../Player/Player';
import { PlayerStateHistoryManager } from '../GameState/PlayerStateHistoryManager';
import Stage from '../../classes/Stage';
import {
  GetInput,
  InputAction,
  InputActionPacket,
  InvalidGuessSpec,
  listenForGamePadInput,
} from '../../input/GamePadInput';
import {
  idle,
  walk,
  ledgeGrab,
  turnWalk,
  run,
  jumpSquat,
  jump,
  neutralFall,
} from '../../Game/State/CharacterStates/Test';
import { SyncroManager } from '../../network/SyncroManager';

type loopCtx = {
  ISM: InputStorageManager<InputActionPacket<InputAction>>;
  FSM: FrameStorageManager;
  playersArr: Array<Player>;
  SMArray: Array<StateMachine>;
  SCS: StageCollisionSystem;
  PGS: PlayerGravitySystem;
  PVS: PlayerVelocitySystem;
  DS: DrawSystem;
  LDS: LedgeDetectionSystem;
  PSHM: PlayerStateHistoryManager;
  SyncMan: SyncroManager<InputActionPacket<InputAction>>;
};

let con: DataConnection;
const peer = new Peer();
let host = false;
let LOOPCONTEXT: loopCtx;

export function initLoop() {
  console.log('Twice?');
  debugger;
  //AddDebug();
  const P1 = initPlayer(new FlatVec(600, 100));
  const P2 = initPlayer(new FlatVec(800, 100));
  const ISM = initISM();
  const FSM = initFSM();
  const SyncMan = initSynchroManager(FSM, ISM);
  const P1SM = initSM(P1, SyncMan);
  const P2SM = initSM(P2, SyncMan);
  setupSM(P1SM);
  setupSM(P2SM);

  const playersArr = new Array<Player>();
  playersArr.push(P1);
  playersArr.push(P2);

  const SMArray = new Array<StateMachine>();
  SMArray.push(P1SM);
  SMArray.push(P2SM);

  const stage = initStage();
  const SCS = initSCS(playersArr, stage);
  const PGS = initPGS(playersArr, 0.5);
  const PVS = initPVS(playersArr);
  const DS = initDS(playersArr, stage, ctx);
  const LDS = initLDS(playersArr, stage, SMArray);
  const PSHM = initPSHM(playersArr, SMArray, FSM);

  listenForGamePadInput();

  LOOPCONTEXT = {
    ISM,
    FSM,
    playersArr,
    SMArray,
    SCS,
    PGS,
    PVS,
    DS,
    LDS,
    PSHM,
    SyncMan,
  };

  let connectionConfigurator = ConfigureConnectionsFactory(
    (c: DataConnection) => {
      LOOP(LOOPCONTEXT); // <- entry
    },
    (rd: unknown) => {
      let remoteInput = rd as InputActionPacket<InputAction>;
      ISM.StoreRemoteInput(remoteInput, remoteInput.frame);
      FSM.RemoteFrame = remoteInput.frame;
      FSM.RemoteFrameAdvantage = remoteInput.frameAdvantage;
    }
  );

  peer.on('connection', (c) => {
    connectionConfigurator(c);
    con = c;
  });

  peer.on('open', (id) => {
    document.getElementById('mypeerid')!.innerHTML = `<p>${id}</p>`;
  });

  document.getElementById('hostgame')!.addEventListener('click', () => {
    document.getElementById('hostcontrols')!.style.display = 'block';
    document.getElementById('hostorconnect')!.style.display = 'none';
    host = true;
    P1SM.IsRemote(false);
    P2SM.IsRemote(true);
  });

  document.getElementById('connectgame')!.addEventListener('click', () => {
    document.getElementById('connectcontrols')!.style.display = 'block';
    document.getElementById('hostorconnect')!.style.display = 'none';

    document.getElementById('connectToPeer')!.addEventListener('click', () => {
      host = false;
      P1SM.IsRemote(true);
      P2SM.IsRemote(false);
      let connectionId = (document.getElementById('peerid') as HTMLInputElement)
        .value;
      let c = peer.connect(connectionId);
      connectionConfigurator(c);
      con = c;
    });
  });
}

//LOOP(LOOPCONTEXT);

const FPS = 60;
let frame = 0;
let now = {} as number;
let then = Date.now();
const interval = 1000 / FPS;
let delta = {} as number;

function LOOP(lctx: loopCtx) {
  window.requestAnimationFrame(() => LOOP(lctx));
  now = Date.now();
  delta = now - then;
  ctx.clearRect(0, 0, 1920, 1080);
  if (delta > interval) {
    debugger;
    Logic(lctx);

    lctx.DS.Draw();
  }
}

function initSynchroManager(
  fsm: FrameStorageManager,
  ism: InputStorageManager<InputActionPacket<InputAction>>
): SyncroManager<InputActionPacket<InputAction>> {
  const FCM = new FrameComparisonManager(ism, fsm);
  const RBM = new RollBackManager<InputActionPacket<InputAction>>(FCM, fsm);
  const defaultInputFactory = (frameAdvantage: number, frame: number) => {
    let def = {
      input: {
        Action: 'idle',
        LXAxsis: 0,
        LYAxsis: 0,
        RYAxsis: 0,
        RXAxis: 0,
      },
      frame,
      frameAdvantage,
    } as InputActionPacket<InputAction>;
    return def;
  };

  const syncMan = new SyncroManager(fsm, ism, FCM, RBM, defaultInputFactory);

  return syncMan;
}

function initPlayer(postion: FlatVec, faceRight = true) {
  const ECB = DefaultECB();
  const maxXVelocity = 1000;
  const maxYVelocity = 1000;
  const groundDecay = 0.8;
  const arialDecay = 0.8;
  const playerPosition = postion;
  const jumpVelocity = 20;
  const numberOfJumps = 2;
  const facingRight = faceRight;
  const maxWalkSpeed = 12;
  const maxRunSpeed = 18;
  const arialImpulseLimit = 18;

  const P = new Player(
    ECB,
    maxXVelocity,
    maxYVelocity,
    groundDecay,
    arialDecay,
    playerPosition,
    jumpVelocity,
    numberOfJumps,
    facingRight,
    maxWalkSpeed,
    maxRunSpeed,
    arialImpulseLimit
  );
  P.Grounded = false;
  return P;
}

function initStage() {
  let stageVecs = new Array<FlatVec>();

  stageVecs.push(
    new FlatVec(510, 600),
    new FlatVec(1410, 600),
    new FlatVec(1410, 640),
    new FlatVec(510, 640)
  );

  const stage = new Stage(stageVecs);

  return stage;
}

function initISM() {
  const ISM = new InputStorageManager<InputActionPacket<InputAction>>(
    InvalidGuessSpec
  );
  return ISM;
}

function initFSM() {
  return new FrameStorageManager();
}

function initSM(
  p: Player,
  //ism: InputStorageManager<InputActionPacket<InputAction>>,
  syncMan: SyncroManager<InputActionPacket<InputAction>>
) {
  return new StateMachine(p, syncMan);
}

function initSCS(playersArr: Array<Player>, stage: Stage) {
  return new StageCollisionSystem(playersArr, stage);
}

function initPGS(playersArr: Array<Player>, grav = 0.5) {
  return new PlayerGravitySystem(playersArr, grav);
}

function initDS(
  playersArr: Array<Player>,
  stage: Stage,
  ctx: CanvasRenderingContext2D
) {
  return new DrawSystem(playersArr, stage, ctx);
}

function initPVS(playersArr: Array<Player>) {
  return new PlayerVelocitySystem(playersArr);
}

function initLDS(
  playersArr: Array<Player>,
  stage: Stage,
  smArr: Array<StateMachine>
) {
  return new LedgeDetectionSystem(playersArr, stage, smArr);
}

function initPSHM(
  playersArr: Array<Player>,
  smArr: Array<StateMachine>,
  FSM: FrameStorageManager
) {
  return new PlayerStateHistoryManager(playersArr, smArr, FSM);
}

function setupSM(sm: StateMachine) {
  sm.AddState('idle', idle);
  sm.AddState('walk', walk);
  sm.AddState('jump', jump);
  sm.AddState('neutralFall', neutralFall);
  sm.AddState(ledgeGrab.name, ledgeGrab);
  sm.AddState(jumpSquat.name, jumpSquat);
}

function Logic(lctx: loopCtx) {
  lctx.SyncMan.UpdateNextSynFrame();

  if (lctx.SyncMan.ShouldRollBack()) {
    console.log(lctx.SyncMan.GetCurrentSyncFrame());
    rollBack(lctx);
  }

  if (lctx.SyncMan.IsWithinFrameAdvantage()) {
    lctx.SyncMan.SetLocalFrameNumber(frame);
    const localInput = GetInput();
    const localInputPacket = {
      input: localInput,
      frame: lctx.SyncMan.GetLocalFrameNumber(),
      frameAdvantage: lctx.SyncMan.GetLocalFrameAdvantage(),
    } as InputActionPacket<InputAction>;

    lctx.SyncMan.StoreLocalInput(localInputPacket, frame);
    //con send
    if (host) {
      handleLocalInput(lctx.playersArr[0], localInput, lctx.SMArray[0]);
    } else {
      handleLocalInput(lctx.playersArr[1], localInput, lctx.SMArray[1]);
    }

    con.send(localInputPacket);

    let remoteInput = lctx.SyncMan.GetOrGuessRemoteInputForFrame(frame);

    if (host) {
      handleRemoteInput(lctx.playersArr[1], remoteInput.input, lctx.SMArray[1]);
    } else {
      handleRemoteInput(lctx.playersArr[0], remoteInput.input, lctx.SMArray[0]);
    }
    UpdateSM(lctx.SMArray);
    lctx.PGS.ApplyGravity();
    lctx.PVS.UpdateVelocity();
    lctx.LDS.CheckForLedge();
    lctx.SCS.handle();
    updatePlayersPreviousePosition(lctx.playersArr);
    lctx.PSHM.RecordStateSnapShot();
    frame++;
  } else {
    console.log('stalling');
  }
}

function handleLocalInput(
  localPlayer: Player,
  input: InputAction,
  localPlayerStateMachine: StateMachine
) {
  HandleInput(localPlayer, input, localPlayerStateMachine);
}

function handleRemoteInput(
  remotePlayer: Player,
  remoteInput: InputAction,
  remotePlayerStateMachine: StateMachine
) {
  HandleInput(remotePlayer, remoteInput, remotePlayerStateMachine);
}

function HandleInput(player: Player, input: InputAction, SM: StateMachine) {
  if (!player.LedgeGrab) {
    if (input.Action == 'run') {
      if (player.Grounded) {
        SM.SetState('walk');
      }
      if (!player.Grounded) {
        SM.SetState('neutralFall');
      }
    } else if (input.Action == 'jump') {
      //debugger;
      player.CurrentStateMachineState == 'jump'
        ? SM.SetState('jump')
        : player.Grounded
        ? SM.SetState('jumpSquat')
        : SM.SetState('jump');
    } else {
      if (player.Grounded) {
        SM.SetState('idle');
      } else {
        SM.SetState('neutralFall');
      }
    }
  } else {
    if (input.Action == 'jump') {
      SM.SetState('jump');
    }
  }
}

function UpdateSM(smArr: Array<StateMachine>) {
  let l = smArr.length;
  for (let i = 0; i < l; i++) {
    smArr[i].Update();
  }
}

function updatePlayersPreviousePosition(playersArr: Array<Player>) {
  const length = playersArr.length;

  for (let i = 0; i < length; i++) {
    const p = playersArr[i];
    p.PreviousPlayerPosition.X = p.PlayerPosition.X;
    p.PreviousPlayerPosition.Y = p.PlayerPosition.Y;
  }
}

function rollBack(lctx: loopCtx) {
  debugger;
  let syncFrame = lctx.SyncMan.GetCurrentSyncFrame();
  let currentFrame = lctx.SyncMan.GetLocalFrameNumber();
  lctx.FSM.LocalFrame = syncFrame;
  lctx.PSHM.SetPlayerStateToFrame(syncFrame);

  for (let i = syncFrame; i < currentFrame; i++) {
    lctx.SyncMan.UpdateNextSynFrame();
    lctx.FSM.LocalFrame = i;

    let localInput = lctx.SyncMan.GetLocalInput(i);
    let remoteInput = lctx.SyncMan.GetOrGuessRemoteInputForFrame(i);

    if (host) {
      handleLocalInput(lctx.playersArr[0], localInput.input, lctx.SMArray[0]);
    } else {
      handleLocalInput(lctx.playersArr[1], localInput.input, lctx.SMArray[1]);
    }

    if (host) {
      handleRemoteInput(lctx.playersArr[1], remoteInput.input, lctx.SMArray[1]);
    } else {
      handleRemoteInput(lctx.playersArr[0], remoteInput.input, lctx.SMArray[0]);
    }
    UpdateSM(lctx.SMArray);
    lctx.PGS.ApplyGravity();
    lctx.PVS.UpdateVelocity();
    lctx.LDS.CheckForLedge();
    lctx.SCS.handle();
    updatePlayersPreviousePosition(lctx.playersArr);
    lctx.PSHM.RecordStateSnapShot();
  }
}
