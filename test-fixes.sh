#!/bin/bash

# Title
echo "=== TipTap Demo Fixes Test ==="
echo "Testing fixes for WebSocket connection and AIActionsMenu issues"
echo

# 1. Stop any existing WebSocket servers and start fresh
echo "Step 1: Starting WebSocket server..."
lsof -ti:1235,1236 | xargs kill -9 2>/dev/null
node EnhancedWebSocketServer.cjs &
WS_PID=$!
echo "WebSocket server started with PID: $WS_PID"
sleep 2 # Give server time to start

# 2. Build the application
echo
echo "Step 2: Building the application..."
npm run build
echo "Build complete!"

# 3. Serve the application
echo
echo "Step 3: Starting application server..."
npm run preview &
APP_PID=$!
echo "Application server started with PID: $APP_PID"
sleep 3 # Give server time to start

# 4. Provide testing instructions
echo
echo "=== Testing Instructions ==="
echo "The application is now running. To test the fixes:"
echo "1. Open your browser to http://localhost:4173"
echo "2. Check the browser console for any WebSocket connection errors"
echo "3. Test the AIActionsMenu by selecting text and checking for errors"
echo
echo "Expected results:"
echo "- No WebSocket connection errors in console"
echo "- AI actions menu appears when text is selected"
echo "- No 'Cannot read properties of undefined (reading 'x')' error"
echo
echo "When done testing, press Ctrl+C to stop all servers"

# Wait for user to finish testing
wait $APP_PID
