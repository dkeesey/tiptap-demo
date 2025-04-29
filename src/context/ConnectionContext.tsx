import React, { createContext, useState, useContext, useEffect } from 'react';
import { WebrtcProvider } from 'y-webrtc';
import { Doc as YDoc } from 'yjs';
import { ConnectionState, ConnectionMetadata } from '../types/connection';

// Create the context type
interface ConnectionContextType {
  connectionMetadata: ConnectionMetadata;
  updateConnectionMetadata: (metadata: Partial<ConnectionMetadata>) => void;
  initializeWebrtcProvider: (provider: WebrtcProvider, doc: YDoc) => void;
}

// Create the context
const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

// Provider component
export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionMetadata, setConnectionMetadata] = useState<ConnectionMetadata>({
    state: ConnectionState.DISCONNECTED,
    peers: 0,
    lastSync: null
  });

  const [webrtcProvider, setWebrtcProvider] = useState<WebrtcProvider | null>(null);
  const [ydoc, setYdoc] = useState<YDoc | null>(null);

  const updateConnectionMetadata = (metadata: Partial<ConnectionMetadata>) => {
    setConnectionMetadata(prev => ({ ...prev, ...metadata }));
  };

  const initializeWebrtcProvider = (provider: WebrtcProvider, doc: YDoc) => {
    setWebrtcProvider(provider);
    setYdoc(doc);
  };

  useEffect(() => {
    if (!webrtcProvider || !ydoc) return;

    // Track connection states
    const handleConnectionOpen = () => {
      updateConnectionMetadata({
        state: ConnectionState.CONNECTED,
        lastSync: new Date()
      });
    };

    const handleConnectionClose = () => {
      updateConnectionMetadata({
        state: ConnectionState.DISCONNECTED,
        peers: 0
      });
    };

    const handleConnectionError = (error: Error) => {
      updateConnectionMetadata({
        state: ConnectionState.ERROR,
        errorMessage: error.message
      });
    };

    const updatePeerCount = () => {
      const currentPeers = webrtcProvider.awareness.getStates().size;
      updateConnectionMetadata({ peers: currentPeers });
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

  return (
    <ConnectionContext.Provider 
      value={{ 
        connectionMetadata, 
        updateConnectionMetadata, 
        initializeWebrtcProvider 
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

// Custom hook to use the connection context
export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
