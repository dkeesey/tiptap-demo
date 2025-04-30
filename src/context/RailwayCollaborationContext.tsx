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
      const { primaryUrl, serverType } = getWebSocketUrls();
      
      console.log(`[Railway Collab] Setting up WebSocket provider for ${serverType} server:`, {
        primaryUrl,
        room,
        user: currentUser
      });
      
      // Initial status update
      setConnectionStatus('connecting');
      
      // Create WebSocket provider
      const wsProvider = new WebsocketProvider(primaryUrl, room, ydoc, {
        connect: true,
        awareness: {
          // Add current user information
          local: {
            user: currentUser
          }
        }
      });
      
      // Set up connection event handlers
      wsProvider.on('status', (event: { status: string }) => {
        console.log(`[Railway Collab] WebSocket status:`, event.status);
        
        if (event.status === 'connected') {
          setIsConnected(true);
          setConnectionStatus('connected');
          setError(null);
        } else if (event.status === 'disconnected') {
          setIsConnected(false);
          setConnectionStatus('disconnected');
        }
      });
      
      wsProvider.on('connection-error', (event: any) => {
        console.error(`[Railway Collab] WebSocket connection error:`, event);
        setIsConnected(false);
        setConnectionStatus('error');
        setError(`Connection error: ${event.message || 'Failed to connect to server'}`);
      });
      
      // Handle connection close
      wsProvider.on('connection-close', () => {
        console.log(`[Railway Collab] WebSocket connection closed`);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      });
      
      // Handle awareness update events
      if (wsProvider.awareness) {
        const handleAwarenessUpdate = () => {
          const states = wsProvider.awareness.getStates() as Map<number, any>;
          const users = new Map<string, User>();
          
          states.forEach((state, clientId) => {
            if (state.user) {
              const user = state.user as User;
              users.set(user.id, user);
            }
          });
          
          setConnectedUsers(users);
          
          // Log connected users
          console.log(`[Railway Collab] Connected users updated:`, users.size);
        };
        
        wsProvider.awareness.on('update', handleAwarenessUpdate);
        
        // Initial awareness update
        handleAwarenessUpdate();
      }
      
      setProvider(wsProvider);
      
      // Return cleanup function
      return () => {
        console.log(`[Railway Collab] Cleaning up WebSocket provider`);
        
        if (wsProvider.awareness) {
          wsProvider.awareness.removeAllLocalStates();
        }
        
        wsProvider.disconnect();
        wsProvider.destroy();
        
        setProvider(null);
        setIsConnected(false);
        setConnectionStatus('disconnected');
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
