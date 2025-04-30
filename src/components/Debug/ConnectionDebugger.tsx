import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../../context/CollaborationContext';

export const ConnectionDebugger: React.FC = () => {
  const { provider, isConnected } = useCollaboration();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLogsVisible, setIsLogsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);

  // Update connected users when provider or connection status changes
  useEffect(() => {
    if (!provider?.awareness) return;

    const updateConnectedUsers = () => {
      const states = Array.from(provider.awareness.getStates().entries());
      const localClientId = provider.awareness.clientID;
      
      // Log what we're receiving from awareness for debugging
      console.log('Awareness states:', states.map(([id, state]) => ({
        clientId: id,
        user: state.user
      })));
      
      const users = states.map(([clientId, state]) => ({
        clientId,
        user: state.user || { name: 'Unknown', id: 'unknown', color: '#ccc' },
        isCurrentUser: clientId === localClientId
      }));
      
      setConnectedUsers(users);
      
      // Add to logs
      const newLog = `${new Date().toLocaleTimeString()} Awareness Update - Users: ${users.length}`;
      setLogs(prev => [...prev.slice(-19), newLog]);
    };
    
    // Initial update
    updateConnectedUsers();
    
    // Setup listener for awareness changes
    provider.awareness.on('update', updateConnectedUsers);
    
      return () => {
      provider.awareness.off('update', updateConnectedUsers);
      };
  }, [provider?.awareness, isConnected]);

  // Test sync by making a simple update to the document
  const testSync = () => {
    if (!provider) return;
    
    // Log the test attempt
    const newLog = `${new Date().toLocaleTimeString()} Testing sync...`;
    setLogs(prev => [...prev.slice(-19), newLog]);
      
    // Try forcing a sync using internal provider methods
    try {
      // @ts-ignore - Internal method
      if (typeof provider.emit === 'function') {
        // @ts-ignore
        provider.emit('sync', [provider.doc]);
        
        const successLog = `${new Date().toLocaleTimeString()} Forced sync event`;
        setLogs(prev => [...prev.slice(-19), successLog]);
      }
      
      // Auto-show logs when testing
      setIsLogsVisible(true);
    } catch (err) {
      const errorLog = `${new Date().toLocaleTimeString()} Error: ${err instanceof Error ? err.message : String(err)}`;
      setLogs(prev => [...prev.slice(-19), errorLog]);
      setIsLogsVisible(true);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };
  
  // Format user ID for display
  const formatUserId = (id: string) => {
    if (!id) return 'unknown';
    // If it's a test user ID, show it more clearly
    if (id.startsWith('test-user-')) {
      return id;
    }
    // Otherwise truncate long IDs
    return id.length > 12 ? `${id.substring(0, 8)}...` : id;
  };

  return (
    <div className="connection-debugger mt-4 border border-gray-200 rounded-md overflow-hidden bg-gray-800 text-white text-sm">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700">
        <h3 className="font-medium">Connection Debugger</h3>
        <div className="flex gap-2">
          <button 
            onClick={testSync}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Test Sync
          </button>
          <button 
            onClick={() => {
              if (isLogsVisible) {
                clearLogs();
              }
              setIsLogsVisible(!isLogsVisible);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            {isLogsVisible ? 'Hide Logs' : 'Show Logs'}
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="connection-status">
            <h4 className="text-gray-400 mb-2">Connection Status</h4>
          <div className="text-sm">
            <div className="flex items-center mb-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Status: {isConnected ? 'connected' : 'disconnected'}</span>
            </div>
              <div className="mb-1">Room: {provider?.roomname || 'not connected'}</div>
              <div className="mb-1">Client ID: {provider?.awareness?.clientID || 'unknown'}</div>
              <div className="mb-1">Updates: {0}</div>
            </div>
          </div>
        
          <div className="connected-users">
            <h4 className="text-gray-400 mb-2">Connected Users ({connectedUsers.length})</h4>
            <div className="text-sm">
              {connectedUsers.map(({clientId, user, isCurrentUser}) => (
                <div key={clientId} className="mb-1 flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{backgroundColor: user?.color || '#ccc'}}
                  ></div>
                  <span>
                    {isCurrentUser ? (
                      <strong className="text-green-300">You</strong>
                    ) : (
                      <span>{user?.name || 'Unknown'}</span>
                    )}
                    {' '}<span className="text-gray-500">
                      (ID: {formatUserId(user?.id)})
                    </span>
                    {' '}<span className="text-gray-400 text-xs">Client: {clientId}</span>
                  </span>
                </div>
            ))}
              
              {connectedUsers.length === 0 && (
                <div className="text-gray-500">No users connected</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {isLogsVisible && (
        <div className="event-log border-t border-gray-700 p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-gray-400">Event Log</h4>
            <button 
              onClick={clearLogs} 
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="text-sm h-40 overflow-y-auto bg-gray-900 p-2 rounded">
            {logs.length === 0 ? (
              <div className="text-gray-500">No events logged</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-xs mb-1 font-mono">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
        )}
    </div>
  );
};

// Add default export for backward compatibility
export default ConnectionDebugger;