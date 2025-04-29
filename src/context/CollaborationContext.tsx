import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Type for our collaboration context
interface CollaborationContextType {
  provider: WebsocketProvider | null;
  ydoc: Y.Doc;
  isConnected: boolean;
  error: string | null;
}

// Create context with default values
const CollaborationContext = createContext<CollaborationContextType>({
  provider: null,
  ydoc: new Y.Doc(),
  isConnected: false,
  error: null
});

interface CollaborationProviderProps {
  children: ReactNode;
  room: string;
}

// Get persistent user ID
const getUserId = () => {
  let userId = localStorage.getItem('user-id');
  if (!userId) {
    // Generate a random ID if none exists
    userId = 'user-' + Math.floor(Math.random() * 1000000).toString();
    localStorage.setItem('user-id', userId);
  }
  return userId;
};

// Function to force a document sync
const forceSync = (provider: WebsocketProvider) => {
  if (provider?.wsconnected) {
    console.log('Forcing document sync...');
    try {
      // @ts-ignore - Internal API to force sync
      provider.emit('sync', [provider.doc]);
    } catch (err) {
      console.error('Error forcing sync:', err);
    }
  }
};

// Function to detect if this is a test user from URL parameters
const isTestUser = () => {
  if (typeof window === 'undefined') return false;
  
  const url = new URL(window.location.href);
  return url.searchParams.has('testUserId') && 
         url.searchParams.has('testUserName') && 
         url.searchParams.has('testUserColor');
};

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children, room }) => {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a single Y.Doc instance that persists across all re-renders
  const ydoc = useMemo(() => {
    console.log('Creating new Y.Doc for room:', room);
    return new Y.Doc();
  }, []);  // No dependencies - create only once

  // Use a hardcoded WebSocket URL for local development
  // This matches the port used in SimpleWebSocketServer.cjs
  const wsUrl = 'ws://localhost:1236';

  useEffect(() => {
    console.log('Setting up WebSocket provider with room:', room);
    
    try {
      // Create a new WebSocket provider for collaboration
      console.log('Connecting to WebSocket server:', wsUrl, 'Room:', room);
      
      // Close any existing provider before creating a new one
      if (provider) {
        console.log('Disconnecting existing WebSocket provider');
        provider.disconnect();
        provider.destroy();
      }
      
      // Initialize document if it's empty
      const sharedXmlFragment = ydoc.getXmlFragment('document');
      console.log('Document state:', {
        fragmentLength: sharedXmlFragment.length,
        isEmpty: sharedXmlFragment.length === 0,
      });

      // Generate a random client ID for this connection
      const clientID = Math.floor(Math.random() * 100000000).toString();
      
      // Create the WebSocket provider with explicit config
      const wsProvider = new WebsocketProvider(wsUrl, room, ydoc, {
        connect: true,
        // Don't set awareness directly - it's not a proper config option
        params: {
          userId: getUserId(),
          clientId: clientID // Pass as URL param
        },
        disableBc: true, // Disable broadcast channel to avoid issues
      });

      // Track connection status
      wsProvider.on('status', ({ status }: { status: string }) => {
        console.log('WebSocket status changed:', status);
        if (status === 'connected') {
          setIsConnected(true);
          setError(null);
          
          // Get current states after connection to see all users 
          const states = Array.from(wsProvider.awareness.getStates().entries());
          console.log('Connected with users:', states.map(([id, state]) => ({
            clientID: id,
            name: state.user?.name || 'Unknown',
            userId: state.user?.id || 'no-id'
          })));
          
          // Update awareness after a small delay to ensure it's processed
          setTimeout(() => {
            initializeUserAwareness(wsProvider);
          }, 500);
        } else if (status === 'disconnected') {
          setIsConnected(false);
          setError('WebSocket connection lost');
        }
      });
      
      // Setup additional events for debugging
      
      // Track sync status
      wsProvider.on('sync', (isSynced: boolean) => {
        console.log('Document sync status:', isSynced ? 'synchronized' : 'synchronizing');
        
        // Update awareness once in sync
        if (isSynced) {
          console.log('Document synced, reinitializing awareness');
          initializeUserAwareness(wsProvider);
        }
      });
      
      // Listen for document updates
      ydoc.on('update', (update: Uint8Array, origin: any) => {
        console.log('Document updated:', {
          updateLength: update.length,
          origin: origin === wsProvider ? 'remote' : 'local'
        });
      });

      const initializeUserAwareness = (provider: WebsocketProvider) => {
        // Set up the user data in awareness
        const currentUserId = getUserId();
        const userName = localStorage.getItem('user-name') || 'User';
        const userColor = localStorage.getItem('user-color') || '#6B7280';
        
        // Add user number to display name if it's a test user
        const displayName = isTestUser() ? userName : userName;
        
        console.log('Setting user awareness:', {
          id: currentUserId,
          name: displayName,
          color: userColor,
          clientId: provider.awareness.clientID
        });
        
        // Clear existing state and set new state
        provider.awareness.setLocalState({
          user: {
            id: currentUserId,
            name: displayName,
            color: userColor
          }
        });
      };

      // Initialize user awareness immediately
      initializeUserAwareness(wsProvider);
      
      // Set a longer timeout for awareness states
      if (wsProvider.awareness) {
        // @ts-ignore - Type definition is incomplete, this is a valid property
        wsProvider.awareness.cleanupTimeout = 30000; // 30 seconds
      }
      
      // Force sync periodically to ensure document is up-to-date
      const syncInterval = setInterval(() => {
        if (wsProvider.wsconnected) {
          forceSync(wsProvider);
        }
      }, 5000);

      setProvider(wsProvider);

      // Clean up on unmount
      return () => {
        console.log('Cleaning up WebSocket provider');
        clearInterval(syncInterval);
        wsProvider.disconnect();
        wsProvider.destroy();
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      return () => {}; // Empty cleanup for error case
    }
  }, [room]); // Only recreate when room changes

  const contextValue = useMemo(() => ({
    provider,
    ydoc,
    isConnected,
    error
  }), [provider, ydoc, isConnected, error]);

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => useContext(CollaborationContext);

export default CollaborationContext;