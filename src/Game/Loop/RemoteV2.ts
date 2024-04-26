import { FrameStorageManager } from '../../network/FrameStorageManager';
import { InitISM, InputStorageManager } from '../../input/InputStorageManager';
import { SyncroManager, initSynchroManager } from '../../network/SyncroManager';
import {
  GetInput,
  HandleInput,
  InputAction,
  InputActionPacket,
  InvalidGuessSpec,
  listenForGamePadInput,
} from '../../input/GamePadInput';
import { DataConnection, Peer } from 'peerjs';
import LoopExec from './LoopExecuter';
import { FlatVec } from '../../Physics/FlatVec';
import { ConfigureConnectionsFactory } from '../../network/Host';
import { ctx } from '../../Globals/globals';
import { PlayerVelocitySystem } from '../Velocity/PlayerVelocitySystem';
import { PlayerGravitySystem } from '../Gravity/PlayerGravitySystem';
import { StageCollisionSystem } from '../Collision/StageCollisionSystem';
import { LedgeDetectionSystem } from '../Collision/LedgeDetectionSystem';
import { InitSM, StateMachine } from '../State/StateMachine';
import { DrawSystem } from '../Draw/DrawSystem';
import { InitPlayer, Player } from '../Player/Player';
import { PlayerStateHistoryManager } from '../GameState/PlayerStateHistoryManager';
import { InitStage } from '../../classes/Stage';

