import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc';

// Connection status type
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Configuration for WebSocket service
export interface WebSocketConfig {
  // Primary WebSocket URL for y-websocket
  primaryUrl?: string;
  // Fallback URL in case the primary fails
  fallbackUrl?: string;
  // Using WebRTC as fallback (peer-to-peer)
  useWebRTCFallback?: boolean;
  // Connection timeout in milliseconds
  connectTimeout?: number;
  // Number of reconnection attempts before giving up
  reconnectAttempts?: number;
  // Interval between reconnection attempts
  reconnectInterval?: number;
  // Room name for multi-room support
  roomName?: string;
  // User data for awareness
  userData?: {
    id: string;
    name: string;
    color: string;
  };
}

// Provider interface to unify WebsocketProvider and WebrtcProvider
export interface Provider {
  connect(): void;
  disconnect(): void;
  destroy(): void;
  on(event: string, callback: (...args: any[]) => void): void;
  off(event: string, callback: (...args: any[]) => void): void;
  awareness: any;
  roomname?: string;
}

// Type guard to check if provider is WebsocketProvider
function isWebsocketProvider(provider: Provider): provider is WebsocketProvider {
  return 'wsconnected' in provider;
}

// Type guard to check if provider is WebrtcProvider
function isWebrtcProvider(provider: Provider): provider is WebrtcProvider {
  return 'connected' in provider && 'roomname' in provider;
}

/**
 * Enhanced WebSocket service for Y.js collaboration
 * Supports automatic fallback to WebRTC if WebSocket fails
 */
class WebSocketService {
  private static instance: WebSocketService;
  private config: WebSocketConfig;
  private provider: Provider | null = null;
  private fallbackProvider: Provider | null = null;
  private currentStatus: ConnectionStatus = 'disconnected';
  private statusListeners: ((status: ConnectionStatus) => void)[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private ydoc: Y.Doc | null = null;

  private constructor(config?: WebSocketConfig) {
    // Merge provided config with environment variables and defaults
    this.config = {
      primaryUrl: 
        // First try environment variables (production deployment)
        import.meta.env.VITE_WEBSOCKET_PRIMARY_URL || 
        // Then detect if we're in a secure context (https)
        (window.location.protocol === 'https:' 
          ? 'wss://tiptap-demo-production.up.railway.app' 
          : 'ws://localhost:1236'),
      fallbackUrl: import.meta.env.VITE_WEBSOCKET_FALLBACK_URL || 'wss://y-webrtc-signal-backend.fly.dev',
      useWebRTCFallback: import.meta.env.VITE_USE_WEBRTC_FALLBACK === 'true' || true,
      connectTimeout: Number(import.meta.env.VITE_WEBSOCKET_CONNECT_TIMEOUT) || 10000,
      reconnectAttempts: Number(import.meta.env.VITE_WEBSOCKET_RECONNECT_ATTEMPTS) || 5,
      reconnectInterval: Number(import.meta.env.VITE_WEBSOCKET_RECONNECT_INTERVAL) || 2000,
      ...config
    };
    
    // Debug connection info in development
    if (import.meta.env.DEV) {
      console.log('WebSocketService initialized with config:', this.config);
    }

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Get singleton instance of WebSocketService
   */
  public static getInstance(config?: WebSocketConfig): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(config);
    } else if (config) {
      // Update config if provided
      WebSocketService.instance.updateConfig(config);
    }
    return WebSocketService.instance;
  }

