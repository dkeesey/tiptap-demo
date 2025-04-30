#!/bin/bash
# final-frontend-fix.sh - Final fix for the frontend deployment

set -e  # Exit on any error
set -x  # Print commands for debugging

echo "========================================"
echo "TipTap Frontend Final Fix"
echo "========================================"

# Create a simple server.js file for serving static content
echo "Creating server.js file..."
cat > server.js << EOF
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// For any other route, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Set port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
  console.log(\`Using WebSocket URL: \${process.env.VITE_WEBSOCKET_URL || 'not set'}\`);
});
EOF

# Install Express (if not already installed)
echo "Installing express..."
npm install --save express

# Build the frontend
echo "Building frontend with correct WebSocket URL..."
VITE_WEBSOCKET_URL="wss://websocket-server-production-b045.up.railway.app" npm run build

# Create Railway configuration for the frontend
echo "Creating Railway configuration for frontend service..."
cat > railway.json << EOF
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

# Set Railway variables
echo "Setting Railway variables..."
railway variables --set "PORT=3000" --set "NODE_ENV=production" --set "VITE_WEBSOCKET_URL=wss://websocket-server-production-b045.up.railway.app"

# Deploy to Railway
echo "Deploying to Railway..."
railway up

echo "Frontend deployment complete. Check Railway dashboard for frontend URL."
