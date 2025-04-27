import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { syncedStore, getYjsValue } from '@syncedstore/core';
import { UndoManager } from 'yjs';

// Disable all Y.js logging globally
// @ts-ignore - Accessing internal property to completely disable logging
if (Y.logging) {
  Y.logging.setLevel('error');
  // Further disable specific loggers
  Y.logging.createLogger = () => ({
    print: () => {}, // No-op function
  });
}

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
  undoManager?: UndoManager;
}

const defaultUser: User = {
  id: '',
  name: '',
  color: '',
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
  undoManager: undefined,
});

interface CollaborationProviderProps {
  children: ReactNode;
  roomName?: string;
  websocketUrl?: string;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  roomName = 'tiptap-demo-default-room',
  // Default websocket URL
  websocketUrl = 'ws://localhost:1235',
}) => {
  // State for managing user and connection
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentUser, setCurrentUser] = useState<User>(() => {
    // Try to get saved user from localStorage
    const savedUser = localStorage.getItem('collaborationUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Verify that parsed user has valid fields
        if (parsedUser && parsedUser.id && parsedUser.name && parsedUser.color) {
          console.log('Retrieved existing user from localStorage:', parsedUser.id);
          return parsedUser;
        } else {
          console.warn('Parsed user from localStorage is missing required fields');
        }
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    
    // Generate a persistent user ID that won't change on reload
    // Use deviceId if available, or create a new one and store it
    const getOrCreateUserId = () => {
      // Get persistent base ID from localStorage
      const storedId = localStorage.getItem('collaborationUserId');
      const baseId = storedId || `user-${Math.floor(Math.random() * 100000)}`;
      
      // Store the base ID if it's new
      if (!storedId) {
        try {
          localStorage.setItem('collaborationUserId', baseId);
        } catch (e) {
          console.error('Failed to save user ID to localStorage:', e);
        }
      }
      
      // Add a session-specific unique component
      // This ensures different browser instances get different IDs
      // Uses both timestamp and random value for uniqueness
      const sessionComponent = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const sessionId = `${baseId}-session-${sessionComponent}`;
      
      // Store the session ID in sessionStorage so it persists during the session
      // but not between different tabs/windows
      try {
        sessionStorage.setItem('collaborationSessionId', sessionId);
      } catch (e) {
        console.error('Failed to save session ID to sessionStorage:', e);
      }
      
      return sessionId;
    };
    
    // Generate different predefined colors
    const userColors = [
      '#FF5733', // Coral red
      '#33A8FF', // Sky blue
      '#33FF57', // Mint green
      '#F033FF', // Pink
      '#FFD700', // Gold
      '#9370DB', // Medium purple
      '#00CED1', // Dark turquoise
      '#FF6347', // Tomato
      '#20B2AA', // Light sea green
      '#6495ED', // Cornflower blue
    ];
    
    // Create new user if none exists or parsing failed
    const newUser = {
      id: getOrCreateUserId(),
      name: `User ${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 1000)}`,
      // Use a consistent color based on a hash of the session ID to ensure different colors
      color: userColors[Math.abs(getOrCreateUserId().split('-').reduce((acc, part) => acc + part.charCodeAt(0), 0)) % userColors.length],
    };
    
    // Save to localStorage
    try {
      localStorage.setItem('collaborationUser', JSON.stringify(newUser));
    } catch (e) {
      console.error('Failed to save user to localStorage:', e);
    }
    
    console.log('Created new user:', newUser.id);
    return newUser;
  });
  const [connectedUsers, setConnectedUsers] = useState<Map<string, User>>(new Map());
  
  // Create synced store using Y.js document
  const [storeRef] = useState(() => {
    // The first argument (initial state) for the root store must be {}
    return syncedStore({}, ydoc);
  });

  // Create UndoManager
  const [undoManager] = useState(() => {
    // Track changes to the document fragment
    const fragment = ydoc.getXmlFragment('document');
    
    // Use default UndoManager settings to track local changes
    return new UndoManager(fragment);
  });

  // Effect to set up WebSocket provider
  useEffect(() => {
    // Set connecting status while we attempt to connect - minimize logging
    setConnectionStatus('connecting');
    
    // Log only critical messages, not general connection attempts
    // console.log(`Attempting to connect to WebSocket at ${websocketUrl}/${roomName}`);
    
    // Create WebSocket provider
    let wsProvider: WebsocketProvider;
    try {
      console.log(`Creating WebSocket provider with URL: ${websocketUrl}, room: ${roomName}`);
      
      // More robust configuration for WebSocket provider
      wsProvider = new WebsocketProvider(websocketUrl, roomName, ydoc, { 
        connect: true,
        maxBackoffTime: 5000,  // Increased max backoff time for reconnection attempts
        disableBc: false,      // Enable BroadcastChannel as fallback
        resyncInterval: 10000, // Resync every 10 seconds if disconnected
        logging: false,        // Disable all internal logging completely
      });
      
      // Minimal logging
      // console.log('WebSocket provider created successfully');
      setProvider(wsProvider);
      
      // Make an initial connection attempt - minimize logging
      if (!wsProvider.shouldConnect) {
        // console.log('Initial connection attempt...');
        wsProvider.connect();
      }
    } catch (err) {
      console.error('Failed to create WebSocket provider:', err);
      setConnectionStatus('disconnected');
      return;
    }

    // Only add essential event listeners, remove those causing excessive logs
    wsProvider.on('status', (event: { status: string }) => {
      // Only update state, no logging
      if (event.status === 'connected') {
        setConnectionStatus('connected');
        
        // Force awareness update to notify others of our presence
        try {
          wsProvider.awareness.setLocalStateField('user', {
            id: currentUser.id,
            name: currentUser.name,
            color: currentUser.color,
            avatar: currentUser.avatar
          });
        } catch (err) {
          // Silent error handling
        }
      } else if (event.status === 'connecting') {
        setConnectionStatus('connecting');
      } else {
        setConnectionStatus('disconnected');
      }
    });
    
    // Error handler - silent to avoid console flooding
    wsProvider.on('connection-error', () => {
      // Only update status if needed
      if (connectionStatus !== 'disconnected') {
        setConnectionStatus('disconnected');
      }
    });
    
    // Connection close handler - silent to avoid console flooding
    wsProvider.on('connection-close', () => {
      // No logging or counters, just state updates if needed
      if (connectionStatus !== 'disconnected') {
        setConnectionStatus('disconnected');
      }
    });
    
    // Set awareness (user presence) - with minimal logging
    try {
      // Set initial user state
      wsProvider.awareness.setLocalStateField('user', {
        id: currentUser.id,
        name: currentUser.name,
        color: currentUser.color,
        avatar: currentUser.avatar
      });
    } catch (err) {
      // Silent error handling
    }
    
    // Listen for changes in user presence - minimal event processing
    const awarenessHandler = () => {
      try {
        // Throttle awareness updates to reduce event frequency
        if (wsProvider && wsProvider.awareness) {
          const states = wsProvider.awareness.getStates() as Map<number, { user: User }>;
          const users = new Map<string, User>();
          
          states.forEach((state, clientId) => {
            if (state.user && state.user.id) {
              users.set(state.user.id, state.user);
            }
          });
          
          setConnectedUsers(users);
        }
      } catch (err) {
        // Silent error handling
      }
    };

    // Add awareness handler and throttle its execution to reduce events
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledAwarenessHandler = () => {
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      throttleTimeout = setTimeout(awarenessHandler, 1000); // Only update once per second max
    };

    wsProvider.awareness.on('change', throttledAwarenessHandler);
    awarenessHandler(); // Initial call to populate connected users
    
    // Document update handler - with no logging
    const documentUpdateHandler = () => {
      // Remove all logging, just let Y.js handle the updates
    };
    
    // Add document update handler but throttle to reduce frequency
    ydoc.on('update', documentUpdateHandler);
    
    // Clean up - with minimal logging
    return () => {
      try {
        wsProvider.awareness.off('change', throttledAwarenessHandler);
        ydoc.off('update', documentUpdateHandler);
        // Silently disconnect
        wsProvider.disconnect();
        // Clean up throttle timeout if it exists
        if (throttleTimeout) {
          clearTimeout(throttleTimeout);
        }
      } catch (err) {
        // Silent error handling
      }
    };
  }, [ydoc, roomName, websocketUrl, currentUser.id, currentUser.name, currentUser.color, currentUser.avatar]);

  // Update current user info - without logging
  const updateCurrentUser = (userUpdate: Partial<User>) => {
    const updatedUser = { ...currentUser, ...userUpdate };
    setCurrentUser(updatedUser);
    
    // Save updated user to localStorage
    try {
      localStorage.setItem('collaborationUser', JSON.stringify(updatedUser));
    } catch (e) {
      // Silent error handling
    }
    
    if (provider) {
      try {
        provider.awareness.setLocalStateField('user', updatedUser);
      } catch (e) {
        // Silent error handling
      }
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
    storeRef,
    undoManager,
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
