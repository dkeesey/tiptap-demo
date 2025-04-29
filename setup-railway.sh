#!/bin/bash
# Railway deployment setup script for TipTap collaboration editor
# This script helps to set up and configure both the WebSocket server and frontend

# Make script exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Print header
echo -e "\n${BLUE}====== TipTap Collaborative Editor - Railway Setup ======${RESET}\n"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing now...${RESET}"
    npm install -g @railway/cli
fi

# Ask for login if needed
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}You need to log in to Railway first.${RESET}"
    railway login
fi

# Check if project exists
echo -e "${BLUE}Checking for existing Railway projects...${RESET}"
RAILWAY_PROJECTS=$(railway project list 2>/dev/null || echo "No projects found")

if [[ "$RAILWAY_PROJECTS" == *"No projects found"* ]]; then
    echo -e "${YELLOW}No Railway projects found. Creating a new project...${RESET}"
    railway project create
else
    echo -e "${GREEN}Existing projects found:${RESET}"
    echo "$RAILWAY_PROJECTS"
    
    echo -e "${YELLOW}Do you want to create a new project or use an existing one?${RESET}"
    echo "1) Create new project"
    echo "2) Use existing project"
    
    read -p "Choose an option (1/2): " project_option
    
    if [ "$project_option" == "1" ]; then
        railway project create
    else
        railway project
    fi
fi

# Get current project name
PROJECT_NAME=$(railway project current 2>/dev/null | grep -o '".*"' | sed 's/"//g')
echo -e "${GREEN}Working with project: ${PROJECT_NAME}${RESET}"

# Deploy WebSocket server
echo -e "\n${BLUE}====== Deploying WebSocket Server ======${RESET}"

# Ensure websocket-server directory exists
if [ ! -d "websocket-server" ]; then
    echo -e "${YELLOW}Creating websocket-server directory...${RESET}"
    mkdir -p websocket-server
    
    # Copy necessary files if they don't exist
    if [ ! -f "websocket-server/server.js" ]; then
        echo -e "${YELLOW}Copying server.js to websocket-server directory...${RESET}"
        cp server.js websocket-server/ 2>/dev/null || echo -e "${RED}server.js not found. Please create it first.${RESET}"
    fi
    
    if [ ! -f "websocket-server/package.json" ]; then
        echo -e "${YELLOW}Creating package.json in websocket-server directory...${RESET}"
        cat > websocket-server/package.json << 'EOF'
{
  "name": "tiptap-websocket-server",
  "version": "1.0.0",
  "description": "WebSocket server for TipTap collaborative editing",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.13.0",
    "yjs": "^13.6.8",
    "y-protocols": "^1.0.5",
    "lib0": "^0.2.88"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF
    fi
    
    if [ ! -f "websocket-server/railway.json" ]; then
        echo -e "${YELLOW}Creating railway.json in websocket-server directory...${RESET}"
        cat > websocket-server/railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 10,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
    fi
fi

# Deploy WebSocket server
echo -e "${YELLOW}Deploying WebSocket server to Railway...${RESET}"
cd websocket-server
railway up
WEBSOCKET_URL=$(railway domain 2>/dev/null)

if [ -z "$WEBSOCKET_URL" ]; then
    echo -e "${YELLOW}No domain found. Generating one...${RESET}"
    railway domain generate
    WEBSOCKET_URL=$(railway domain 2>/dev/null)
fi

echo -e "${GREEN}WebSocket server deployed at: ${WEBSOCKET_URL}${RESET}"
cd ..

# Set up environment variables for frontend
echo -e "\n${BLUE}====== Setting up frontend environment variables ======${RESET}"
echo -e "${YELLOW}Setting VITE_WEBSOCKET_URL for the frontend...${RESET}"

# Change http to wss for WebSocket connections
WEBSOCKET_WSS_URL=$(echo $WEBSOCKET_URL | sed 's/http/wss/')
railway variables set VITE_WEBSOCKET_URL="$WEBSOCKET_WSS_URL"

# Deploy frontend
echo -e "\n${BLUE}====== Deploying frontend ======${RESET}"
echo -e "${YELLOW}Deploying frontend to Railway...${RESET}"

# Copy railway.json to the root if it doesn't exist
if [ ! -f "railway.json" ]; then
    echo -e "${YELLOW}Creating railway.json in root directory...${RESET}"
    cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 10,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}