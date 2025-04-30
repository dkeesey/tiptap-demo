#!/bin/bash

# Define colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m' 
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TipTap WebSocket Connection Fixer ===${NC}"

# 1. Check server status
echo -e "${YELLOW}Checking server status...${NC}"

if lsof -ti:1236 > /dev/null; then
  echo -e "${GREEN}✓ WebSocket server is running on port 1236${NC}"
else
  echo -e "${RED}× WebSocket server is not running!${NC}"
  echo "Starting WebSocket server..."
  ./start-websocket-server.sh simple &
  sleep 2
fi

if lsof -ti:5173 > /dev/null; then
  echo -e "${GREEN}✓ Vite server is running on port 5173${NC}"
else
  echo -e "${RED}× Vite server is not running!${NC}"
  echo "Starting Vite server..."
  npm run dev -- --host localhost --force &
  sleep 2
fi

# 2. Create a basic test client
echo -e "\n${YELLOW}Creating WebSocket test client...${NC}"

cat > ws-test.js << 'EOL'
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:1236/tiptap-demo-default-room');

ws.on('open', function open() {
  console.log('Connection opened successfully!');
  
  // Send a test message
  ws.send('TEST_PING');
  
  // Close after 2 seconds
  setTimeout(() => {
    ws.close();
    console.log('Test completed successfully.');
    process.exit(0);
  }, 2000);
});

ws.on('message', function incoming(data) {
  console.log('Received:', data);
});

ws.on('error', function error(err) {
  console.error('Error:', err.message);
  process.exit(1);
});

// Set timeout
setTimeout(() => {
  console.error('Connection timed out!');
  process.exit(1);
}, 5000);
EOL

# 3. Test the connection
echo -e "\n${YELLOW}Testing WebSocket connection...${NC}"
node ws-test.js
TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ WebSocket connection test passed!${NC}"
else
  echo -e "${RED}× WebSocket connection test failed!${NC}"
  
  # 4. If test failed, try to restart WebSocket server
  echo -e "\n${YELLOW}Restarting WebSocket server...${NC}"
  kill -9 $(lsof -ti:1236) 2>/dev/null
  sleep 1
  ./start-websocket-server.sh simple &
  sleep 2
  
  echo -e "\n${YELLOW}Retesting connection...${NC}"
  node ws-test.js
  RETEST_RESULT=$?
  
  if [ $RETEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ WebSocket connection restored!${NC}"
  else
    echo -e "${RED}× WebSocket connection still failing!${NC}"
  fi
fi

# 5. Provide browser fix instructions
echo -e "\n${YELLOW}Browser instructions:${NC}"
echo "1. Open your browser to http://localhost:5173"
echo "2. Open developer tools (F12)"
echo "3. Run these commands in the console:"
echo -e "${GREEN}   localStorage.setItem('ws_debug', 'true');${NC}"
echo -e "${GREEN}   localStorage.setItem('y_debug', 'true');${NC}"
echo -e "${GREEN}   localStorage.setItem('websocket_url', 'ws://localhost:1236');${NC}"
echo "4. Refresh the page"

echo -e "\n${GREEN}Fix completed! Try refreshing your browser.${NC}"