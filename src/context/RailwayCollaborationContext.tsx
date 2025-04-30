import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc';

// Connection status type
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// User interface
export interface User {
  id: string;
  name: string;
  color: string;
}

// Type for our collaboration context
interface CollaborationContextType {
  provider: any | null;
  ydoc: Y.Doc;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  error: string | null;
  currentUser: User;
  connectedUsers: Map<string, User>;
  connectionDetails: {
    url: string;
    room: string;
    serverType: 'railway' | 'local' | 'unknown';
  };
  forceSync: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

// Create context with default values
const CollaborationContext = createContext<CollaborationContextType>({
  provider: null,
  ydoc: new Y.Doc(),
  isConnected: false,
  connectionStatus: 'disconnected',
  error: null,
  currentUser: { id: '', name: '', color: '' },
  connectedUsers: new Map(),
  connectionDetails: {
    url: '',
    room: '',
    serverType: 'unknown'
  },
  forceSync: () => {},
  disconnect: () => {},
  reconnect: () => {}
});

interface CollaborationProviderProps {
  children: ReactNode;
  room?: string;
}

// Generate unique session identifier to avoid same-user identity across windows
const generateSessionId = () => {
  return 'session-' + Math.random().toString(36).substring(2, 15);
};

// Get persistent user ID with session-specific suffix
const getUserId = () => {
  // Get base user ID from localStorage
  let baseUserId = localStorage.getItem('user-id');
  if (!baseUserId) {
    // Generate a random ID if none exists
    baseUserId = 'user-' + Math.floor(Math.random() * 1000000).toString();
    localStorage.setItem('user-id', baseUserId);
  }
  
  // Add a session-specific suffix to ensure uniqueness across windows
  return `${baseUserId}-${generateSessionId()}`;
};

// Get or create user name
const getUserName = () => {
  let userName = localStorage.getItem('user-name');
  if (!userName) {
    userName = `User ${Math.floor(Math.random() * 9000 + 1000)}`;
    localStorage.setItem('user-name', userName);
  }
  return userName;
};

// Get or create user color
const getUserColor = () => {
  let userColor = localStorage.getItem('user-color');
  if (!userColor) {
    const hue = Math.floor(Math.random() * 360);
    userColor = `hsl(${hue}, 70%, 50%)`;
    localStorage.setItem('user-color', userColor);
  }
  return userColor;
};

// Detect if this is a test user from URL parameters
const isTestUser = () => {
  if (typeof window === 'undefined') return false;
  
  const url = new URL(window.location.href);
  return url.searchParams.has('testUserId') && 
         url.searchParams.has('testUserName') && 
         url.searchParams.has('testUserColor');
};

// Function to determine if we're running on Railway
const isRailway = () => {
  const url = import.meta.env.VITE_WEBSOCKET_URL || '';
  return url.includes('railway.app');
};

export const RailwayCollaborationProvider: React.FC<CollaborationProviderProps> = ({ 
  children, 
  room = 'default-room' 
}) => {
  const [provider, setProvider] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<Map<string, User>>(new Map());
  const [connectionDetails, setConnectionDetails] = useState({
    url: '',
    room: room,
    serverType: 'unknown' as 'railway' | 'local' | 'unknown'
  });
  
  // Create a single Y.Doc instance that persists across all re-renders
  const ydoc = useMemo(() => {
    console.log('[Railway Collab] Creating new Y.Doc for room:', room);
    return new Y.Doc();
  }, []);  // No dependencies - create only once

  // Create a single current user that persists
  const currentUser = useMemo(() => {
    // Try to get user details from URL params for test users
    if (isTestUser() && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      return {
        id: url.searchParams.get('testUserId') || getUserId(),
        name: url.searchParams.get('testUserName') || getUserName(),
        color: url.searchParams.get('testUserColor') || getUserColor()
      };
    }
    
    return {
      id: getUserId(),
      name: getUserName(),
      color: getUserColor()
    };
  }, []);

  // Get Railway WebSocket URLs with fallback
  const getWebSocketUrls = () => {
    // Primary WebSocket URL (from environment variable)
    const primaryUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1236';
    
    // Determine server type
    const serverType = primaryUrl.includes('railway.app') 
      ? 'railway' 
      : primaryUrl.includes('localhost') ? 'local' : 'unknown';
    
    // Update connection details
    setConnectionDetails({
      url: primaryUrl,
      room: room,
      serverType
    });
    
    return {
      primaryUrl,
      serverType
    };
  };

  // Setup WebSocketProvider
  const setupWebSocketProvider = () => {
    try {
      // Enable Y.js and WebSocket debugging in browser
      if (typeof window !== 'undefined') {
        // Add to window object for debugging
        (window as any).__railwayCollabDebug__ = {
          getUserId,
          room,
          getUrl: getWebSocketUrls,
          ydoc
        };
        
        // Enable Y.js debugging if localStorage flag is set
        if (localStorage.getItem('y_debug') === 'true') {
          console.log('[Railway Collab] Y.js debugging enabled');
        }
        
        // Enable WebSocket debugging if localStorage flag is set
        if (localStorage.getItem('ws_debug') === 'true') {
          console.log('[Railway Collab] WebSocket debugging enabled');
        }
      }
      
      const { primaryUrl, serverType } = getWebSocketUrls();
      
      console.log(`[Railway Collab] Setting up WebSocket provider for ${serverType} server:`, {
        primaryUrl,
        room,
        user: currentUser
      });
      
      // Initial status update
      setConnectionStatus('connecting');
      
      // Log WebSocket connection attempt
      console.log(`[Railway Collab] Attempting to connect to WebSocket at ${primaryUrl}/${room}`);
      
      // Create WebSocket provider with connection retry
      const wsProvider = new WebsocketProvider(primaryUrl, room, ydoc, {
        connect: true,
        awareness: undefined, // Let Y.js create the awareness object
        maxBackoffTime: 10000, // Max backoff time in ms
        disableBc: false // Enable BroadcastChannel for local tab sync
      });
      
      // Track connection attempts
      let connectionAttempts = 0;
      const maxConnectionAttempts = 5;
      let connectionTimer: number | null = null;
      
      // Set user data in awareness after provider creation
      if (wsProvider.awareness) {
        wsProvider.awareness.setLocalState({
          user: currentUser
        });
      }
      
      // Define event handlers
      const handleStatusChange = (event: { status: string }) => {
        console.log(`[Railway Collab] WebSocket status:`, event.status);
        
        if (event.status === 'connected') {
          // Reset connection attempts on successful connection
          connectionAttempts = 0;
          if (connectionTimer !== null) {
            clearTimeout(connectionTimer);
            connectionTimer = null;
          }
          
          setIsConnected(true);
          setConnectionStatus('connected');
          setError(null);
        } else if (event.status === 'disconnected') {
          setIsConnected(false);
          setConnectionStatus('disconnected');
          
          // Try to reconnect if not manually disconnected
          if (connectionAttempts < maxConnectionAttempts) {
            connectionAttempts++;
            console.log(`[Railway Collab] Attempting to reconnect (${connectionAttempts}/${maxConnectionAttempts})...`);
            
            // Clear any existing timer
            if (connectionTimer !== null) {
              clearTimeout(connectionTimer);
            }
            
            // Set a delay before reconnecting, increasing with each attempt
            const reconnectDelay = Math.min(1000 * connectionAttempts, 5000);
            connectionTimer = window.setTimeout(() => {
              if (wsProvider) {
                console.log(`[Railway Collab] Reconnecting after ${reconnectDelay}ms delay...`);
                wsProvider.connect();
              }
            }, reconnectDelay);
          } else {
            console.error(`[Railway Collab] Max reconnection attempts (${maxConnectionAttempts}) reached. Giving up.`);
            setError(`Failed to connect after ${maxConnectionAttempts} attempts. Please check your connection and try again.`);
          }
        }
      };
      
      const handleConnectionError = (event: any) => {
        console.error(`[Railway Collab] WebSocket connection error:`, event);
        setIsConnected(false);
        setConnectionStatus('error');
        
        // Extract more detailed error information
        const errorMessage = event.message || 'Unknown connection error';
        console.error(`[Railway Collab] Connection error details:`, {
          message: errorMessage,
          event: event
        });
        
        setError(`Connection error: ${errorMessage}`);
      };
      
      const handleConnectionClose = () => {
        console.log(`[Railway Collab] WebSocket connection closed`);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      };
      
      // Set up connection event handlers
      wsProvider.on('status', handleStatusChange);
      wsProvider.on('connection-error', handleConnectionError);
      wsProvider.on('connection-close', handleConnectionClose);
      
      // Handle awareness update events
      let awarenessUpdateHandler: ((event: any) => void) | null = null;
      
      if (wsProvider.awareness) {
        awarenessUpdateHandler = () => {
          const states = wsProvider.awareness.getStates() as Map<number, any>;
          const users = new Map<string, User>();
          
          // Log all states with their client IDs for debugging
          console.log(`[Railway Collab] Awareness update received. All states:`, 
            Array.from(states.entries()).map(([clientId, state]) => ({
              clientId,
              user: state.user,
              timestamp: new Date().toISOString()
            }))
          );
          
          states.forEach((state, clientId) => {
            if (state.user) {
              const user = state.user as User;
              users.set(user.id, user);
              console.log(`[Railway Collab] User found in awareness: ${user.name} (${user.id}) with client ID ${clientId}`);
            }
          });
          
          // Log connected users count and IDs
          console.log(`[Railway Collab] Connected users updated: ${users.size} users`);
          console.log(`[Railway Collab] User IDs in awareness: ${Array.from(users.keys()).join(', ')}`);
          
          setConnectedUsers(users);
        };
        
        wsProvider.awareness.on('update', awarenessUpdateHandler);
        
        // Initial awareness update
        if (awarenessUpdateHandler) {
          awarenessUpdateHandler({} as any);
        }
      }
      
      setProvider(wsProvider);
      
      // Return cleanup function
      return () => {
        console.log(`[Railway Collab] Cleaning up WebSocket provider`);
        
        try {
          // Clear any pending reconnection timer
          if (connectionTimer !== null) {
            clearTimeout(connectionTimer);
            connectionTimer = null;
          }
          
          // First, remove all event listeners to prevent any async responses
          if (wsProvider.awareness && awarenessUpdateHandler) {
            // Log awareness state before cleaning up
            console.log(`[Railway Collab] Awareness states before cleanup:`, 
              Array.from(wsProvider.awareness.getStates().entries()));
            
            // Remove the awareness update handler
            wsProvider.awareness.off('update', awarenessUpdateHandler);
            
            // Set local state to null before disconnecting
            wsProvider.awareness.setLocalState(null);
          }
          
          // Remove event listeners from provider
          wsProvider.off('status', handleStatusChange);
          wsProvider.off('connection-error', handleConnectionError);
          wsProvider.off('connection-close', handleConnectionClose);
          
          // Wait a small timeout to allow any in-flight messages to complete
          setTimeout(() => {
            try {
              // Then disconnect and destroy
              console.log(`[Railway Collab] Disconnecting WebSocket provider`);
              wsProvider.disconnect();
              
              console.log(`[Railway Collab] Destroying WebSocket provider`);
              wsProvider.destroy();
              
              setProvider(null);
              setIsConnected(false);
              setConnectionStatus('disconnected');
            } catch (innerErr) {
              console.error('[Railway Collab] Error during final WebSocket cleanup:', innerErr);
            }
          }, 100); // Increase timeout to allow more time for cleanup
        } catch (err) {
          console.error('[Railway Collab] Error during cleanup:', err);
        }
      };
    } catch (err) {
      console.error(`[Railway Collab] Error setting up WebSocket provider:`, err);
      setError(err instanceof Error ? err.message : 'Failed to set up WebSocket provider');
      setConnectionStatus('error');
      setIsConnected(false);
      return () => {}; // Empty cleanup for error case
    }
  };

  // Set up WebSocket provider on mount
  useEffect(() => {
    const cleanup = setupWebSocketProvider();
    return cleanup;
  }, [room]);  // Only recreate when room changes

  // Force sync function
  const forceSync = () => {
    if (provider && provider.awareness) {
      console.log(`[Railway Collab] Force syncing document and awareness states`);
      
      // Force awareness update
      provider.awareness.setLocalState({
        ...provider.awareness.getLocalState(),
        timestamp: Date.now()
      });
    }
  };

  // Disconnect function
  const disconnect = () => {
    if (provider) {
      console.log(`[Railway Collab] Manually disconnecting provider`);
      provider.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
    }
  };

  // Reconnect function
  const reconnect = () => {
    if (provider) {
      console.log(`[Railway Collab] Manually reconnecting provider`);
      provider.connect();
      setConnectionStatus('connecting');
    } else {
      // If provider was destroyed, recreate it
      setupWebSocketProvider();
    }
  };

  // Compile all context values
  const contextValue = useMemo(() => ({
    provider,
    ydoc,
    isConnected,
    connectionStatus,
    error,
    currentUser,
    connectedUsers,
    connectionDetails,
    forceSync,
    disconnect,
    reconnect
  }), [
    provider,
    ydoc,
    isConnected,
    connectionStatus,
    error,
    currentUser,
    connectedUsers,
    connectionDetails
  ]);

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useRailwayCollaboration = () => useContext(CollaborationContext);

export default CollaborationContext;
