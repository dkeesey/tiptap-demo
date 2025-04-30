#!/bin/bash
# deploy-frontend-fixed.sh - Deploy ONLY the frontend to Railway

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
railway add --name tiptap-frontend

# Switch to frontend service
echo "Linking to frontend service..."
railway service tiptap-frontend

# Deploy frontend
echo "Copying frontend configuration..."
cp frontend-railway.json railway.json

echo "Deploying frontend to Railway..."
railway up

# Get domain for frontend
echo "Getting frontend URL..."
railway domain

echo "Frontend deployment complete!"
