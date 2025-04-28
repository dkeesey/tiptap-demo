import React, { useState, useEffect } from 'react';
import { 
  DebugChannels, 
  isDebugEnabled, 
  setDebugEnabled,
  enableAllDebugChannels,
  disableAllDebugChannels
} from '../../utils/debug-logger';

interface DebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onClose }) => {
  const [debugStates, setDebugStates] = useState<Record<string, boolean>>({});

  // Load initial state
  useEffect(() => {
    const states = Object.values(DebugChannels).reduce((acc, channel) => {
      acc[channel] = isDebugEnabled(channel);
      return acc;
    }, {} as Record<string, boolean>);
    
    setDebugStates(states);
  }, []);

  // Toggle individual channel
  const toggleChannel = (channel: string) => {
    const newValue = !debugStates[channel];
    setDebugStates(prev => ({
      ...prev,
      [channel]: newValue
    }));
    setDebugEnabled(channel, newValue);
  };

  // Enable all channels
  const enableAll = () => {
    enableAllDebugChannels();
    const enabledStates = Object.values(DebugChannels).reduce((acc, channel) => {
      acc[channel] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setDebugStates(enabledStates);
  };

  // Disable all channels
  const disableAll = () => {
    disableAllDebugChannels();
    const disabledStates = Object.values(DebugChannels).reduce((acc, channel) => {
      acc[channel] = false;
      return acc;
    }, {} as Record<string, boolean>);
    
    setDebugStates(disabledStates);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg border rounded-lg p-4 z-50">
      <div className="flex justify-between mb-4">
        <h3 className="font-medium text-lg">Debug Settings</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Toggle debug channels</p>
        <div className="space-y-2">
          {Object.entries(debugStates).map(([channel, enabled]) => (
            <div key={channel} className="flex items-center">
              <input
                type="checkbox"
                id={channel}
                checked={enabled}
                onChange={() => toggleChannel(channel)}
                className="mr-2"
              />
              <label htmlFor={channel} className="text-sm">
                {channel.replace('debug-', '')}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={enableAll}
          className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Enable All
        </button>
        <button
          onClick={disableAll}
          className="px-2 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
        >
          Disable All
        </button>
      </div>
    </div>
  );
};

export default DebugPanel;