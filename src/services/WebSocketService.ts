import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

interface WebSocketConfig {
  primaryUrl?: string;
  fallbackUrl?: string;
  connectTimeout?: number;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

class WebSocketService {
  private static instance: WebSocketService;
  private config: WebSocketConfig;

  private constructor(config?: WebSocketConfig) {
    this.config = {
      primaryUrl: import.meta.env.PROD_WEBSOCKET_PRIMARY_URL || 'wss://y-webrtc-signal-backend.fly.dev',
      fallbackUrl: import.meta.env.PROD_WEBSOCKET_FALLBACK_URL,
      connectTimeout: Number(import.meta.env.WEBSOCKET_CONNECT_TIMEOUT) || 10000,
      reconnectAttempts: Number(import.meta.env.WEBSOCKET_RECONNECT_ATTEMPTS) || 3,
      reconnectInterval: Number(import.meta.env.WEBSOCKET_RECONNECT_INTERVAL) || 2000,
      ...config
    };
  }

  public static getInstance(config?: WebSocketConfig): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(config);
    }
    return WebSocketService.instance;
  }

  createCollaborationProvider(
    roomName: string, 
    ydoc: Y.Doc, 
    customConfig?: Partial<WebSocketConfig>
  ): WebrtcProvider {
    const mergedConfig = { ...this.config, ...customConfig };
    
    try {
      const provider = new WebrtcProvider(
        roomName, 
        ydoc, 
        { 
          signaling: [
            mergedConfig.primaryUrl, 
            ...(mergedConfig.fallbackUrl ? [mergedConfig.fallbackUrl] : [])
          ],
          connectTimeout: mergedConfig.connectTimeout,
          maxReconnectionAttempts: mergedConfig.reconnectAttempts
        }
      );

      provider.connect();
      return provider;
    } catch (error) {
      console.error('WebSocket Connection Error:', error);
      throw error;
    }
  }

  // Debugging method
  logConnectionDetails(provider: WebrtcProvider) {
    const logDetails = () => {
      console.group('WebSocket Connection Details');
      console.log('Connected Peers:', provider.awareness.getStates().size);
      console.log('Room Name:', provider.roomName);
      console.log('Connection Status:', provider.shouldConnect);
      console.groupEnd();
    };

    // Log initial and periodic connection details
    logDetails();
    const intervalId = setInterval(logDetails, 10000);

    return () => clearInterval(intervalId);
  }
}

export default WebSocketService;
