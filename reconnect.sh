#!/bin/bash

# Define colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m' 
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TipTap Demo Connection Fix ===${NC}"

# Check if servers are running
echo -e "${YELLOW}Checking server status...${NC}"

# Check Vite server
if lsof -ti:5173 > /dev/null; then
  echo -e "${GREEN}✓ Vite server is running on port 5173${NC}"
else
  echo -e "${RED}× Vite server is not running!${NC}"
  echo "Starting servers..."
  ./start-all.sh &
  exit 0
fi

# Check WebSocket server
if lsof -ti:1236 > /dev/null; then
  echo -e "${GREEN}✓ WebSocket server is running on port 1236${NC}"
else
  echo -e "${RED}× WebSocket server is not running!${NC}"
  echo "Starting servers..."
  ./start-all.sh &
  exit 0
fi

# Fix connection
echo -e "\n${YELLOW}Applying connection fixes...${NC}"

# Stop the Vite development server
echo "Stopping Vite server..."
kill -9 $(lsof -ti:5173) 2>/dev/null
sleep 1

# Clear browser URL and cache issues
echo -e "${GREEN}Recommendations:${NC}"
echo "1. Clear your browser cache or use incognito mode"
echo "2. Make sure you're accessing the site at http://localhost:5173"
echo "3. Disable any browser extensions that might interfere with WebSockets"

# Start Vite server again with explicit host
echo -e "\n${YELLOW}Starting Vite server with explicit host...${NC}"
echo "npm run dev -- --host localhost --force" 
npm run dev -- --host localhost --force &

echo -e "\n${GREEN}Connection fix applied!${NC}"
echo -e "Open ${BLUE}http://localhost:5173${NC} in your browser"
echo -e "If issues persist, restart your browser and try again"