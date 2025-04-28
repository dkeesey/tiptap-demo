import React, { createContext, useState, useContext, useEffect, ReactNode, useRef, useCallback, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { syncedStore, getYjsValue } from '@syncedstore/core';
import { UndoManager } from 'yjs';
import { Awareness } from 'y-protocols/awareness';

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
  provider: WebsocketProvider | null;
  ydoc: Y.Doc;
  isConnected: boolean;
  error: string | null;
}

const defaultUser: User = {
  id: 'local',
  name: 'You',
  color: '#6B7280',
};

// Generate a random color
const getRandomColor = () => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
    '#009688', '#4caf50', '#8bc34a', '#cddc39', 
    '#ffc107', '#ff9800', '#ff5722'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

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

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children, room }) => {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const isCleaningUp = useRef(false);

  const connectWithRetry = useCallback(async () => {
    // Don't attempt to connect if we're cleaning up
    if (isCleaningUp.current) return;
    
    if (retryCount.current >= maxRetries) {
      setError('Maximum connection attempts reached');
      return;
    }

    // Clean up existing provider before creating a new one
    if (provider) {
      provider.disconnect();
      provider.destroy();
      setProvider(null);
    }

    try {
      console.log('Attempting to connect to room:', room);
      
      // Configure WebSocket options
      const wsOptions = { 
        connect: true,
        maxBackoffTime: 5000,
        disableBc: true // Disable broadcast channel to avoid cross-tab complications
      };
      
      console.log('Creating WebSocket provider with options:', wsOptions);
      
      const wsProvider = new WebsocketProvider(
        'ws://localhost:1236', // Base WebSocket URL
        room,                  // Room name (will be properly encoded)
        ydoc,                  // Y.js document
        wsOptions              // Connection options
      );

      // Set up initial user awareness
      const username = localStorage.getItem('user-name') || `User-${Math.floor(Math.random() * 10000)}`;
      const userColor = localStorage.getItem('user-color') || getRandomColor();
      
      // Generate a unique ID that persists across browser sessions
      let userId = localStorage.getItem('user-id');
      if (!userId) {
        userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('user-id', userId);
      }
      
      // IMPORTANT: Use the provider's client ID for this specific connection
      const clientId = wsProvider.awareness.clientID;
      
      // Set up the local awareness state
      wsProvider.awareness.setLocalState({
        user: {
          id: userId,         // Persistent user ID (same across tabs for same browser/user)
          clientId: clientId, // Connection-specific ID (different for each tab/connection)
          name: username,
          color: userColor,
        }
      });
      
      // Log awareness state for debugging
      console.log('Initial awareness state set:', {
        userId,
        clientId,
        username,
        userColor
      });
      
      // Add awareness event listener to track user connections
      wsProvider.awareness.on('update', ({ added, updated, removed }) => {
        const states = Array.from(wsProvider.awareness.getStates().entries());
        const clientCount = states.length;
        const userCount = states.filter(([_, state]) => Boolean(state.user)).length;
        
        console.log('Awareness update:', { 
          added: added.length > 0 ? added : [], 
          updated: updated.length > 0 ? updated : [], 
          removed: removed.length > 0 ? removed : [] 
        });
        
        console.log('Connection stats:', {
          clientCount,
          userCount,
          clientIDs: states.map(([id]) => id)
        });
        
        // Log each connected user with their client ID and user ID
        console.log('Current users:', states
          .filter(([_, state]) => Boolean(state.user))
          .map(([clientID, state]) => ({
            clientID,
            userID: state.user.id,
            name: state.user.name
          }))
        );
      });

      wsProvider.on('status', ({ status }: { status: 'connected' | 'disconnected' }) => {
        if (isCleaningUp.current) return;
        
        console.log('WebSocket status:', status);
        setIsConnected(status === 'connected');
        if (status === 'connected') {
          retryCount.current = 0;
          setError(null);
        }
      });

      wsProvider.on('connection-error', (err: Error) => {
        if (isCleaningUp.current) return;
        
        console.error('WebSocket connection error:', err);
        setError(err.message);
        retryCount.current++;
        
        // Only retry if we haven't reached max retries and we're not cleaning up
        if (retryCount.current < maxRetries && !isCleaningUp.current) {
          const delay = Math.min(1000 * Math.pow(2, retryCount.current), 5000);
          setTimeout(() => connectWithRetry(), delay);
        }
      });

      setProvider(wsProvider);
    } catch (err) {
      if (isCleaningUp.current) return;
      
      console.error('Failed to create WebSocket provider:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      retryCount.current++;
      
      // Only retry if we haven't reached max retries and we're not cleaning up
      if (retryCount.current < maxRetries && !isCleaningUp.current) {
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 5000);
        setTimeout(() => connectWithRetry(), delay);
      }
    }
  }, [ydoc, room, provider]);

  // Effect to handle connection
  useEffect(() => {
    isCleaningUp.current = false;
    retryCount.current = 0;
    connectWithRetry();

    return () => {
      isCleaningUp.current = true;
      if (provider) {
          provider.disconnect();
        provider.destroy();
      }
      ydoc.destroy();
    };
  }, [room]); // Only reconnect when room changes

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

// Custom hook for using collaboration context
export const useCollaboration = () => useContext(CollaborationContext);

export default CollaborationContext;