  /**
   * Update service configuration
   */
  public updateConfig(config: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Create a new Y.js document and provider for collaboration
   */
  public createCollaborationProvider(
    roomName: string, 
    ydoc?: Y.Doc,
    userData?: { id: string; name: string; color: string },
    customConfig?: Partial<WebSocketConfig>
  ): Provider {
    const mergedConfig = { ...this.config, ...customConfig, roomName };
    
    // Use provided document or create a new one
    this.ydoc = ydoc || new Y.Doc();
    
    // Set up user data
    const userInfo = userData || this.config.userData || this.getDefaultUserData();
    
    try {
      this.updateStatus('connecting');
      
      // Create WebSocket provider
      this.provider = this.createWebSocketProvider(
        roomName,
        this.ydoc,
        userInfo,
        mergedConfig
      );

      // Set up event listeners
      this.setupProviderEvents(this.provider);
      
      // Create fallback provider if enabled
      if (mergedConfig.useWebRTCFallback) {
        this.fallbackProvider = this.createWebRTCProvider(
          roomName,
          this.ydoc,
          userInfo,
          mergedConfig
        );
        this.setupFallbackProviderEvents(this.fallbackProvider);
      }
      
      return this.provider;
    } catch (error) {
      console.error('WebSocket Initialization Error:', error);
      this.updateStatus('error');
      throw error;
    }
  }

  /**
   * Create a WebSocket provider
   */
  private createWebSocketProvider(
    roomName: string,
    ydoc: Y.Doc,
    userData: { id: string; name: string; color: string },
    config: WebSocketConfig
  ): WebsocketProvider {
    if (!config.primaryUrl) {
      throw new Error('WebSocket URL is required');
    }

    const provider = new WebsocketProvider(config.primaryUrl, roomName, ydoc, {
      connect: true,
      params: { userId: userData.id },
      disableBc: true,
      maxBackoffTime: 10000,
    });

    // Set awareness data
    provider.awareness.setLocalStateField('user', userData);
    
    return provider;
  }

  /**
   * Create a WebRTC provider as fallback
   */
  private createWebRTCProvider(
    roomName: string,
    ydoc: Y.Doc,
    userData: { id: string; name: string; color: string },
    config: WebSocketConfig
  ): WebrtcProvider {
    const signaling = [
      config.fallbackUrl || 'wss://y-webrtc-signal-backend.fly.dev',
    ];

    const provider = new WebrtcProvider(roomName, ydoc, {
      signaling,
      password: null,
      awareness: this.provider?.awareness,
      maxConns: 20,
      // connect: false, // Don't connect immediately
    });

    // Set awareness data if not already set by primary provider
    provider.awareness.setLocalStateField('user', userData);
    
    return provider;
  }

  /**
   * Set up event listeners for the primary provider
   */
  private setupProviderEvents(provider: Provider): void {
    if (isWebsocketProvider(provider)) {
      // WebSocket-specific events
      provider.on('status', ({ status }: { status: string }) => {
        if (status === 'connected') {
          this.handleConnected();
        } else if (status === 'disconnected') {
          this.handleDisconnected();
        }
      });

      provider.on('connection-error', (error: Error) => {
        console.error('WebSocket connection error:', error);
        this.handleConnectionError(error);
      });
    } else if (isWebrtcProvider(provider)) {
      // WebRTC-specific events
      provider.on('peers', (peers: any) => {
        if (peers && Object.keys(peers).length > 0) {
          this.handleConnected();
        }
      });

      provider.on('synced', (data: { synced: boolean }) => {
        if (data.synced) {
          this.handleConnected();
        }
      });
    }

    // Common events
    provider.on('sync', (isSynced: boolean) => {
      console.log('Document sync status:', isSynced ? 'synchronized' : 'synchronizing');
    });
  }

  /**
   * Set up events for fallback provider
   */
  private setupFallbackProviderEvents(provider: Provider): void {
    if (isWebrtcProvider(provider)) {
      provider.on('peers', (peers: any) => {
        console.log('WebRTC peers:', Object.keys(peers).length);
      });
    }
  }

  /**
   * Handle provider connection
   */
  private handleConnected(): void {
    this.updateStatus('connected');
    this.reconnectAttempt = 0;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Disable fallback if primary is connected
    if (this.fallbackProvider && isWebrtcProvider(this.fallbackProvider) && 
        this.provider && isWebsocketProvider(this.provider) && 
        this.provider.wsconnected) {
      this.fallbackProvider.disconnect();
    }
  }

  /**
   * Handle provider disconnection
   */
  private handleDisconnected(): void {
    this.updateStatus('disconnected');
    
    // Try to reconnect primary
    this.attemptReconnect();
    
    // Activate fallback if available
    if (this.fallbackProvider && !this.isProviderConnected(this.fallbackProvider)) {
      this.fallbackProvider.connect();
    }
  }

  /**
   * Handle connection error
   */
  private handleConnectionError(error: Error): void {
    console.error('Connection error:', error);
    this.updateStatus('error');
    
    // Try to reconnect
    this.attemptReconnect();
    
    // Activate fallback if available
    if (this.fallbackProvider && !this.isProviderConnected(this.fallbackProvider)) {
      console.log('Activating fallback provider');
      this.fallbackProvider.connect();
    }
  }

  /**
   * Handle browser coming online
   */
  private handleOnline = (): void => {
    console.log('Browser online, attempting to reconnect');
    
    if (this.provider && !this.isProviderConnected(this.provider)) {
      this.provider.connect();
    }
  };

  /**
   * Handle browser going offline
   */
  private handleOffline = (): void => {
    console.log('Browser offline, connection may be disrupted');
    this.updateStatus('disconnected');
  };

  /**
   * Attempt to reconnect to WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.reconnectAttempt >= this.config.reconnectAttempts!) {
      console.error(`Failed to reconnect after ${this.reconnectAttempt} attempts`);
      return;
    }
    
    this.updateStatus('reconnecting');
    this.reconnectAttempt++;
    
    console.log(`Reconnection attempt ${this.reconnectAttempt} of ${this.config.reconnectAttempts}`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.provider) {
        this.provider.connect();
      }
    }, this.config.reconnectInterval! * Math.min(this.reconnectAttempt, 3));
  }

  /**
   * Check if a provider is currently connected
   */
  private isProviderConnected(provider: Provider): boolean {
    if (isWebsocketProvider(provider)) {
      return provider.wsconnected;
    } else if (isWebrtcProvider(provider)) {
      // For WebRTC, we check if there are connected peers
      const peers = (provider as WebrtcProvider).awareness.getStates();
      return peers.size > 1; // More than just ourselves
    }
    return false;
  }

  /**
   * Update connection status and notify listeners
   */
  private updateStatus(status: ConnectionStatus): void {
    if (status !== this.currentStatus) {
      this.currentStatus = status;
      this.statusListeners.forEach(listener => listener(status));
      
      // Log status for debugging
      console.log(`WebSocket status changed: ${status}`);
    }
  }

  /**
   * Subscribe to connection status changes
   */
  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.push(callback);
    
    // Immediately call with current status
    callback(this.currentStatus);
    
    // Return unsubscribe function
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  /**
   * Get default user data if none provided
   */
  private getDefaultUserData(): { id: string; name: string; color: string } {
    // Try to get persistent user ID from localStorage
    let userId = '';
    let userName = '';
    let userColor = '';
    
    if (typeof window !== 'undefined' && window.localStorage) {
      userId = localStorage.getItem('user-id') || '';
      userName = localStorage.getItem('user-name') || '';
      userColor = localStorage.getItem('user-color') || '';
    }
    
    // Generate new values if not found
    if (!userId) {
      userId = 'user-' + Math.floor(Math.random() * 1000000).toString();
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user-id', userId);
      }
    }
    
    if (!userName) {
      userName = `User ${userId.slice(-4)}`;
    }
    
    if (!userColor) {
      // Generate a vibrant color
      const hue = Math.floor(Math.random() * 360);
      userColor = `hsl(${hue}, 70%, 50%)`;
    }
    
    return { id: userId, name: userName, color: userColor };
  }

