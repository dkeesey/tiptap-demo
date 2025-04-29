# TipTap WebSocket Deployment - Implementation Memo

## Current Status

1. **WebSocket Server**:
   - Deployed successfully on Railway at: `https://tiptap-demo-production.up.railway.app`
   - WebSocket URL for secure connections: `wss://tiptap-demo-production.up.railway.app`
   - Health endpoint (/health) is working correctly
   - Using `simple-server.js` which provides a minimal WebSocket implementation

2. **Frontend Application**:
   - Deployed on Vercel
   - Environment variable configuration exists in vercel.json: `VITE_WEBSOCKET_URL: "@websocket_url"`
   - Currently not connecting properly to the WebSocket server

## Implementation Details

### WebSocket Client Implementation

The frontend uses a dual-provider approach for collaborative editing:

1. **Primary Connection**: WebSocket provider (y-websocket)
   ```javascript
   // In WebSocketService.ts
   this.config = {
     primaryUrl: import.meta.env.VITE_WEBSOCKET_PRIMARY_URL || 'ws://localhost:1236',
     ...
   }
   
   // In CollaborationContext.tsx
   const wsService = WebSocketService.getInstance({
     primaryUrl: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1236',
     userData: currentUser
   });
   ```

2. **Fallback Connection**: WebRTC provider (y-webrtc)
   - Activates if WebSocket connection fails
   - Uses a public signaling server (wss://y-webrtc-signal-backend.fly.dev)

### Environment Configuration Issues

**Current issues**:
- In App.tsx, a hardcoded WebSocket URL: `const websocketUrl = 'ws://localhost:1236'`
- Environment variable inconsistency: `VITE_WEBSOCKET_URL` vs `VITE_WEBSOCKET_PRIMARY_URL`
- Development .env file uses port 8080: `VITE_WEBSOCKET_URL=ws://localhost:8080`

## Required Changes

1. **Standardize Environment Variable Usage**:
   - Use `VITE_WEBSOCKET_URL` consistently across all files
   - Remove hardcoded WebSocket URLs in App.tsx
   - Update WebSocketService.ts to use the same environment variable

2. **Update Vercel Environment Variable**:
   - In Vercel dashboard, set `@websocket_url` to: `wss://tiptap-demo-production.up.railway.app`
   - Ensure the URL uses `wss://` protocol for production

3. **CORS Configuration**:
   - Ensure the WebSocket server allows connections from Vercel domains
   - Add proper headers to server.js or simple-server.js

## Testing and Verification

After making these changes, verify the integration:

1. **Browser Console Check**:
   - Look for WebSocket connection messages
   - Check for any CORS or connection errors

2. **Collaboration Test**:
   - Try editing with multiple browser windows/devices
   - Verify that changes synchronize in real-time

3. **Health Check**:
   - Verify the Railway server remains healthy
   - Ensure no memory leaks or connection issues

## Best Practices from Project Documentation

1. **Connection Status Feedback**:
   - Provide visible indicators of connection status
   - Implement proper error messages for connection failures

2. **Fallback Strategy**:
   - Maintain the dual-provider approach for resilience
   - Test WebRTC fallback functionality

3. **Error Handling**:
   - Implement proper connection retry logic with exponential backoff
   - Handle connection state changes with debouncing
   - Provide meaningful error messages to users

## Next Steps

1. Update frontend code to use the correct environment variable consistently
2. Configure Vercel with the correct WebSocket URL
3. Redeploy frontend application
4. Test the collaborative editing functionality
5. Monitor for any remaining connection issues
