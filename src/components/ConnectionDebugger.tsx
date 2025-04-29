import React, { useState, useEffect } from 'react';
import { WebrtcProvider } from 'y-webrtc';
import { Doc as YDoc } from 'yjs';

// Enum for connection states
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

// Interface for connection metadata
export interface ConnectionMetadata {
  state: ConnectionState;
  peers: number;
  lastSync: Date | null;
  errorMessage?: string;
}

// ConnectionDebugger component for tracking and displaying connection status
const ConnectionDebugger: React.FC<{
  webrtcProvider: WebrtcProvider;
  ydoc: YDoc;
}> = ({ webrtcProvider, ydoc }) => {
  const [connectionMetadata, setConnectionMetadata] = useState<ConnectionMetadata>({
    state: ConnectionState.DISCONNECTED,
    peers: 0,
    lastSync: null
  });

  useEffect(() => {
    // Track connection states
    const handleConnectionOpen = () => {
      setConnectionMetadata(prev => ({
        ...prev,
        state: ConnectionState.CONNECTED,
        lastSync: new Date()
      }));
    };

    const handleConnectionClose = () => {
      setConnectionMetadata(prev => ({
        ...prev,
        state: ConnectionState.DISCONNECTED,
        peers: 0
      }));
    };

    const handleConnectionError = (error: Error) => {
      setConnectionMetadata(prev => ({
        ...prev,
        state: ConnectionState.ERROR,
        errorMessage: error.message
      }));
    };

    const updatePeerCount = () => {
      const currentPeers = webrtcProvider.awareness.getStates().size;
      setConnectionMetadata(prev => ({
        ...prev,
        peers: currentPeers
      }));
    };

    // Add event listeners
    webrtcProvider.on('connection-open', handleConnectionOpen);
    webrtcProvider.on('connection-close', handleConnectionClose);
    webrtcProvider.on('connection-error', handleConnectionError);
    
    // Update peer count periodically
    const peerInterval = setInterval(updatePeerCount, 5000);

    // Track awareness changes
    const awarenessChangeHandler = () => {
      updatePeerCount();
    };
    webrtcProvider.awareness.on('change', awarenessChangeHandler);

    // Cleanup function
    return () => {
      webrtcProvider.off('connection-open', handleConnectionOpen);
      webrtcProvider.off('connection-close', handleConnectionClose);
      webrtcProvider.off('connection-error', handleConnectionError);
      webrtcProvider.awareness.off('change', awarenessChangeHandler);
      clearInterval(peerInterval);
    };
  }, [webrtcProvider, ydoc]);

  // Render connection status
  return (
    <div className="connection-debugger fixed bottom-4 right-4 bg-gray-100 p-4 rounded-lg shadow-md z-50 min-w-[250px]">
      <div className={`connection-status ${connectionMetadata.state}`}>
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        <p>State: {connectionMetadata.state}</p>
        <p>Peers Connected: {connectionMetadata.peers}</p>
        {connectionMetadata.lastSync && (
          <p>Last Sync: {connectionMetadata.lastSync.toLocaleString()}</p>
        )}
        {connectionMetadata.errorMessage && (
          <p className="text-red-500 font-bold">
            Error: {connectionMetadata.errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConnectionDebugger;
