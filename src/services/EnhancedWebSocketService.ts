import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc';

// Connection status type
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Connection modes
export type ConnectionMode = 'websocket' | 'webrtc' | 'hybrid';

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
  // Connection mode (websocket, webrtc, or hybrid)
  connectionMode?: ConnectionMode;
  // Connection retry strategy ('exponential' or 'linear')
  retryStrategy?: 'exponential' | 'linear';
  // User data for awareness
  userData?: {
    id: string;
    name: string;
    color: string;
  };
  // Enable verbose logging
  debug?: boolean;
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
 * Implements advanced reconnection strategies and diagnostics
 */
class EnhancedWebSocketService {
  private static instance: EnhancedWebSocketService;
  private config: WebSocketConfig;
  private provider: Provider | null = null;
  private fallbackProvider: Provider | null = null;
  private currentStatus: ConnectionStatus = 'disconnected';
  private statusListeners: ((status: ConnectionStatus, details?: any) => void)[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private ydoc: Y.Doc | null = null;
  private lastError: Error | null = null;
  private lastConnectionAttempt = 0;
  private healthCheckTimer: ReturnType<typeof setTimeout> | null = null;
  private activeProvider: 'primary' | 'fallback' | null = null;
  private websocketStats = {
    messagesReceived: 0,
    messagesSent: 0,
    connectAttempts: 0,
    successfulConnections: 0,
    disconnections: 0,
    errors: 0,
    lastMessageTime: 0
  };
