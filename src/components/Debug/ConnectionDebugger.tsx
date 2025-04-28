import React, { useState, useEffect, useMemo } from 'react';
import { useCollaboration } from '../../context/CollaborationContext';

interface LogEntry {
  timestamp: Date;
  event: string;
  details?: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

// Default user for when not connected
const defaultUser = {
  id: 'local',
  name: 'You',
  color: '#6B7280'
};

/**
 * ConnectionDebugger - A component to display and debug collaboration information
 * Shows connection status, connected users, and logs important events
 */
const ConnectionDebugger: React.FC = () => {
  const { 
    ydoc, 
    provider,
    isConnected,
    error
  } = useCollaboration();
  
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [docStats, setDocStats] = useState({
    clientID: 0,
    stateVector: 'N/A',
    updates: 0
  });

  // Get current user and connected users from awareness state
  const currentUser = useMemo(() => {
    if (!provider?.awareness) return defaultUser;
    const localState = provider.awareness.getLocalState();
    return localState?.user || defaultUser;
  }, [provider?.awareness]);

  const connectedUsers = useMemo(() => {
    if (!provider?.awareness) return new Map();
    const states = Array.from(provider.awareness.getStates().entries());
    return new Map(states.map(([key, state]) => [key, state.user]));
  }, [provider?.awareness]);

  // Toggle debugger visibility
  const toggleExpanded = () => setExpanded(!expanded);

  // Add a log entry
  const addLogEntry = (entry: Omit<LogEntry, 'timestamp'>) => {
    setLogs(prevLogs => [
      { ...entry, timestamp: new Date() },
      ...prevLogs.slice(0, 99) // Keep only the last 100 logs
    ]);
  };

  // Clear all logs
  const clearLogs = () => setLogs([]);

  // Update document statistics
  useEffect(() => {
    if (ydoc) {
      // Create a listener for document updates
      const updateHandler = () => {
        setDocStats(prev => ({
          ...prev,
          clientID: ydoc.clientID,
          stateVector: JSON.stringify(ydoc.gc).substring(0, 30) + '...',
          updates: prev.updates + 1
        }));
        
        addLogEntry({
          event: 'Document Update',
          details: `ClientID: ${ydoc.clientID}`,
          type: 'info'
        });
      };
      
      ydoc.on('update', updateHandler);
      
      // Initialize stats
      setDocStats({
        clientID: ydoc.clientID,
        stateVector: JSON.stringify(ydoc.gc).substring(0, 30) + '...',
        updates: 0
      });
      
      return () => {
        ydoc.off('update', updateHandler);
      };
    }
  }, [ydoc]);

  // Monitor WebSocket provider
  useEffect(() => {
    if (provider) {
      // Listeners for awareness changes (user presence)
      const awarenessUpdateHandler = ({ added, updated, removed }: any) => {
        const details = `Added: ${added.length}, Updated: ${updated.length}, Removed: ${removed.length}`;
        
        addLogEntry({
          event: 'Awareness Update',
          details,
          type: 'info'
        });
      };
      
      // Listeners for connection status changes
      const statusHandler = (event: { status: string }) => {
        addLogEntry({
          event: `Connection Status: ${event.status}`,
          type: event.status === 'connected' ? 'success' : 
                event.status === 'connecting' ? 'warning' : 'error'
        });
      };
      
      // Listeners for connection errors
      const connectionErrorHandler = (error: Error) => {
        addLogEntry({
          event: 'Connection Error',
          details: error.message,
          type: 'error'
        });
      };
      
      // Add listeners
      if (provider.awareness) {
        provider.awareness.on('update', awarenessUpdateHandler);
      }
      
      provider.on('status', statusHandler);
      provider.on('connection-error', connectionErrorHandler);
      
      // Initial log
      addLogEntry({
        event: `WebSocket Provider Initialized`,
        details: `Room: ${provider.roomname}`,
        type: 'info'
      });
      
      // Cleanup listeners
      return () => {
        if (provider.awareness) {
          provider.awareness.off('update', awarenessUpdateHandler);
        }
        
        provider.off('status', statusHandler);
        provider.off('connection-error', connectionErrorHandler);
      };
    }
  }, [provider]);

  // Monitor connection status changes
  useEffect(() => {
    addLogEntry({
      event: `Connection Status Changed: ${isConnected ? 'connected' : 'disconnected'}`,
      type: isConnected ? 'success' : 'error'
    });
  }, [isConnected]);

  // Monitor error changes
  useEffect(() => {
    if (error) {
      addLogEntry({
        event: 'Connection Error',
        details: error,
        type: 'error'
      });
    }
  }, [error]);

  // Function to test document synchronization
  const testSync = () => {
    if (ydoc && provider) {
      // Create a string that includes the timestamp to ensure uniqueness
      const testString = `sync-test-${Date.now()}`;
      
      // Add a temporary value to the document
      try {
        const testArray = ydoc.getArray('sync-tests');
        testArray.push([testString]);
        
        addLogEntry({
          event: 'Sync Test Initiated',
          details: `Added "${testString}" to document`,
          type: 'info'
        });
      } catch (error) {
        addLogEntry({
          event: 'Sync Test Failed',
          details: error instanceof Error ? error.message : String(error),
          type: 'error'
        });
      }
    }
  };

  // Don't render anything if the debugger is not expanded and we're not in development
  if (!expanded && process.env.NODE_ENV !== 'development') {
    return (
      <button 
        onClick={toggleExpanded}
        className="fixed top-4 right-4 bg-gray-100 text-gray-600 p-2 rounded-full z-50 shadow-md"
        title="Open Connection Debugger"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 bg-gray-800 text-white p-4 z-50 max-h-[50vh] overflow-auto shadow-lg opacity-90">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Connection Debugger</h2>
        
        <div className="flex gap-2">
          <button 
            onClick={testSync}
            className="px-2 py-1 bg-blue-500 text-white text-sm rounded"
          >
            Test Sync
          </button>
          
          <button 
            onClick={clearLogs}
            className="px-2 py-1 bg-red-500 text-white text-sm rounded"
          >
            Clear Logs
          </button>
          
          <button 
            onClick={toggleExpanded}
            className="px-2 py-1 bg-gray-600 text-white text-sm rounded"
          >
            {expanded ? 'Minimize' : 'Expand'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-3 rounded">
          <h3 className="text-sm font-semibold mb-2">Connection Status</h3>
          
          <div className="text-sm">
            <div className="flex items-center mb-1">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>Status: {isConnected ? 'connected' : 'disconnected'}</span>
            </div>
            
            <div className="mb-1">
              Room: {provider?.roomname || 'Not connected'}
            </div>
            
            <div className="mb-1">
              Client ID: {docStats.clientID}
            </div>
            
            <div className="mb-1">
              Updates: {docStats.updates}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 p-3 rounded">
          <h3 className="text-sm font-semibold mb-2">Connected Users ({connectedUsers.size})</h3>
          
          <div className="text-sm max-h-32 overflow-y-auto">
            <div className="flex items-center mb-1">
              <div className="w-2 h-2 rounded-full mr-2 bg-blue-500"></div>
              <span>You: {currentUser.name} (ID: {currentUser.id.split(':')[0]}...)</span>
            </div>
            
            {Array.from(connectedUsers.entries()).map(([id, user]) => (
              user && user.id !== currentUser.id && (
                <div key={id} className="flex items-center mb-1">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: user.color }}
                  ></div>
                  <span>{user.name} (ID: {user.id.split(':')[0]}...)</span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
      
      <h3 className="text-sm font-semibold mt-4 mb-2">Event Log</h3>
      
      <div className="bg-gray-900 rounded p-2 max-h-40 overflow-y-auto text-xs font-mono">
        {logs.map((log, index) => (
          <div 
            key={index}
            className={`mb-1 pb-1 border-b border-gray-800 ${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-green-400' :
              log.type === 'warning' ? 'text-yellow-400' :
              'text-gray-300'
            }`}
          >
            <span className="text-gray-500">
              {log.timestamp.toLocaleTimeString()}
            </span>
            {' '}{log.event}
            {log.details && (
              <div className="pl-4 text-gray-400">{log.details}</div>
            )}
          </div>
        ))}
        
        {logs.length === 0 && (
          <div className="text-gray-500">No events logged yet</div>
        )}
      </div>
    </div>
  );
};

export default ConnectionDebugger;