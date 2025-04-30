#!/bin/bash
# Test script to run Railway components locally
set -e

# Colors
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${GREEN}=== Testing Railway Components Locally ===${RESET}\n"

# Check if the WebSocket server is already running on port 1236
WS_RUNNING=$(lsof -i:1236 | grep LISTEN || echo "not running")

if [[ "$WS_RUNNING" == *"not running"* ]]; then
  echo -e "${YELLOW}Starting Railway WebSocket server in a new terminal window...${RESET}"
  
  # Start WebSocket server in a new terminal window
  osascript -e 'tell application "Terminal" to do script "cd '$PWD' && node RailwayEnhancedWebSocketServer.cjs"' &
  
  # Wait for server to start
  echo "Waiting for WebSocket server to start..."
  sleep 3
else
  echo -e "${YELLOW}WebSocket server already running on port 1236${RESET}"
fi

# Set environment variables for Vite
export VITE_WEBSOCKET_URL="ws://localhost:1236"
export VITE_RAILWAY_DEPLOYMENT="true"

# Create a temporary index.html file that uses the Railway app
mkdir -p public
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TipTap - Railway Test</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main-railway.tsx"></script>
  </body>
</html>
EOF

echo -e "${GREEN}Starting Railway frontend in development mode...${RESET}"
echo -e "${GREEN}WebSocket Server: ${YELLOW}ws://localhost:1236${RESET}"
echo -e "${GREEN}Frontend URL: ${YELLOW}http://localhost:5173${RESET}\n"

echo -e "${YELLOW}Note: Close this terminal when done testing${RESET}\n"

# Start Vite in development mode with the Railway app
npx vite --force
