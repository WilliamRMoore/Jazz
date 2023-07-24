import { DataConnection, Peer } from 'peerjs';
import { keys } from '../input/SimpleInput';

const peer = new Peer();

peer.on('open', (id) => {
  document.getElementById('mypeerid')!.innerHTML = `<p>${id}</p>`;
});

let connection = {} as DataConnection;

document.getElementById('hostgame').addEventListener('click', () => {
  document.getElementById('hostcontrols').style.display = 'block';
  document.getElementById('hostorconnect').style.display = 'none';
  peer.on('connection', (c) => {
    console.log('connection open');
    c.on('open', () => {
      c.send('hello from host');
    });
    c.on('data', (d) => {
      console.log(d);
    });
    c.on('error', (e) => {
      console.log(e);
    });
    connection = c;
    tick();
  });
});

document.getElementById('connectgame').addEventListener('click', () => {
  document.getElementById('connectcontrols').style.display = 'block';
  document.getElementById('hostorconnect').style.display = 'none';
  document.getElementById('connectToPeer').addEventListener('click', () => {
    let peerId = (document.getElementById('peerid') as HTMLInputElement).value;
    connection = peer.connect(peerId);
    connection.on('open', () => {
      connection.send('hello from client');
    });
    connection.on('data', (d) => {
      console.log(d);
    });
    tick();
  });
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
    connection.send('d');
  } else if (keys.a.pressed) {
    connection.send('a');
  } else if (keys.w.pressed) {
    connection.send('w');
  } else if (keys.s.pressed) {
    connection.send('s');
  } else {
    connection.send('no input');
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
