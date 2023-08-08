import { DataConnection } from 'peerjs';

// export function CreatePeer(
//   onConnectionHandler: ConnectionHandler,
//   dataHandler: DataHandler
// ) {
//   let localPeer = new Peer();
//   localPeer.on('connection', (c) => {
//     c.on('open', () => {
//       console.log('Connected!');
//       onConnectionHandler(c);
//     });
//     c.on('data', (remoteData) => {
//       dataHandler(remoteData);
//     });
//   });

//   return localPeer;
// }
let confOnOpen: ConnectionHandler;
let confOnData: DataHandler;

export function ConfigureConnectionsFactory(
  onOpen: ConnectionHandler,
  onData: DataHandler
) {
  confOnOpen = onOpen;
  confOnData = onData;
  return ConnectionConfigurator;
}

function ConnectionConfigurator(c: DataConnection) {
  c.on('open', () => {
    confOnOpen(c);
  });
  c.on('data', (remoteData) => {
    confOnData(remoteData);
  });
}

export function ConnectionConfiguratorOLD(
  c: DataConnection,
  connectionHandler: ConnectionHandler,
  dataHandler: DataHandler
) {
  c.on('open', () => {
    connectionHandler(c);
  });
  c.on('data', (rd) => {
    dataHandler(rd);
  });
}

export type DataHandler = (remoteData: unknown) => void;
export type ConnectionHandler = (connnection: DataConnection) => void;
