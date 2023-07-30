import { DataConnection, Peer } from 'peerjs';
import { keys } from '../input/SimpleInput';

let remoteInputBuffer = Array<FrameInput>();
let localInputBuffer = Array<KeyInput>();

const peer = new Peer();

peer.on('open', (id) => {
  document.getElementById('mypeerid')!.innerHTML = `<p>${id}</p>`;
});

document.getElementById('hostgame').addEventListener('click', () => {
  document.getElementById('hostcontrols').style.display = 'block';
  document.getElementById('hostorconnect').style.display = 'none';
  BeginHost(peer);
});

document.getElementById('connectgame').addEventListener('click', () => {
  document.getElementById('connectcontrols').style.display = 'block';
  document.getElementById('hostorconnect').style.display = 'none';
  document.getElementById('connectToPeer').addEventListener('click', () => {
    let connectionId = (document.getElementById('peerid') as HTMLInputElement)
      .value;
    SetUpDataSendLoop(ConnectToRemotePeer(connectionId, peer));
  });
});

function BeginHost(localPeer: Peer) {
  localPeer.on('connection', (c) => {
    // c.on('open', () => {
    //   c.send('Hello from Host');
    // });

    c.on('data', (remoteData) => {
      //console.log(remoteData);
      AddRemoteInput(remoteData as KeyInput);
    });
    SetUpDataSendLoop(c);
  });
}

function ConnectToRemotePeer(
  remotePeerId: string,
  localPeer: Peer
): DataConnection {
  let connection = localPeer.connect(remotePeerId);

  // connection.on('open', () => {
  //   connection.send('Hello Frome Client.');
  // });

  connection.on('data', (remoteData) => {
    //let remoteInput = remoteData as KeyInput
    //console.log(remoteData);
    AddRemoteInput(remoteData as KeyInput);
  });

  return connection;
}

let frame = 0;

export function Run() {
  Init();
}

function Init() {}

type KeyInput = {
  action: string;
  inputFrame: number;
};

type FrameInput = {
  guessed: boolean;
  keyInput: KeyInput;
};

function GetKey(inputFrame: number): KeyInput {
  let localInput = {} as KeyInput;

  if (keys.d.pressed) {
    localInput = { action: 'd', inputFrame };
  } else if (keys.a.pressed) {
    localInput = { action: 'a', inputFrame };
  } else if (keys.w.pressed) {
    localInput = { action: 'w', inputFrame };
  } else if (keys.s.pressed) {
    localInput = { action: 's', inputFrame };
  } else {
    localInput = { action: 'n/a', inputFrame };
  }

  localInputBuffer[localInput.inputFrame] = localInput;

  return localInput;
}

function SendDataToPeer(c: DataConnection, keyInput: any) {
  c.send(keyInput);
}

const FPS = 60;
let now = {} as number;
let then = Date.now();
const interval = 1000 / FPS;
let delta = {} as number;

function SetUpDataSendLoop(c: DataConnection) {
  window.requestAnimationFrame(() => SetUpDataSendLoop(c));

  now = Date.now();
  delta = now - then;

  if (delta > interval) {
    let localInput = GetKey(frame);
    let remoteInput = GetCurrentRemoteInput(frame);
    console.log(remoteInput);
    SendDataToPeer(c, localInput);
    frame++;
    then = now - (delta % interval);
  }
}

function AddRemoteInput(input: KeyInput) {
  let checkFrame = remoteInputBuffer[input.inputFrame];

  if (checkFrame === undefined) {
    remoteInputBuffer[input.inputFrame] = {
      guessed: false,
      keyInput: input,
    } as FrameInput;
    return;
  }

  if (checkFrame.guessed) {
    if (CompareFrames(checkFrame, input)) {
      remoteInputBuffer[input.inputFrame].guessed = false;
      return;
    }

    console.log('INITIATE ROLLBACK!');
  }
}

function CompareFrames(guessedFrame: FrameInput, realFrame: KeyInput) {
  if (guessedFrame.keyInput.action === realFrame.action) {
    return true;
  }
  return false;
}

function GetCurrentRemoteInput(f: number) {
  let remoteInput = remoteInputBuffer[f];

  if (remoteInput !== undefined) {
    return remoteInput;
  }

  remoteInput = GetLastRemoteInput(f);
  remoteInput.guessed = true;
  remoteInputBuffer[f] = remoteInput;

  console.log('guessed');

  return remoteInput;
}

function GetLastRemoteInput(f: number) {
  // debugger;
  f--;

  let remoteInput = remoteInputBuffer[f];

  while (remoteInput === undefined && f >= 0) {
    f--;
    remoteInput = remoteInputBuffer[f];
  }

  if (remoteInput !== undefined) {
    return remoteInput;
  }

  return {
    guessed: true,
    keyInput: { action: 'n/a', inputFrame: f },
  } as FrameInput;
}
