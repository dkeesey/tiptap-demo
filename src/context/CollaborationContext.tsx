import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { syncedStore, getYjsValue } from '@syncedstore/core';

// Types for user and connection status
interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

// Type for our collaboration context
interface CollaborationContextType {
  ydoc: Y.Doc;
  provider: WebsocketProvider | null;
  isOnline: boolean;
  connectionStatus: ConnectionStatus;
  currentUser: User;
  connectedUsers: Map<string, User>;
  updateCurrentUser: (user: Partial<User>) => void;
  storeRef: any;
}

const defaultUser: User = {
  id: `user-${Math.floor(Math.random() * 100000)}`,
  name: `User ${Math.floor(Math.random() * 100)}`,
  color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
};

// Create context with default values
const CollaborationContext = createContext<CollaborationContextType>({
  ydoc: new Y.Doc(),
  provider: null,
  isOnline: false,
  connectionStatus: 'disconnected',
  currentUser: defaultUser,
  connectedUsers: new Map(),
  updateCurrentUser: () => {},
  storeRef: null,
});

interface CollaborationProviderProps {
  children: ReactNode;
  roomName?: string;
  websocketUrl?: string;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  roomName = 'tiptap-demo-default-room',
  // Use the Yjs demo server by default, but in production we could use our own WebSocket server
  websocketUrl = 'wss://demos.yjs.dev',
}) => {
  // State for managing user and connection
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [connectedUsers, setConnectedUsers] = useState<Map<string, User>>(new Map());
  
  // Create synced store using Y.js document
  const [storeRef] = useState(() => {
    return syncedStore({
      // Define your store structure here
      document: {
        content: 'content',
        title: 'title',
      },
      // Add any other synchronized data you need
      meta: { 
        users: {} 
      }
    }, ydoc);
  });

  // Effect to set up WebSocket provider
  useEffect(() => {
    // Create WebSocket provider
    const wsProvider = new WebsocketProvider(websocketUrl, roomName, ydoc, { connect: true });
    setProvider(wsProvider);

    // Event listeners for connection status
    wsProvider.on('status', (event: { status: string }) => {
      if (event.status === 'connected') {
        setConnectionStatus('connected');
      } else if (event.status === 'connecting') {
        setConnectionStatus('connecting');
      } else {
        setConnectionStatus('disconnected');
      }
    });
    
    // Set awareness (user presence)
    wsProvider.awareness.setLocalStateField('user', {
      id: currentUser.id,
      name: currentUser.name,
      color: currentUser.color,
      avatar: currentUser.avatar
    });

    // Listen for changes in user presence
    const awarenessHandler = () => {
      const states = wsProvider.awareness.getStates() as Map<number, { user: User }>;
      const users = new Map<string, User>();
      
      states.forEach((state, clientId) => {
        if (state.user && state.user.id) {
          users.set(state.user.id, state.user);
        }
      });
      
      setConnectedUsers(users);
    };

    wsProvider.awareness.on('change', awarenessHandler);
    awarenessHandler(); // Initial call to populate connected users

    // Clean up
    return () => {
      wsProvider.awareness.off('change', awarenessHandler);
      wsProvider.disconnect();
    };
  }, [ydoc, roomName, websocketUrl]);

  // Update current user info
  const updateCurrentUser = (userUpdate: Partial<User>) => {
    const updatedUser = { ...currentUser, ...userUpdate };
    setCurrentUser(updatedUser);
    
    if (provider) {
      provider.awareness.setLocalStateField('user', updatedUser);
    }
  };

  // Provide context value
  const contextValue: CollaborationContextType = {
    ydoc,
    provider,
    isOnline: connectionStatus === 'connected',
    connectionStatus,
    currentUser,
    connectedUsers,
    updateCurrentUser,
    storeRef
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
};

// Custom hook for using collaboration context
export const useCollaboration = () => useContext(CollaborationContext);

export default CollaborationContext;