  /**
   * Force synchronization of the document
   */
  public forceSync(): void {
    if (this.provider && isWebsocketProvider(this.provider) && 
        this.provider.wsconnected && this.ydoc) {
      // Force sync through the provider's internal API
      try {
        // @ts-ignore - Internal API
        this.provider.emit('sync', [this.ydoc]);
        console.log('Manual sync triggered');
      } catch (err) {
        console.error('Error forcing sync:', err);
      }
    }
  }

  /**
   * Manually disconnect providers
   */
  public disconnect(): void {
    if (this.provider) {
      this.provider.disconnect();
    }
    
    if (this.fallbackProvider) {
      this.fallbackProvider.disconnect();
    }
    
    this.updateStatus('disconnected');
  }

  /**
   * Clean up resources when service is no longer needed
   */
  public destroy(): void {
    this.disconnect();
    
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }
    
    if (this.fallbackProvider) {
      this.fallbackProvider.destroy();
      this.fallbackProvider = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.statusListeners = [];
    
    // Remove window event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Log detailed connection information for debugging
   */
  public logConnectionDetails(): void {
    console.group('WebSocket Connection Details');
    console.log('Connection Status:', this.currentStatus);
    
    if (this.provider && isWebsocketProvider(this.provider)) {
      console.log('Primary Provider:', {
        type: 'WebSocket',
        connected: this.provider.wsconnected,
        url: this.config.primaryUrl,
        room: this.provider.roomname,
      });
    } else if (this.provider && isWebrtcProvider(this.provider)) {
      console.log('Primary Provider:', {
        type: 'WebRTC',
        connected: 'peers' in this.provider ? Object.keys(this.provider.peers).length > 0 : false,
        roomName: this.provider.roomName,
      });
    }
    
    if (this.fallbackProvider) {
      console.log('Fallback Provider:', {
        type: isWebsocketProvider(this.fallbackProvider) ? 'WebSocket' : 'WebRTC',
        active: this.isProviderConnected(this.fallbackProvider),
      });
    }
    
    if (this.provider) {
      const states = Array.from(this.provider.awareness.getStates().entries());
      console.log('Connected Users:', states.length);
      states.forEach(([clientId, state]) => {
        if (state.user) {
          console.log(`- User ${clientId}:`, state.user);
        }
      });
    }
    
    console.groupEnd();
  }
  
  /**
   * Debug mode for connection issues
   */
  public enableDebugMode() {
    console.log('WebSocket Debug Mode Enabled');
    
    // Log all config
    console.log('WebSocket Config:', this.config);
    
    // Log environment variables
    console.log('Environment Variables:');
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_WEBSOCKET')) {
        console.log(`- ${key}: ${import.meta.env[key]}`);
      }
    });
    
    // Add detailed connection logging
    if (this.provider) {
      if (isWebsocketProvider(this.provider)) {
        console.log('Setting up WebSocket debug hooks');
        
        // @ts-ignore - Access internal socket
        const socket = this.provider._ws;
        
        if (socket) {
          const originalSend = socket.send;
          socket.send = function(data) {
            console.log('WS → Sending data', data.byteLength || data.length);
            return originalSend.apply(this, arguments);
          };
          
          const originalOnMessage = socket.onmessage;
          socket.onmessage = function(event) {
            console.log('WS ← Received data', event.data.byteLength || event.data.length);
            return originalOnMessage.apply(this, arguments);
          };
        }
      }
    }
    
    return this;
  }
}

export default WebSocketService;
