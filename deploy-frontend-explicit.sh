#!/bin/bash
# deploy-frontend-explicit.sh - Deploy ONLY the frontend to Railway with explicit steps

set -e  # Exit on any error
set -x  # Print commands for debugging

echo "========================================"
echo "TipTap Frontend Explicit Deployment"
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

# Ensure the dist directory is up-to-date
echo "Building frontend..."
npm run build

# Create vercel.json for static hosting
echo "Creating vercel.json for static hosting..."
cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    { "src": "dist/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/dist/$1" }
  ],
  "env": {
    "VITE_WEBSOCKET_URL": "wss://$WS_URL",
    "VITE_WEBSOCKET_PRIMARY_URL": "wss://$WS_URL",
    "VITE_APP_TITLE": "TipTap Collaborative Editor",
    "ENABLE_COLLABORATION": "true"
  }
}
EOF

# Create a simplified railway.json file
echo "Creating simplified Railway configuration..."
cat > railway.json << EOF
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npx serve -s dist",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

# Clear the existing deployment if any (optional)
railway down || true

# Create a simple server.js file for serving static content
echo "Creating simple server.js file..."
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
  console.log(\`Using WebSocket URL: \${process.env.VITE_WEBSOCKET_URL}\`);
});
EOF

# Add express as a dependency
echo "Adding express dependency..."
npm install --save express

# Update package.json start script
echo "Updating package.json start script..."
sed -i '' 's/"scripts": {/"scripts": {\n    "start": "node server.js",/g' package.json || true

# Deploy to Railway
echo "Deploying to Railway..."
railway up

# Get the domain
echo "Getting frontend domain..."
railway domain

echo "Deployment completed."
