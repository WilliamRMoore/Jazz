import { DataConnection, Peer } from 'peerjs';
import { keys } from '../input/SimpleInput';

const peer = new Peer();

peer.on('open', (id) => {
  document.getElementById('mypeerid')!.innerHTML = `<p>${id}</p>`;
});

peer.on('connection', (c) => {
  c.on('data', (d) => {
    console.log(d);
  });
  c.on('open', () => {
    c.send('hello');
  });
});

let connection = {} as DataConnection;

document.getElementById('connectToPeer').addEventListener('click', () => {
  debugger;
  let peerId = (document.getElementById('peerid') as HTMLInputElement).value;
  connection = peer.connect(peerId);
});

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

function tick() {
  window.requestAnimationFrame(tick);

  if (keys.d.pressed) {
    connection.send({ action: 'd', Frame: frame });
  }
  if (keys.a.pressed) {
    connection.send('a');
  }
  if (keys.w.pressed) {
    connection.send('w');
  }
  if (keys.s.pressed) {
    connection.send('s');
  }

  frame++;
}

function PeerInput() {
  peer.on('connection', (conn) => {
    conn.on('data', (data) => {
      console.log(data);
    });
    conn.on('open', () => {
      conn.send('Hello!');
    });
  });
}
