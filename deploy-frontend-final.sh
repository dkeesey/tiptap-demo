#!/bin/bash
# deploy-frontend-final.sh - Deploy ONLY the frontend to Railway

set -e  # Exit on any error

echo "========================================"
echo "TipTap Frontend Deployment"
echo "========================================"

# Set WebSocket URL
WS_URL="websocket-server-production-b045.up.railway.app"
echo "Using WebSocket URL: wss://$WS_URL"

# Update frontend environment variables
echo "Updating frontend environment variables..."
cat > .env.production << EOF
VITE_WEBSOCKET_URL=wss://$WS_URL
VITE_WEBSOCKET_PRIMARY_URL=wss://$WS_URL
VITE_APP_TITLE=TipTap Collaborative Editor
ENABLE_COLLABORATION=true
EOF

# Build frontend
echo "Building frontend..."
npm run build

# Add a new service using the correct command
echo "Adding new service for frontend..."
railway add --service tiptap-frontend

# Copy Railway configuration
echo "Copying frontend configuration..."
cp frontend-railway.json railway.json

# Deploy frontend
echo "Deploying frontend to Railway..."
railway up

# Add domain for frontend
echo "Adding domain for frontend..."
railway domain

echo "Frontend deployment complete!"
echo "Check Railway dashboard for frontend URL"
