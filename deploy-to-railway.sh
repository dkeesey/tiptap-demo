#!/bin/bash
# Railway deployment script for TipTap Collaborative Editor
# This script deploys both the WebSocket server and the frontend to Railway

set -e  # Exit on any error

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${BOLD}${GREEN}=== TipTap Collaborative Editor - Railway Deployment ===${RESET}\n"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Railway CLI not found. Installing...${RESET}"
    npm install -g @railway/cli
fi

# Check login status
RAILWAY_STATUS=$(railway whoami 2>&1 || echo "Not logged in")
if [[ "$RAILWAY_STATUS" == *"Not logged in"* ]]; then
    echo -e "${YELLOW}You need to log in to Railway first.${RESET}"
    railway login
fi

# Create Railway project if it doesn't exist
PROJECT_NAME="tiptap-collaborative-editor"
PROJECT_EXISTS=$(railway project list | grep "$PROJECT_NAME" || echo "not found")

if [[ "$PROJECT_EXISTS" == *"not found"* ]]; then
    echo -e "${YELLOW}Creating new Railway project: $PROJECT_NAME...${RESET}"
    railway project create --name "$PROJECT_NAME"
fi

# Link to project
echo -e "${GREEN}Linking to project: $PROJECT_NAME...${RESET}"
railway link --project "$PROJECT_NAME"

# Deploy WebSocket server
echo -e "\n${BOLD}${GREEN}=== Deploying WebSocket Server ===${RESET}\n"

# Copy enhanced WebSocket server to current directory if needed
if [ ! -f "RailwayEnhancedWebSocketServer.cjs" ]; then
    echo -e "${YELLOW}RailwayEnhancedWebSocketServer.cjs not found. Using existing server.${RESET}"
else 
    echo -e "${GREEN}Using enhanced WebSocket server for Railway.${RESET}"
fi

# Create websocket service
echo -e "${GREEN}Creating WebSocket service...${RESET}"
railway service create --name websocket-server
railway link --service websocket-server

# Copy Railway configuration
cp railway-websocket.json railway.json

# Set environment variables
echo -e "${GREEN}Setting WebSocket service environment variables...${RESET}"
railway variables set \
    LOG_LEVEL=2 \
    NODE_ENV=production \
    RAILWAY_WEBSOCKET=true

# Deploy websocket server
echo -e "${GREEN}Deploying WebSocket server...${RESET}"
railway up

# Get the WebSocket service URL
echo -e "${GREEN}Getting WebSocket service URL...${RESET}"
WS_URL=$(railway service plugin add --yes railway-plugin-domain --name websocket-server | grep -o 'https://[^ ]*' | sed 's/https:/wss:/')

if [ -z "$WS_URL" ]; then
    echo -e "${RED}Failed to get WebSocket URL. Using default.${RESET}"
    WS_URL="wss://websocket-server-production.up.railway.app"
fi

echo -e "${GREEN}WebSocket URL: $WS_URL${RESET}"

# Deploy frontend
echo -e "\n${BOLD}${GREEN}=== Deploying Frontend ===${RESET}\n"

# Create frontend service
echo -e "${GREEN}Creating frontend service...${RESET}"
railway service create --name frontend
railway link --service frontend

# Copy Railway configuration
cp railway-frontend.json railway.json

# Set environment variables
echo -e "${GREEN}Setting frontend environment variables...${RESET}"
railway variables set \
    NODE_ENV=production \
    VITE_WEBSOCKET_URL="$WS_URL" \
    VITE_APP_TITLE="TipTap Collaborative Editor" \
    ENABLE_COLLABORATION=true \
    ENABLE_WEBSOCKET_FALLBACK=true

# Deploy frontend
echo -e "${GREEN}Deploying frontend...${RESET}"
railway up

# Get the frontend service URL
echo -e "${GREEN}Getting frontend service URL...${RESET}"
FRONTEND_URL=$(railway service plugin add --yes railway-plugin-domain --name frontend | grep -o 'https://[^ ]*')

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}Failed to get frontend URL.${RESET}"
else
    echo -e "${GREEN}Frontend URL: $FRONTEND_URL${RESET}"
fi

# Clean up
rm railway.json

echo -e "\n${BOLD}${GREEN}=== Deployment Complete ===${RESET}\n"
echo -e "WebSocket Server: ${BOLD}$WS_URL${RESET}"
echo -e "Frontend: ${BOLD}$FRONTEND_URL${RESET}"
echo -e "\nYou can view your services in the Railway dashboard: https://railway.app/dashboard\n"

# Test connections
echo -e "${YELLOW}Would you like to test the WebSocket connection? (y/n)${RESET}"
read TEST_CONNECTION

if [[ "$TEST_CONNECTION" == "y" ]]; then
    echo -e "${GREEN}Testing WebSocket connection...${RESET}"
    # Create a simple test script
    cat > test-railway-connection.js << EOF
const WebSocket = require('ws');
const http = require('http');

const websocketUrl = "$WS_URL";
const httpUrl = websocketUrl.replace('wss:', 'https:');

// Test HTTP endpoint
console.log("Testing HTTP health endpoint...");
http.get(httpUrl + "/health", (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("HTTP Status:", res.statusCode);
    console.log("Health endpoint response:", JSON.parse(data));
    
    // Test WebSocket connection after HTTP test
    testWebSocket();
  });
}).on('error', (err) => {
  console.error("HTTP Error:", err.message);
  process.exit(1);
});

// Test WebSocket connection
function testWebSocket() {
  console.log("\nTesting WebSocket connection...");
  const ws = new WebSocket(websocketUrl);
  
  ws.on('open', () => {
    console.log("WebSocket connection established successfully!");
    setTimeout(() => {
      ws.close();
      console.log("WebSocket connection test complete!");
      process.exit(0);
    }, 1000);
  });
  
  ws.on('error', (error) => {
    console.error("WebSocket Error:", error.message);
    process.exit(1);
  });
  
  // Set connection timeout
  setTimeout(() => {
    console.error("WebSocket connection timeout!");
    process.exit(1);
  }, 5000);
}
EOF

    # Run the test script
    node test-railway-connection.js
fi

echo -e "\n${BOLD}${GREEN}=== All Done! ===${RESET}\n"
