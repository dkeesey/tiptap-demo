#!/bin/bash

# Define server options
SIMPLE_SERVER="SimpleWebSocketServer.cjs"
ENHANCED_SERVER="EnhancedWebSocketServer.cjs"

# Default to the simple server for this fix
SERVER_FILE="${SIMPLE_SERVER}"

# Check if server file was specified as argument
if [ $# -eq 1 ]; then
  if [ "$1" == "simple" ]; then
    SERVER_FILE="${SIMPLE_SERVER}"
    echo "Using simple WebSocket server"
  elif [ "$1" == "enhanced" ]; then
    SERVER_FILE="${ENHANCED_SERVER}"
    echo "Using enhanced WebSocket server"
  else
    echo "Unknown server option: $1. Using simple server as default."
  fi
fi

# Stop any existing running servers on ports 1235 and 1236
echo "Stopping any existing WebSocket servers..."
pid_1235=$(lsof -ti:1235 2>/dev/null)
pid_1236=$(lsof -ti:1236 2>/dev/null)

if [ ! -z "$pid_1235" ]; then
  echo "Stopping server on port 1235 (PID: $pid_1235)"
  kill -9 $pid_1235 2>/dev/null
fi

if [ ! -z "$pid_1236" ]; then
  echo "Stopping server on port 1236 (PID: $pid_1236)"
  kill -9 $pid_1236 2>/dev/null
fi

# Add small delay to ensure ports are released
sleep 1

# Check if server file exists
if [ ! -f "$SERVER_FILE" ]; then
  echo "Error: Server file '$SERVER_FILE' not found!"
  exit 1
fi

# Start the selected WebSocket server
echo "Starting WebSocket Server ($SERVER_FILE) on port 1236..."
node "$SERVER_FILE" &

# Save PID for monitoring
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Handle script termination
function cleanup() {
  echo "Stopping WebSocket server..."
  kill -9 $SERVER_PID 2>/dev/null
  exit 0
}

# Set trap for script termination
trap cleanup SIGINT SIGTERM

# Keep script running and monitor server
echo "Server is running. Press Ctrl+C to stop."
while kill -0 $SERVER_PID 2>/dev/null; do
  sleep 1
done

echo "WebSocket server has stopped unexpectedly!"
exit 1
