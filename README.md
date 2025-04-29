# TipTap Collaborative Editor Demo

## Deployment Options

### Vercel (Recommended)
1. Fork this repository
2. Connect to Vercel
3. Set environment variable:
   - `WEBSOCKET_URL`: WebSocket server URL (e.g., `wss://y-webrtc-signal-backend.fly.dev`)

### Local Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

## WebSocket Collaboration
- Uses public WebSocket service by default
- Customize WebSocket URL via `WEBSOCKET_URL` environment variable
- Comprehensive connection status tracking
- Robust error handling and connection state management

## Connection Debugging Features
- Real-time connection state monitoring
- Peer count tracking
- Detailed error reporting
- Persistent connection status indicator

## Connection States
- Disconnected: No active WebSocket connection
- Connecting: Attempting to establish connection
- Connected: Active WebSocket connection
- Error: Connection failure with detailed error message

## Key Features
- Real-time collaborative editing
- Persistent document state
- Cross-tab synchronization
- Advanced connection debugging

## Troubleshooting
- Check browser console for detailed connection logs
- Verify WebSocket URL configuration
- Ensure network connectivity
