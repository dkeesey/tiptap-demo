import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { syncedStore, getYjsValue } from '@syncedstore/core';
import { UndoManager } from 'yjs';

// Updated approach to handle logging without relying on Y.logging
// Instead of trying to access internal logging API that doesn't exist,
// we'll implement a more compatible approach
try {
  // Attempt to minimize logging through environment variables if supported
  if (typeof process !== 'undefined' && process.env) {
    process.env.Y_LOGGING = 'error';
  }
  
  // Monkey-patch console methods to filter Y.js logs if needed
  // This is safer than relying on internal APIs
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  // Filter functions that check if log messages are from Y.js
  const isYjsLog = (args: any[]) => {
    if (args.length === 0) return false;
    const firstArg = String(args[0]);
    return firstArg.includes('y-websocket') || 
           firstArg.includes('yjs') || 
           firstArg.startsWith('y:');
  };
  
  // Only apply in non-development mode or if explicitly enabled
  const shouldFilterLogs = process.env.NODE_ENV !== 'development' || 
                         localStorage.getItem('filter-yjs-logs') === 'true';
  
  if (shouldFilterLogs) {
    console.log = (...args: any[]) => {
      if (!isYjsLog(args)) {
        originalConsoleLog(...args);
      }
    };
    
    console.warn = (...args: any[]) => {
      if (!isYjsLog(args)) {
        originalConsoleWarn(...args);
      }
    };
    
    console.error = (...args: any[]) => {
      if (!isYjsLog(args)) {
        originalConsoleError(...args);
      }
    };
  }
} catch (e) {
  console.error('Failed to set up Y.js log filtering:', e);
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
  websocketUrl = 'ws://localhost:1236', // Updated to match new port in SimpleWebSocketServer.cjs
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
    
    console.log(`Attempting to connect to WebSocket at ${websocketUrl}/${roomName}`);
    
    // Function to create a fallback connection if primary fails
    const createFallbackConnection = () => {
      try {
        // Try alternative port 1235 as fallback
        const fallbackUrl = websocketUrl.replace('1236', '1235');
        console.log(`Trying fallback WebSocket connection on ${fallbackUrl}`);
        
        const wsProvider = new WebsocketProvider(fallbackUrl, roomName, ydoc, { 
          connect: true,
          maxBackoffTime: 5000,
          disableBc: false,
          resyncInterval: 10000,
          // logging: false, // Removed invalid property
        });
        
        console.log('Fallback WebSocket provider created successfully');
        setProvider(wsProvider);
        
        setupProviderEventListeners(wsProvider);
      } catch (err) {
        console.error('Failed to create fallback WebSocket provider:', err);
        setConnectionStatus('disconnected');
      }
    };
    
    // Create WebSocket provider
    let wsProvider: WebsocketProvider;
    try {
      // Check if WebSocket server is running by making a test connection first
      const testSocket = new WebSocket(`${websocketUrl}/${roomName}`);
      
      testSocket.onopen = () => {
        console.log('WebSocket connection test successful, creating provider');
        testSocket.close();
        
        // More robust configuration for WebSocket provider
        wsProvider = new WebsocketProvider(websocketUrl, roomName, ydoc, { 
          connect: true,
          maxBackoffTime: 5000,  // Increased max backoff time for reconnection attempts
          disableBc: false,      // Enable BroadcastChannel as fallback
          resyncInterval: 10000, // Resync every 10 seconds if disconnected
          // logging: false,      // Removed invalid property
        });
        
        console.log('WebSocket provider created successfully');
        setProvider(wsProvider);
        
        // Make an initial connection attempt
        if (!wsProvider.shouldConnect) {
          console.log('Initial connection attempt...');
          wsProvider.connect();
        }
        
        setupProviderEventListeners(wsProvider);
      };
      
      testSocket.onerror = (error: Event) => {
        console.error('WebSocket connection test failed:', error);
        setConnectionStatus('disconnected');
        // Try to create a fallback connection to alternative port if primary fails
        createFallbackConnection();
      };
      
    } catch (err) {
      console.error('Failed to create WebSocket provider:', err);
      setConnectionStatus('disconnected');
      // Try to create a fallback connection to alternative port
      createFallbackConnection();
    }
    
    // Function to set up event listeners for the provider
    const setupProviderEventListeners = (wsProvider: WebsocketProvider) => {

    // Only add essential event listeners, remove those causing excessive logs
    wsProvider.on('status', (event: { status: string }) => {
      console.log(`WebSocket status changed: ${event.status}`);
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
          console.error('Failed to set awareness field:', err);
        }
      } else if (event.status === 'connecting') {
        setConnectionStatus('connecting');
      } else {
        setConnectionStatus('disconnected');
      }
    });
    
    // Error handler with limited logging
    wsProvider.on('connection-error', (error: Error) => {
      // Log the first error but avoid flooding
      console.error('WebSocket connection error:', error);
      if (connectionStatus !== 'disconnected') {
        setConnectionStatus('disconnected');
      }
    });
    
    // Connection close handler with limited logging
    wsProvider.on('connection-close', () => {
      console.log('WebSocket connection closed');
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
    };
    
    // Clean up function
    return () => {
      // Clean up will be handled by the websocket provider itself
      if (provider) {
        try {
          // Use empty function instead of null for type safety
          provider.awareness.off('change', () => {});
          provider.disconnect();
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
      }
      
      // Clean up any document listeners
      ydoc.off('update', () => {});
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
