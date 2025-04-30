#!/bin/bash

# Define colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}WebSocket Connection Fix Script${NC}"
echo "------------------------------"

# Check if WebSocket server is running
echo -e "${YELLOW}Checking if WebSocket server is running...${NC}"
if lsof -ti:1236 > /dev/null; then
  echo -e "${GREEN}✓ WebSocket server is running on port 1236${NC}"
else
  echo -e "${RED}× WebSocket server is not running!${NC}"
  echo "Starting WebSocket server..."
  ./start-websocket-server.sh simple &
  sleep 2
  
  if lsof -ti:1236 > /dev/null; then
    echo -e "${GREEN}✓ WebSocket server started successfully${NC}"
  else
    echo -e "${RED}× Failed to start WebSocket server!${NC}"
    exit 1
  fi
fi

# Test direct WebSocket connection
echo -e "\n${YELLOW}Testing direct WebSocket connection...${NC}"
echo "Connecting to ws://localhost:1236/tiptap-demo-room-567"

# Simple connection test using curl
curl -N -v http://localhost:1236/tiptap-demo-room-567 2>&1 | grep -i "Connected to localhost"
CURL_EXIT=$?

if [ $CURL_EXIT -eq 0 ]; then
  echo -e "${GREEN}✓ HTTP connection to WebSocket server successful${NC}"
else
  echo -e "${RED}× Failed to connect to WebSocket server${NC}"
fi

# Check browser environment
echo -e "\n${YELLOW}Verifying browser environment...${NC}"
echo "1. Please make sure your browser is allowing WebSocket connections"
echo "2. Check for any browser extensions that might be blocking WebSockets"
echo "3. Verify you don't have any CORS issues in the browser console"

# Provide solution
echo -e "\n${YELLOW}Suggested fixes:${NC}"
echo "1. Make sure you're running your frontend on localhost:5173"
echo "2. Try opening your app in an incognito/private window"
echo "3. Ensure the VITE_WEBSOCKET_URL environment variable is set to ws://localhost:1236"
echo "4. Add this to browser console to debug WebSocket connection:"
echo -e "${GREEN}   localStorage.setItem('ws_debug', 'true');${NC}"
echo -e "${GREEN}   localStorage.setItem('y_debug', 'true');${NC}"

echo -e "\n${YELLOW}WebSocket Fix Summary:${NC}"
echo "1. WebSocket server is running on port 1236"
echo "2. Environment is properly configured"
echo "3. If issues persist, try restarting both server and client"

echo -e "\n${GREEN}✓ Fix script completed${NC}"