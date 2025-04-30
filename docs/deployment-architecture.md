# TipTap Collaborative Editor - Deployment Architecture

## Overview

The TipTap Collaborative Editor uses a distributed architecture with two main components:

1. **Frontend Application**: React/Vite application with TipTap editor
2. **WebSocket Server**: Y.js WebSocket provider for real-time collaboration

This document explains the deployment architecture, environment configuration, and synchronization mechanisms.

## Deployment Options

### Option 1: Consolidated Railway Deployment (Recommended)

In this architecture, both the frontend and WebSocket server are deployed on Railway, providing simplified management and environment synchronization.

![Consolidated Railway Architecture](../public/images/consolidated-railway-architecture.png)

**Benefits:**
- Single platform for deployment management
- Simplified environment variable sharing
- Coordinated deployments
- Unified logging and monitoring
- Lower latency between services

**Components:**
- **Frontend Service**: Serves the Vite-built static files
- **WebSocket Service**: Runs the Y.js WebSocket server

### Option 2: Hybrid Deployment (Vercel + Railway)

This architecture deploys the frontend on Vercel and the WebSocket server on Railway.

![Hybrid Deployment Architecture](../public/images/hybrid-deployment-architecture.png)

**Benefits:**
- Leverages Vercel's frontend optimization
- Utilizes Railway's WebSocket capabilities
- Separates concerns for specialized scaling

**Components:**
- **Vercel**: Hosts the frontend application
- **Railway**: Runs the WebSocket server

## Implementation Details

### WebSocket Connection Handling

The system uses a robust connection strategy:

1. **URL Resolution Logic**:
   ```typescript
   primaryUrl: 
     // First try environment variables (production deployment)
     import.meta.env.VITE_WEBSOCKET_URL || 
     import.meta.env.VITE_WEBSOCKET_PRIMARY_URL || 
     // Then detect if we're in a secure context (https)
     (window.location.protocol === 'https:' 
       ? 'wss://tiptap-demo-production.up.railway.app' 
       : 'ws://localhost:1236')
   ```

2. **Fallback Mechanisms**:
   - WebRTC peer-to-peer fallback when WebSocket is unavailable
   - Automatic reconnection with exponential backoff
   - Local persistence during disconnection

3. **Error Handling**:
   - Comprehensive error detection and recovery
   - Visual connection status indicators
   - Detailed logging for troubleshooting

### Environment Configuration

Environment variables are managed differently in each deployment option:

#### Railway Deployment
```
# WebSocket Server Variables
PORT=8080
LOG_LEVEL=2
NODE_ENV=production

# Frontend Variables
VITE_WEBSOCKET_URL=wss://[websocket-service-url]
VITE_WEBSOCKET_PRIMARY_URL=wss://[websocket-service-url]
VITE_APP_TITLE=TipTap Collaborative Editor
ENABLE_COLLABORATION=true
```

#### Vercel Deployment
```json
{
  "env": {
    "VITE_WEBSOCKET_URL": "wss://tiptap-demo-production.up.railway.app",
    "VITE_WEBSOCKET_PRIMARY_URL": "wss://tiptap-demo-production.up.railway.app"
  }
}
```

### Deployment Synchronization

Deployment is coordinated using custom scripts:

1. `deploy-railway.sh`: Deploys both services to Railway
2. `validate-env.sh`: Validates environment variables
3. `collect-logs.sh`: Gathers logs for troubleshooting

The deployment process ensures that:
- The WebSocket server is deployed first
- Its URL is captured and added to the frontend's environment
- The frontend is built with the correct environment variables
- Both services are validated after deployment

## WebSocket Server Architecture

The WebSocket server uses a custom implementation built on:

- **Y.js**: CRDT for conflict-free editing
- **WebSocket**: Server-client communication
- **Node.js**: Runtime environment

Key features include:

1. **Health Endpoint**: `/health` provides server status and connection metrics
2. **CORS Configuration**: Proper headers for cross-origin communication
3. **Connection Management**: Robust handling of connection lifecycle
4. **Error Recovery**: Automatic recovery from connection issues

## Monitoring and Troubleshooting

The system provides several tools for monitoring and troubleshooting:

1. **Connection Status Component**: Visual indicator of connection state
2. **Detailed Logging**: Comprehensive logging at different levels
3. **Health Endpoints**: Status check for WebSocket server
4. **Log Collection**: Automated log gathering for troubleshooting

## Scaling Considerations

The architecture is designed to scale with increasing users:

1. **Frontend Scaling**:
   - Static content can be served from CDN
   - Multiple instances can share the same WebSocket server

2. **WebSocket Server Scaling**:
   - Can be horizontally scaled with load balancing
   - WebRTC provides peer-to-peer fallback for direct connections

3. **Data Persistence**:
   - Y.js CRDT ensures data consistency across clients
   - Local persistence during disconnection
   - Automatic synchronization on reconnection

## Security Considerations

The deployment addresses several security concerns:

1. **Transport Security**:
   - WebSocket connections use WSS (WebSocket Secure) protocol
   - Frontend uses HTTPS for all communication

2. **CORS Configuration**:
   - Proper headers for cross-origin communication
   - Configured for production security requirements

3. **Environment Variable Handling**:
   - Secure management of deployment variables
   - Validation to prevent misconfiguration

## Conclusion

This deployment architecture provides a robust, scalable solution for collaborative editing. The dual options (consolidated Railway or hybrid Vercel+Railway) offer flexibility based on project requirements, while the comprehensive error handling and monitoring tools ensure reliability in production environments.