type loopCtx = {
  IsHost: boolean;
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

export function initLoop() {
  console.log('init!');
  const P1 = InitPlayer(new FlatVec(600, 100));
  const P2 = InitPlayer(new FlatVec(800, 100));
  const ISM = InitISM(InvalidGuessSpec);
  const FSM = new FrameStorageManager();
  const SyncMan = initSynchroManager(
    FSM,
    ISM,
    (frameAdvantage, frame) => {
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
  const p1sm = InitSM(P1);
  const p2sm = InitSM(P2);

  const playersArr = new Array<Player>();
  playersArr.push(P1);
  playersArr.push(P2);

  const SMArray = new Array<StateMachine>();
  SMArray.push(p1sm);
  SMArray.push(p2sm);

  const stage = InitStage();
  const SCS = new StageCollisionSystem(playersArr, stage);
  const LDS = new LedgeDetectionSystem(playersArr, stage, SMArray);
  const PGS = new PlayerGravitySystem(playersArr, 0.5);
  const PVS = new PlayerVelocitySystem(playersArr);
  const DS = new DrawSystem(playersArr, stage, ctx);
  const PSHM = new PlayerStateHistoryManager(playersArr, SMArray);

  const lctx = {
    IsHost: false,
    ISM,
    FSM,
    SCS,
    LDS,
    PGS,
    PVS,
    DS,
    PSHM,
    SyncMan,
    playersArr,
    SMArray,
  } as loopCtx;

  listenForGamePadInput();
  let remoteLoop = () => LoopExec(() => RemoteLogic(lctx));
  let localLoop = () => LoopExec(() => LocalLogic(lctx));
  initControl(lctx, remoteLoop, localLoop);
}

function initControl(
  lctx: loopCtx,
  remoteLoop: () => void,
  localLoop: () => void
) {
  let connectionConfigurator = ConfigureConnectionsFactory(
    (c: DataConnection) => {
      // <- entry
      remoteLoop();
    },
    (rd: unknown) => {
      let remoteInput = rd as InputActionPacket<InputAction>;
      if (remoteInput.input.Action != 'default') {
        debugger;
      }
      lctx.ISM.StoreRemoteInput(remoteInput, remoteInput.frame);
      lctx.FSM.RemoteFrame = remoteInput.frame;
      lctx.FSM.RemoteFrameAdvantage = remoteInput.frameAdvantage;
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
    lctx.IsHost = true;
  });

  document.getElementById('localGame')!.addEventListener('click', () => {
    document.getElementById('hostcontrols')!.style.display = 'block';
    document.getElementById('hostorconnect')!.style.display = 'none';
    lctx.IsHost = true;
    localLoop();
  });

  document.getElementById('connectgame')!.addEventListener('click', () => {
    document.getElementById('connectcontrols')!.style.display = 'block';
    document.getElementById('hostorconnect')!.style.display = 'none';

    document.getElementById('connectToPeer')!.addEventListener('click', () => {
      lctx.IsHost = false;
      let connectionId = (document.getElementById('peerid') as HTMLInputElement)
        .value;
      let c = peer.connect(connectionId);
      connectionConfigurator(c);
      con = c;
    });
  });
}

function LocalLogic(lctx: loopCtx) {
  let frameNumber = lctx.SyncMan.GetLocalFrameNumber();
  const player1 = lctx.playersArr[0];
  const player1SM = lctx.SMArray[0];
  const p1Input = GetInput();
  const localInputPacket = {
    input: p1Input,
    frame: frameNumber,
    frameAdvantage: 0,
  } as InputActionPacket<InputAction>;

  lctx.ISM.StoreLocalInput(localInputPacket, frameNumber);
  HandleInput(player1, p1Input, player1SM);
  player1SM.Update(p1Input);

  lctx.PGS.ApplyGravity();
  lctx.PVS.UpdateVelocity();
  lctx.LDS.CheckForLedge();
  lctx.SCS.handle();
  updatePlayersPreviousePosition(lctx.playersArr);
  lctx.PSHM.RecordStateSnapShot(frameNumber);
  lctx.SyncMan.IncrementLocalFrameNumber();
  lctx.DS.Draw();
  document.getElementById('frameCounter')!.innerHTML = `<p>${frameNumber}</p>`;
}

function RemoteLogic(lctx: loopCtx) {
  let frameNumber = lctx.SyncMan.GetLocalFrameNumber();

  lctx.SyncMan.UpdateNextSyncFrame();

  if (lctx.SyncMan.ShouldRollBack()) {
    //execute rollback
    let syncFrame = lctx.SyncMan.GetCurrentSyncFrame();

    rollBack(syncFrame, frameNumber, lctx);
  }
  if (!lctx.SyncMan.ShouldStall()) {
    //Execute Loop Normally
    const localPlayer = getLocalPlayer(lctx);
    const localSM = getLocalSM(lctx);
    const remotePlayer = getRemotePlayer(lctx);
    const remoteSM = getRemoteSM(lctx);

    const localInput = GetInput();
    const localInputPacket = {
      input: localInput,
      frame: lctx.SyncMan.GetLocalFrameNumber(),
      frameAdvantage: lctx.SyncMan.GetLocalFrameAdvantage(),
    } as InputActionPacket<InputAction>;

    lctx.ISM.StoreLocalInput(localInputPacket, frameNumber);

    let remoteInputPacket =
      lctx.SyncMan.GetRemoteInputForLoopFrame(frameNumber);
    let remoteInput = remoteInputPacket.input;

    if (remoteInput.Action != 'default') {
      debugger;
    }

    HandleInput(localPlayer, localInput, localSM);
    //HandleInput(remotePlayer, remoteInput, remoteSM);

    localSM.Update(localInput);

    remoteSM.SetState(remoteInput);
    remoteSM.Update(remoteInput);

    lctx.PGS.ApplyGravity();
    lctx.PVS.UpdateVelocity();
    lctx.LDS.CheckForLedge();
    lctx.SCS.handle();
    updatePlayersPreviousePosition(lctx.playersArr);
    lctx.PSHM.RecordStateSnapShot(frameNumber);

    con.send(localInputPacket);

    lctx.SyncMan.IncrementLocalFrameNumber();
    lctx.DS.Draw();
    document.getElementById(
      'frameCounter'
    )!.innerHTML = `<p>${frameNumber}</p>`;
  } else {
    // console.log(lctx.SyncMan.GetCurrentSyncFrame());
    console.log('Stalling');
  }
}

function rollBack(from: number, to: number, lctx: loopCtx) {
  const localPlayer = getLocalPlayer(lctx);
  const localSM = getLocalSM(lctx);
  const remotePlayer = getRemotePlayer(lctx);
  const remoteSM = getRemoteSM(lctx);
  lctx.PSHM.SetPlayerStateToFrame(from, getLocalPlayerIndex(lctx));
  lctx.PSHM.SetPlayerStateToFrame(from, getRemotePlayerIndex(lctx));

  from++;
  while (from < to) {
    let localInput = lctx.ISM.GetLocalInputForFrame(from);
    let remoteInput = lctx.SyncMan.GetRemoteInputForRollBack(from);

    HandleInput(localPlayer, localInput.input, localSM);
    //HandleInput(remotePlayer, remoteInput.input, remoteSM);

    localSM.Update(localInput.input);

    remoteSM.SetState(remoteInput.input);
    remoteSM.Update(remoteInput.input);

    lctx.PGS.ApplyGravity();
    lctx.PVS.UpdateVelocity();
    lctx.LDS.CheckForLedge();
    lctx.SCS.handle();
    updatePlayersPreviousePosition(lctx.playersArr);
    lctx.PSHM.RecordStateSnapShot(from);

    from++;
  }
}

function getLocalPlayer(lctx: loopCtx) {
  if (lctx.IsHost) {
    return lctx.playersArr[0];
  }
  return lctx.playersArr[1];
}

function getLocalPlayerIndex(lctx: loopCtx) {
  return lctx.IsHost ? 0 : 1;
}

function getRemotePlayer(lctx: loopCtx) {
  if (lctx.IsHost) {
    return lctx.playersArr[1];
  }
  return lctx.playersArr[0];
}

function getRemotePlayerIndex(lctx: loopCtx) {
  return lctx.IsHost ? 1 : 0;
}

function getLocalSM(lctx: loopCtx) {
  if (lctx.IsHost) {
    return lctx.SMArray[0];
  }
  return lctx.SMArray[1];
}

function getRemoteSM(lctx: loopCtx) {
  if (lctx.IsHost) {
    return lctx.SMArray[1];
  }
  return lctx.SMArray[0];
}

function updatePlayersPreviousePosition(playersArr: Array<Player>) {
  const length = playersArr.length;

  for (let i = 0; i < length; i++) {
    const p = playersArr[i];
    p.PreviousPlayerPosition.X = p.PlayerPosition.X;
    p.PreviousPlayerPosition.Y = p.PlayerPosition.Y;
  }
}

function actionHeldFromLastFrameLocal(
  ISM: InputStorageManager<InputActionPacket<InputAction>>,
  frameNumber: number
): boolean {
  if (frameNumber === 0) {
    return false;
  }
  let now = ISM.GetLocalInputForFrame(frameNumber);
  let before = ISM.GetLocalInputForFrame(frameNumber--);

  return now.input.Action == before.input.Action;
}

function actionHeldFromLastFrameRemote(
  ISM: InputStorageManager<InputActionPacket<InputAction>>,
  frameNumber: number
): boolean {
  if (frameNumber === 0) {
    return false;
  }
  // let now = ISM.GetRemoteInputForFrame(frameNumber);
  // let before = ISM.GetRemoteInputForFrame(frameNumber--);
  // return now.input.Action == before.input.Action;
  return false;
}
