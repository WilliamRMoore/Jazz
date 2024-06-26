import { DataConnection } from 'peerjs';

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

export type DataHandler = (remoteData: unknown) => void;
export type ConnectionHandler = (connnection: DataConnection) => void;
