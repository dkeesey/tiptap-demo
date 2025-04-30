#!/bin/bash

# Define colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m' 
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting TipTap Demo with Collaboration Features ===${NC}"

# Stop any existing services on the required ports
echo -e "${YELLOW}Stopping any existing services...${NC}"
kill -9 $(lsof -t -i:1236) 2>/dev/null
kill -9 $(lsof -t -i:5173) 2>/dev/null
sleep 1

# Step 1: Start the WebSocket server
echo -e "${GREEN}Starting WebSocket server on port 1236...${NC}"
./start-websocket-server.sh simple &
WS_PID=$!
sleep 2

# Check if WebSocket server started
if lsof -ti:1236 > /dev/null; then
  echo -e "${GREEN}✓ WebSocket server is running on port 1236${NC}"
else
  echo -e "${RED}× WebSocket server failed to start!${NC}"
  exit 1
fi

# Step 2: Start the Vite dev server
echo -e "${GREEN}Starting Vite development server...${NC}"
echo -e "${BLUE}Opening http://localhost:5173 in your browser${NC}"

# Set explicit port for Vite
export VITE_PORT=5173

# Inform user about testing
echo -e "\n${YELLOW}=== Testing Instructions ===${NC}"
echo -e "1. Open two browser windows side by side at ${BLUE}http://localhost:5173${NC}"
echo -e "2. Select 'Collaborative' mode in both windows"
echo -e "3. Verify different user identities appear in each window" 
echo -e "4. Test editing - changes should sync between windows"
echo -e "5. Check cursor visibility across windows"
echo -e "6. To stop all services, press Ctrl+C in this terminal"
echo -e "\n${GREEN}Starting dev server...${NC}\n"

# Start dev server
npm run dev

# The script will wait here until the dev server is stopped with Ctrl+C

# Clean up on exit
echo -e "\n${YELLOW}Stopping all services...${NC}"
kill -9 $WS_PID 2>/dev/null
echo -e "${GREEN}Done!${NC}"