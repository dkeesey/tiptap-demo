#!/bin/bash
# Script to apply all TipTap collaborative editor fixes and start the necessary services

# Set colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colorful messages
print_header() {
  echo -e "\n${BLUE}==>${NC} ${GREEN}$1${NC}\n"
}

print_info() {
  echo -e "${BLUE}-->${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "src/App.tsx" ] || [ ! -f "src/components/Editor/CollaborativeTiptapEditor.tsx" ]; then
  print_error "This script must be run from the tiptap-demo root directory"
  exit 1
fi

# Step 1: Check for running processes and stop them if needed
print_header "Checking for running processes"

# Check for WebSocket server on port 1236
pid_ws=$(lsof -ti:1236 2>/dev/null)
if [ ! -z "$pid_ws" ]; then
  print_info "Stopping WebSocket server on port 1236 (PID: $pid_ws)"
  kill -9 $pid_ws 2>/dev/null
else
  print_info "No WebSocket server running on port 1236"
fi

# Check for development server on port 3000
pid_dev=$(lsof -ti:3000 2>/dev/null)
if [ ! -z "$pid_dev" ]; then
  print_info "Stopping development server on port 3000 (PID: $pid_dev)"
  kill -9 $pid_dev 2>/dev/null
else
  print_info "No development server running on port 3000"
fi

# Add delay to ensure ports are released
sleep 2

# Step 2: Install dependencies if needed
print_header "Checking dependencies"
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
  print_info "Installing npm dependencies..."
  npm install
else
  print_info "Dependencies already installed"
fi

# Step 3: Make the start-websocket-server.sh executable
print_header "Setting up WebSocket server"
if [ ! -x "start-websocket-server.sh" ]; then
  print_info "Making start-websocket-server.sh executable"
  chmod +x start-websocket-server.sh
fi

# Step 4: Start the WebSocket server in a new terminal
print_header "Starting WebSocket server"
print_info "Starting SimpleWebSocketServer.cjs (fixed version) in a new terminal window"

# Start in a new terminal based on platform
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  osascript -e 'tell app "Terminal" to do script "cd \"'"$PWD"'\" && ./start-websocket-server.sh simple"'
else
  # Linux or other systems
  if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd \"$PWD\" && ./start-websocket-server.sh simple; exec bash"
  elif command -v xterm &> /dev/null; then
    xterm -e "cd \"$PWD\" && ./start-websocket-server.sh simple; exec bash" &
  else
    # Fall back to running in the background
    print_warning "Could not determine terminal emulator. Running WebSocket server in the background."
    ./start-websocket-server.sh simple &
  fi
fi

# Wait for the WebSocket server to start
print_info "Waiting for WebSocket server to start..."
sleep 5

# Check if server started successfully
if lsof -ti:1236 > /dev/null; then
  print_info "WebSocket server started successfully"
else
  print_error "WebSocket server failed to start on port 1236"
  print_warning "You may need to start it manually in another terminal with: ./start-websocket-server.sh simple"
fi

# Step 5: Start the dev server
print_header "Starting development server"
print_info "This will open the TipTap demo in your browser"
print_info "Press Ctrl+C in this terminal to stop the development server when done"
echo ""

# Instructions for testing
echo -e "${GREEN}=== Testing Instructions ===${NC}"
echo -e "1. Open two browser windows side by side at http://localhost:3000"
echo -e "2. Enable collaboration mode in both windows"
echo -e "3. Verify unique user identities appear in each window"
echo -e "4. Test editing in one window - changes should appear in the other"
echo -e "5. Test cursor visibility - your cursor should be visible in the other window"
echo -e "6. Check connection status indicators"
echo -e ""

# Start the dev server
npm run dev