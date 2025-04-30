#!/bin/bash
# deploy-frontend.sh - Deploy ONLY the frontend to Railway

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

# Create a new service for the frontend
echo "Creating new Railway service for frontend..."
railway service new --name tiptap-frontend

# Deploy frontend
echo "Copying frontend configuration..."
cp frontend-railway.json railway.json

echo "Deploying frontend to Railway..."
railway up --detach

echo "Frontend deployment complete!"
echo "Check Railway dashboard for frontend URL"
