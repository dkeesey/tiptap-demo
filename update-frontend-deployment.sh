#!/bin/bash
# update-frontend-deployment.sh - Update the frontend service configuration and redeploy

set -e  # Exit on any error

echo "========================================"
echo "Updating TipTap Frontend Deployment"
echo "========================================"

# Set WebSocket URL
WS_URL="websocket-server-production-b045.up.railway.app"
echo "Using WebSocket URL: wss://$WS_URL"

# Create environment variables file
echo "Setting environment variables..."
cat > .env.production << EOF
VITE_WEBSOCKET_URL=wss://$WS_URL
VITE_APP_TITLE=TipTap Collaborative Editor
ENABLE_COLLABORATION=true
ENABLE_WEBSOCKET_FALLBACK=true
EOF

# Update railway.json with the correct start command
echo "Updating Railway configuration..."
cp frontend-railway.json railway.json

# Ensure express is installed for server.js
echo "Ensuring dependencies are installed..."
npm install express --save

# Deploy the updated frontend
echo "Deploying updated frontend to Railway..."
railway up

echo "========================================"
echo "Frontend deployment updated!"
echo "Check the deployment status at: https://tiptap-frontend-production.up.railway.app/"
echo "========================================" 