/**
 * Debug logger utility for TipTap editor components
 * 
 * This utility helps manage debug logging throughout the application,
 * allowing for targeted debugging without console flooding.
 */

// Enable individual debug channels through localStorage
export const DebugChannels = {
  BUBBLE_MENU: 'debug-bubble-menu',
  FLOATING_MENU: 'debug-floating-menu',
  COLLABORATION: 'debug-collaboration',
  EDITOR_STATE: 'debug-editor-state',
  SELECTION: 'debug-selection',
  WEBSOCKET: 'debug-websocket',
  AI_FEATURES: 'debug-ai-features'
};

/**
 * Check if a specific debug channel is enabled
 * @param channel - The debug channel to check
 * @returns boolean - Whether debugging is enabled for this channel
 */
export const isDebugEnabled = (channel: string): boolean => {
  // Only allow debug logging in development
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }
  
  return localStorage.getItem(channel) === 'true';
};

/**
 * Log a message to the console if the specified debug channel is enabled
 * @param channel - The debug channel to log to
 * @param message - The message or object to log
 * @param data - Optional additional data to log
 */
export const debugLog = (channel: string, message: string, data?: any): void => {
  if (isDebugEnabled(channel)) {
    if (data) {
      console.log(`[${channel}] ${message}`, data);
    } else {
      console.log(`[${channel}] ${message}`);
    }
  }
};

/**
 * Enable or disable debugging for a specific channel
 * @param channel - The debug channel to configure
 * @param enabled - Whether to enable or disable debugging
 */
export const setDebugEnabled = (channel: string, enabled: boolean): void => {
  if (enabled) {
    localStorage.setItem(channel, 'true');
  } else {
    localStorage.removeItem(channel);
  }
};

/**
 * Enable all debug channels
 */
export const enableAllDebugChannels = (): void => {
  Object.values(DebugChannels).forEach(channel => {
    localStorage.setItem(channel, 'true');
  });
};

/**
 * Disable all debug channels
 */
export const disableAllDebugChannels = (): void => {
  Object.values(DebugChannels).forEach(channel => {
    localStorage.removeItem(channel);
  });
};

export default {
  DebugChannels,
  isDebugEnabled,
  debugLog,
  setDebugEnabled,
  enableAllDebugChannels,
  disableAllDebugChannels
};