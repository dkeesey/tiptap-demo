# TipTap Collaborative Editor Demo

## Deployment Options

### Vercel (Frontend) + Railway (WebSocket Server)
This project uses a split deployment strategy:
1. Frontend deployed on Vercel: [https://tiptap-demo-chi.vercel.app/](https://tiptap-demo-chi.vercel.app/)
2. WebSocket server deployed on Railway: [https://tiptap-demo-production.up.railway.app/](https://tiptap-demo-production.up.railway.app/)

### Environment Variables
Set these environment variables in Vercel:
   - `VITE_WEBSOCKET_PRIMARY_URL`: WebSocket server URL (e.g., `wss://tiptap-demo-production.up.railway.app`)
   - `VITE_APP_TITLE`: Application title
   - `ENABLE_COLLABORATION`: Set to "true" to enable collaborative features
   - `DEBUG_WEBSOCKET`: Set to "true" to show connection debugger
   - `VITE_USE_WEBRTC_FALLBACK`: Set to "true" to enable WebRTC fallback

### Local Development
```bash
# Create .env.local with required variables
echo 'VITE_WEBSOCKET_PRIMARY_URL=wss://tiptap-demo-production.up.railway.app' > .env.local

# Install dependencies and start dev server
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

## WebSocket Collaboration
- Uses Railway WebSocket server for real-time collaboration
- Fallback to WebRTC when WebSocket is unavailable
- Robust reconnection and error handling
- User presence awareness

## Connection Debugging Features
- Real-time connection state monitoring
- Connected users tracking
- Detailed error reporting
- Test sync functionality

## Connection States
- Disconnected: No active WebSocket connection
- Connecting: Attempting to establish connection
- Connected: Active WebSocket connection
- Reconnecting: Attempting to reestablish connection
- Error: Connection failure with detailed error message

## Key Features
- Real-time collaborative editing
- User presence and cursor tracking
- Fallback connection methods
- Cross-tab synchronization
- Advanced connection debugging

## Troubleshooting
- Check browser console for detailed connection logs
- Verify WebSocket URL configuration in environment variables
- Ensure network connectivity
- Check Railway server logs for connection issues
