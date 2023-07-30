import { DataConnection, Peer } from 'peerjs';
import { keys } from '../input/SimpleInput';

let remoteInputBuffer = Array<KeyInput>();
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
    c.on('open', () => {
      c.send('Hello from Host');
    });

    c.on('data', (remoteData) => {
      console.log(remoteData);
    });
    SetUpDataSendLoop(c);
  });
}

function ConnectToRemotePeer(
  remotePeerId: string,
  localPeer: Peer
): DataConnection {
  let connection = localPeer.connect(remotePeerId);

  connection.on('open', () => {
    connection.send('Hello Frome Client.');
  });

  connection.on('data', (remoteData) => {
    //let remoteInput = remoteData as KeyInput
    console.log(remoteData);
  });

  return connection;
}

let frame = 0;

export function Run() {
  Init();
}

function Init() {
  // connection.on('open', () => {
  //   connection.send('hi');
  //   //tick();
  // });
  //PeerInput();
  //tick();
}

type KeyInput = {
  action: string;
  inputFrame: number;
};

function GetKey(inputFrame: number): KeyInput {
  if (keys.d.pressed) {
    return { action: 'd', inputFrame };
  } else if (keys.a.pressed) {
    return { action: 'a', inputFrame };
  } else if (keys.w.pressed) {
    return { action: 'w', inputFrame };
  } else if (keys.s.pressed) {
    return { action: 's', inputFrame };
  } else {
    return { action: 'n/a', inputFrame };
  }
}

function SendDataToPeer(c: DataConnection, keyInput: any) {
  c.send(keyInput);
}

const FPS = 2;
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
    SendDataToPeer(c, localInput);
    frame++;
    then = now - (delta % interval);
  }
}
