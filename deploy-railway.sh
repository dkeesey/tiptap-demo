#!/bin/bash
# deploy-railway.sh - Deploy both services to Railway

set -e  # Exit on any error

# Show script title
echo "========================================"
echo "TipTap Collaborative Editor Deployment"
echo "========================================"

# Step 1: Deploy WebSocket server first
echo -e "\n[1/4] Deploying WebSocket server..."

# Ensure correct railway configuration
cp websocket-railway.json railway.json

# Deploy to Railway
echo "Deploying WebSocket server to Railway..."
railway up --detach

# Get WebSocket URL
echo "Retrieving WebSocket URL..."
WS_URL=$(railway domain)
if [ -z "$WS_URL" ]; then
  echo "ERROR: Could not get WebSocket URL from Railway"
  exit 1
fi
echo "WebSocket server deployed at: wss://$WS_URL"

# Step 2: Update frontend environment variables
echo -e "\n[2/4] Updating frontend environment variables..."
cat > .env.production << EOF
VITE_WEBSOCKET_URL=wss://$WS_URL
VITE_WEBSOCKET_PRIMARY_URL=wss://$WS_URL
VITE_APP_TITLE=TipTap Collaborative Editor
ENABLE_COLLABORATION=true
EOF

# Step 3: Build frontend
echo -e "\n[3/4] Building frontend..."
npm run build

# Step 4: Deploy frontend
echo -e "\n[4/4] Deploying frontend..."
cp frontend-railway.json railway.json
railway up --detach

# Get frontend URL
FRONTEND_URL=$(railway domain)
echo -e "\n✅ Deployment complete!"
echo "WebSocket server: wss://$WS_URL"
echo "Frontend: https://$FRONTEND_URL"

# Add permissions
chmod +x validate-env.sh
chmod +x collect-logs.sh

# Run validation
echo -e "\n[Validation] Checking deployment..."
./validate-env.sh

echo -e "\nDeployment completed successfully. You can now access the application at:"
echo "https://$FRONTEND_URL"
echo -e "\nIf you encounter any issues, run the following command to collect logs:"
echo "./collect-logs.sh"
