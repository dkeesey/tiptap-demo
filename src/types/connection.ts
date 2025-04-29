import { WebrtcProvider } from 'y-webrtc';
import { Doc as YDoc } from 'yjs';

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export interface ConnectionMetadata {
  state: ConnectionState;
  peers: number;
  lastSync: Date | null;
  errorMessage?: string;
}

export interface ConnectionDebuggerProps {
  webrtcProvider: WebrtcProvider;
  ydoc: YDoc;
}
