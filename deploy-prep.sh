#!/bin/bash

# Deployment Preparation Script for TipTap Demo

# Ensure we're in the project directory
cd "$(dirname "$0")"

# Install dependencies
npm install

# Build the application
npm run build

# Verify build artifacts
if [ ! -d "dist" ]; then
    echo "Build failed: No dist directory created"
    exit 1
fi

# Create .env.production file with deployment variables
cat > .env.production << EOL
VITE_WEBSOCKET_URL=wss://websocket-server-production-b045.up.railway.app
NODE_ENV=production
REACT_APP_WEBSOCKET_URL=wss://websocket-server-production-b045.up.railway.app
RAILWAY_PUBLIC_DOMAIN=tiptap-demo-production.up.railway.app
EOL

# Verify the WebSocket server configuration
if [ ! -f "EnhancedWebSocketServer.cjs" ]; then
    echo "WebSocket server configuration missing"
    exit 1
fi

echo "Deployment preparation complete. Ready for Railway/Vercel deployment."
