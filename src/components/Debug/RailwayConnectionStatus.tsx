import React, { useState, useEffect } from 'react';
import { useRailwayCollaboration } from '../../context/RailwayCollaborationContext';

type ConnectionStatsType = {
  latency: number | null;
  lastUpdate: number | null;
  connectionAttempts: number;
  successfulConnections: number;
  disconnections: number;
};

const RailwayConnectionStatus: React.FC = () => {
  const { 
    isConnected, 
    connectionStatus, 
    error, 
    connectionDetails,
    connectedUsers
  } = useRailwayCollaboration();

  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState<ConnectionStatsType>({
    latency: null,
    lastUpdate: null,
    connectionAttempts: 0,
    successfulConnections: 0,
    disconnections: 0
  });

  // Measure connection latency periodically if connected
  useEffect(() => {
    if (!isConnected) return;

    let intervalId: ReturnType<typeof setInterval>;
    
    const measureLatency = async () => {
      const start = performance.now();
      
      try {
        // Measure time to fetch health endpoint
        const response = await fetch(`${connectionDetails.url.replace('ws', 'http')}/health`);
        if (response.ok) {
          const end = performance.now();
          setStats(prev => ({
            ...prev,
            latency: Math.round(end - start),
            lastUpdate: Date.now()
          }));
        }
      } catch (error) {
        console.error('Error measuring latency:', error);
      }
    };

    // Initial measurement
    measureLatency();
    
    // Set up periodic measurement every 10 seconds if connected
    intervalId = setInterval(measureLatency, 10000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isConnected, connectionDetails.url]);

  // Update stats when connection status changes
  useEffect(() => {
    if (connectionStatus === 'connecting') {
      setStats(prev => ({
        ...prev,
        connectionAttempts: prev.connectionAttempts + 1
      }));
    } else if (connectionStatus === 'connected') {
      setStats(prev => ({
        ...prev,
        successfulConnections: prev.successfulConnections + 1
      }));
    } else if (connectionStatus === 'disconnected') {
      setStats(prev => ({
        ...prev,
        disconnections: prev.disconnections + 1
      }));
    }
  }, [connectionStatus]);

  // Format time elapsed since last update
  const formatTimeElapsed = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';
    
    const elapsed = Date.now() - timestamp;
    if (elapsed < 1000) return 'Just now';
    if (elapsed < 60000) return `${Math.floor(elapsed / 1000)} seconds ago`;
    if (elapsed < 3600000) return `${Math.floor(elapsed / 60000)} minutes ago`;
    return `${Math.floor(elapsed / 3600000)} hours ago`;
  };

  return (
    <div className="railway-connection-status mt-4 p-4 border rounded-md bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className={`w-3 h-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500' :
              error ? 'bg-red-500' : 'bg-gray-500'
            }`}
          ></div>
          <h3 className="font-medium text-gray-800">
            Railway Connection: {
              isConnected ? 'Connected' :
              connectionStatus === 'connecting' ? 'Connecting...' :
              error ? 'Error' : 'Disconnected'
            }
          </h3>
        </div>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      {showDetails && (
        <div className="mt-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-600">Server Type:</div>
            <div className="font-medium">
              {connectionDetails.serverType === 'railway' 
                ? 'Railway' 
                : connectionDetails.serverType === 'local'
                  ? 'Local' 
                  : 'Unknown'
              }
            </div>
            
            <div className="text-gray-600">WebSocket URL:</div>
            <div className="font-mono text-xs">{connectionDetails.url}</div>
            
            <div className="text-gray-600">Room:</div>
            <div className="font-medium">{connectionDetails.room}</div>
            
            <div className="text-gray-600">Connected Users:</div>
            <div className="font-medium">{connectedUsers.size}</div>
            
            <div className="text-gray-600">Latency:</div>
            <div className="font-medium">
              {stats.latency !== null ? `${stats.latency}ms` : 'Unknown'}
            </div>
            
            <div className="text-gray-600">Last Update:</div>
            <div className="font-medium">{formatTimeElapsed(stats.lastUpdate)}</div>
            
            <div className="text-gray-600">Connection Attempts:</div>
            <div className="font-medium">{stats.connectionAttempts}</div>
            
            <div className="text-gray-600">Successful Connections:</div>
            <div className="font-medium">{stats.successfulConnections}</div>
            
            <div className="text-gray-600">Disconnections:</div>
            <div className="font-medium">{stats.disconnections}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RailwayConnectionStatus;
