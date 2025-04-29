import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import * as Y from 'yjs';
import WebSocketService, { ConnectionStatus } from '../services/WebSocketService';

// Type for our collaboration context
interface CollaborationContextType {
  provider: any | null;
  ydoc: Y.Doc;
  connectionStatus: ConnectionStatus;
  error: string | null;
  currentUser: User;
  connectedUsers: Map<string, User>;
  forceSync: () => void;
}

// User interface
export interface User {
  id: string;
  name: string;
  color: string;
}

// Create context with default values
const CollaborationContext = createContext<CollaborationContextType>({
  provider: null,
  ydoc: new Y.Doc(),
  connectionStatus: 'disconnected',
  error: null,
  currentUser: { id: '', name: '', color: '' },
  connectedUsers: new Map(),
  forceSync: () => {}
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

// Function to detect if this is a test user from URL parameters
const isTestUser = () => {
  if (typeof window === 'undefined') return false;
  
  const url = new URL(window.location.href);
  return url.searchParams.has('testUserId') && 
         url.searchParams.has('testUserName') && 
         url.searchParams.has('testUserColor');
};

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children, room }) => {
  const [provider, setProvider] = useState<any | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<Map<string, User>>(new Map());
  
  // Create a single Y.Doc instance that persists across all re-renders
  const ydoc = useMemo(() => {
    console.log('Creating new Y.Doc for room:', room);
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

  // Set up WebSocket provider
  useEffect(() => {
    console.log('Setting up WebSocket provider with room:', room);
    
    try {
      // Get WebSocket service instance
      const wsService = WebSocketService.getInstance({
        primaryUrl: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1236',
        userData: currentUser
      });
      
      // Subscribe to connection status changes
      const unsubscribe = wsService.onStatusChange((status) => {
        setConnectionStatus(status);
        
        if (status === 'error') {
          setError('WebSocket connection error. Using peer-to-peer fallback.');
        } else if (status === 'connected') {
          setError(null);
        }
      });
      
      // Create the provider
      const collabProvider = wsService.createCollaborationProvider(room, ydoc, currentUser);
      setProvider(collabProvider);
      
      // Set up awareness change handler to track connected users
      const handleAwarenessChange = () => {
        if (collabProvider && collabProvider.awareness) {
          const newUsers = new Map<string, User>();
          const states = collabProvider.awareness.getStates();
          
          // Extract user data from awareness states
          states.forEach((state: any, clientId: number) => {
            if (state.user) {
              const user = state.user as User;
              newUsers.set(user.id, user);
            }
          });
          
          setConnectedUsers(newUsers);
        }
      };
      
      // Subscribe to awareness changes
      if (collabProvider && collabProvider.awareness) {
        collabProvider.awareness.on('change', handleAwarenessChange);
        
        // Initial update
        handleAwarenessChange();
      }
      
      // Debug connection details periodically
      const debugInterval = setInterval(() => {
        wsService.logConnectionDetails();
      }, 10000);

      // Clean up on unmount
      return () => {
        console.log('Cleaning up WebSocket provider');
        unsubscribe();
        clearInterval(debugInterval);
        
        if (collabProvider && collabProvider.awareness) {
          collabProvider.awareness.off('change', handleAwarenessChange);
        }
        
        wsService.destroy();
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      return () => {}; // Empty cleanup for error case
    }
  }, [room, ydoc, currentUser]); // Only recreate when room changes

  // Force sync function
  const forceSync = () => {
    const wsService = WebSocketService.getInstance();
    wsService.forceSync();
  };

  const contextValue = useMemo(() => ({
    provider,
    ydoc,
    connectionStatus,
    error,
    currentUser,
    connectedUsers,
    forceSync
  }), [provider, ydoc, connectionStatus, error, currentUser, connectedUsers]);

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => useContext(CollaborationContext);

export default CollaborationContext;