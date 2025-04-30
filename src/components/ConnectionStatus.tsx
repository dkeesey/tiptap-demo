import React, { useEffect, useState } from 'react';
import WebSocketService, { ConnectionStatus as ConnectionState } from '../services/WebSocketService';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({ 
  showDetails = true,
  className = ''
}) => {
  const [status, setStatus] = useState<ConnectionState>('disconnected');
  const [details, setDetails] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);
  
  useEffect(() => {
    const service = WebSocketService.getInstance();
    
    // Enable debug mode in development
    if (import.meta.env.DEV) {
      service.enableDebugMode();
    }
    
    // Subscribe to status changes
    const unsubscribe = service.onStatusChange((newStatus) => {
      setStatus(newStatus);
      
      // Get connection details for debugging
      if (newStatus === 'error' || newStatus === 'disconnected') {
        try {
          service.logConnectionDetails();
          setDetails(`Attempting to connect to: ${service.config?.primaryUrl || 'unknown'}`);
        } catch (err) {
          setDetails('Unable to get connection details');
        }
      } else {
        setDetails('');
      }
    });
    
    return unsubscribe;
  }, []);
  
  // Status badge styles
  const getBadgeColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-blue-500';
      case 'reconnecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };
  
  return (
    <div className={`fixed bottom-4 right-4 flex flex-col items-end z-50 ${className}`}>
      <div 
        className={`${getBadgeColor()} text-white px-3 py-1 rounded-full text-sm flex items-center cursor-pointer`}
        onClick={toggleExpanded}
      >
        <div className={`w-2 h-2 rounded-full mr-2 ${status === 'connected' ? 'animate-pulse' : ''} bg-white`}></div>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
      
      {showDetails && (expanded || details) && (
        <div className="mt-2 bg-white bg-opacity-90 text-xs text-gray-800 p-2 rounded shadow-md max-w-[250px]">
          {details || (
            status === 'connected' ? 
              'Connected to collaboration server' : 
              'Click for connection details'
          )}
          
          {expanded && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <button 
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
                onClick={() => {
                  const service = WebSocketService.getInstance();
                  service.forceSync();
                }}
              >
                Force Sync
              </button>
              
              <button 
                className="bg-gray-500 text-white text-xs px-2 py-1 rounded ml-2"
                onClick={() => {
                  const service = WebSocketService.getInstance();
                  service.logConnectionDetails();
                }}
              >
                Debug Info
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;
