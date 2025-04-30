import React, { useState, useEffect } from 'react';
import { useRailwayCollaboration } from '../context/RailwayCollaborationContext';
import { ConnectionStatus as ConnectionState } from '../context/RailwayCollaborationContext';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({ 
  showDetails = true,
  className = ''
}) => {
  const { connectionStatus, connectionDetails, forceSync, disconnect, reconnect, connectedUsers, provider } = useRailwayCollaboration();
  const [expanded, setExpanded] = useState<boolean>(true); // Start expanded to show debug info
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Check actual WebSocket connection state
  const checkRealConnectionState = () => {
    if (provider?.wsconnection) {
      const wsState = provider.wsconnection.readyState;
      // 0 = connecting, 1 = open, 2 = closing, 3 = closed
      switch (wsState) {
        case 0: return 'connecting';
        case 1: return 'connected';
        case 2: return 'disconnecting';
        case 3: return 'disconnected';
        default: return connectionStatus;
      }
    }
    return connectionStatus;
  };
  
  // Ensure we always display the most current details
  useEffect(() => {
    // Log connection details to help debug
    console.log('[Connection Details] Current status:', connectionStatus);
    console.log('[Connection Details] Details:', connectionDetails);
    console.log('[Connection Details] Connected users:', connectedUsers);
    console.log('[Connection Details] WebSocket provider:', provider);
    
    const wsState = checkRealConnectionState();
    
    // Force update debug info when status changes
    setDebugInfo(JSON.stringify({
      status: connectionStatus,
      wsState,
      url: connectionDetails.url,
      room: connectionDetails.room,
      serverType: connectionDetails.serverType,
      users: Array.from(connectedUsers.keys()),
      usersCount: connectedUsers.size,
      provider: provider ? 'active' : 'null',
      timestamp: new Date().toISOString()
    }, null, 2));
  }, [connectionStatus, connectionDetails, connectedUsers, provider]);
  
  // Status badge styles
  const getBadgeColor = () => {
    // Use the reported connection status directly rather than deriving from user counts
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-blue-500';
      case 'reconnecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };
  
  const getDetailsText = () => {
    const url = connectionDetails?.url || 'unknown';
    const room = connectionDetails?.room || 'unknown';
    const userCount = connectedUsers.size;
    const wsState = checkRealConnectionState();
    
    return `${connectionStatus} (WS: ${wsState}) - ${url}/${room}`;
  };
  
  // Manual reconnect with explicit URL
  const handleForceReconnect = () => {
    // Set the WebSocket URL in localStorage
    localStorage.setItem('websocket_url', 'ws://localhost:1236');
    
    // Disconnect and reconnect after a brief delay
    disconnect();
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };
  
  // Check the low-level connection status directly
  const checkActualConnection = () => {
    const wsState = checkRealConnectionState();
    alert(`Real WebSocket state: ${wsState}\nProvider exists: ${provider ? 'Yes' : 'No'}`);
    
    if (provider?.wsconnection) {
      console.log('[Connection Check] WebSocket connection object:', provider.wsconnection);
    } else {
      console.log('[Connection Check] No WebSocket connection found');
    }
  };
  
  return (
    <div className={`fixed bottom-4 right-4 flex flex-col items-end z-50 ${className}`}>
      <div 
        className={`${getBadgeColor()} text-white px-3 py-1 rounded-full text-sm flex items-center cursor-pointer`}
        onClick={toggleExpanded}
        data-connected-status
      >
        <div className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'connected' ? 'animate-pulse' : ''} bg-white`}></div>
        {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
      </div>
      
      {showDetails && (
        <div className="mt-2 bg-white bg-opacity-90 text-xs text-gray-800 p-2 rounded shadow-md max-w-[300px]">
          {getDetailsText()}
          
          {expanded && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="mb-2">
                <pre className="text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                  {debugInfo}
                </pre>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <button 
                  className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
                  onClick={() => {
                    forceSync();
                    alert('Force sync triggered!');
                  }}
                >
                  Force Sync
                </button>
                
                <button 
                  className="bg-purple-500 text-white text-xs px-2 py-1 rounded"
                  onClick={handleForceReconnect}
                >
                  Fix Connection
                </button>
                
                <button 
                  className="bg-yellow-500 text-white text-xs px-2 py-1 rounded"
                  onClick={checkActualConnection}
                >
                  Check WS
                </button>
                
                <button 
                  className="bg-gray-500 text-white text-xs px-2 py-1 rounded"
                  onClick={() => {
                    localStorage.setItem('ws_debug', 'true');
                    localStorage.setItem('y_debug', 'true');
                    alert('Debug enabled! Please refresh the page.');
                  }}
                >
                  Enable Debug
                </button>
                
                <button 
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                  onClick={() => {
                    disconnect();
                    setTimeout(reconnect, 500);
                  }}
                >
                  Reconnect
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;
