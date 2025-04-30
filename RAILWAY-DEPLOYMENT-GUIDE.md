# TipTap Collaborative Editor - Railway Deployment Guide

This guide explains how to deploy both the WebSocket server and frontend for the TipTap Collaborative Editor on Railway.

## Overview

Our TipTap Collaborative Editor uses two main components:
1. **WebSocket Server**: Handles real-time collaboration through Y.js
2. **Frontend Application**: The TipTap editor interface with React

By deploying both components on Railway, we can ensure reliable communication and consistent environment configuration.

## Why Railway?

- **Simplified Deployment**: Railway makes it easy to deploy both components from the same repository
- **Reliable Networking**: Internal networking between services for robust WebSocket connections
- **Easy Environment Management**: Shared configuration across services
- **Scalability**: Railway handles infrastructure needs as usage grows

## Step 1: Prepare for Deployment

Run the automated deployment script:

```bash
# Make script executable
chmod +x deploy-to-railway.sh

# Run deployment
./deploy-to-railway.sh
```

The script will:
1. Install the Railway CLI if needed
2. Create a new Railway project
3. Deploy the WebSocket server
4. Configure the environment variables
5. Deploy the frontend application
6. Connect the frontend to the WebSocket server
7. Test the connection

## Step 2: Manual Configuration (If Needed)

### WebSocket Server Configuration

If you need to make manual adjustments:

1. Navigate to your Railway dashboard
2. Select the WebSocket server service
3. Under "Variables", verify these environment variables:
   - `LOG_LEVEL`: `2`
   - `NODE_ENV`: `production`
   - `RAILWAY_WEBSOCKET`: `true`

4. Under "Settings", ensure:
   - Build Command: `npm install`
   - Start Command: `node RailwayEnhancedWebSocketServer.cjs`

### Frontend Configuration

1. Navigate to your frontend service
2. Under "Variables", verify:
   - `VITE_WEBSOCKET_URL`: The WebSocket URL (wss://your-websocket-service.railway.app)
   - `NODE_ENV`: `production`

3. Under "Settings", ensure:
   - Build Command: `npm run build:railway`
   - Start Command: `npm run start:railway`

## Step 3: Testing Your Deployment

1. Open your frontend URL from the Railway dashboard
2. Check the connection status indicator:
   - Green: Connected to WebSocket server
   - Yellow: Connecting
   - Red: Connection error

3. Test collaboration:
   - Open the same URL in another browser window
   - Make changes in one window
   - Verify they appear in the other window
   - Check that user cursors are visible

## Troubleshooting

### Connection Issues

1. **Check WebSocket Health**:
   ```
   curl https://your-websocket-service.railway.app/health
   ```
   
2. **Verify Environment Variables**:
   - Double-check `VITE_WEBSOCKET_URL` in the frontend service
   - Ensure it includes `wss://` (secure WebSockets)

3. **Check Browser Console**:
   - Open browser developer tools
   - Look for WebSocket connection errors

### Deployment Failures

1. Check deployment logs in the Railway dashboard
2. Verify Railway CLI authentication is current
3. Ensure package.json scripts are configured correctly

## Enhancing Your Deployment

### Custom Domains

1. In the Railway dashboard, go to your service
2. Navigate to "Settings" > "Domains"
3. Click "Generate Domain" or "Add Custom Domain"

### Monitoring and Performance

1. Use the enhanced health endpoint:
   ```
   curl https://your-websocket-service.railway.app/health
   ```

2. Review logs in the Railway dashboard
3. Monitor connection counts and room statistics

## Architecture

The TipTap Collaborative Editor on Railway uses a two-service architecture:

1. **WebSocket Server**:
   - Y.js for real-time collaboration
   - Connection management and persistence
   - Health monitoring and diagnostics
   
2. **Frontend Application**:
   - React with TipTap editor
   - Enhanced connection management
   - User identification and awareness
   - Status indicators and fallback mechanisms

## Development vs Production

During local development:
```bash
# Test Railway components locally
./test-railway-locally.sh
```

For production deployment:
```bash
# Deploy to Railway
./deploy-to-railway.sh
```

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [TipTap Editor Documentation](https://tiptap.dev/docs)
- [Y.js Documentation](https://docs.yjs.dev/)
