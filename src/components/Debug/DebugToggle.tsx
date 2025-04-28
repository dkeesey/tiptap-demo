import React, { useState } from 'react';
import DebugPanel from './DebugPanel';

// A simple button for toggling the debug panel visibility
const DebugToggle: React.FC = () => {
  const [isDebugPanelVisible, setIsDebugPanelVisible] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsDebugPanelVisible(!isDebugPanelVisible)}
        className="fixed bottom-4 left-4 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg z-50 flex items-center justify-center"
        title="Toggle Debug Panel"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </button>
      
      <DebugPanel 
        isVisible={isDebugPanelVisible} 
        onClose={() => setIsDebugPanelVisible(false)} 
      />
    </>
  );
};

export default DebugToggle;