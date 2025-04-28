#!/bin/bash

# Title
echo "=== Testing BubbleMenu Fix ==="
echo "This script will run the TipTap demo with the fixed BubbleMenu component"
echo

# 1. Enable debug logging for the bubble menu
echo "Step 1: Enabling debug logging for the BubbleMenu component..."
mkdir -p ~/.config/tiptap-demo
echo 'localStorage.setItem("debug-bubble-menu", "true");' > ~/.config/tiptap-demo/debug.js
echo "Debug logging enabled!"

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
echo "The application is now running. To test the BubbleMenu fix:"
echo "1. Open your browser to http://localhost:4173"
echo "2. Click anywhere in the editor"
echo "3. Verify that the bubble menu does NOT appear"
echo "4. Select some text in the editor"
echo "5. Verify that the bubble menu DOES appear"
echo "6. Open the browser console to see detailed debug logs"
echo
echo "Expected behavior:"
echo "- No bubble menu when simply clicking in the editor"
echo "- Bubble menu appears when selecting text (more than 1 character)"
echo "- Debug logs show the decision-making process"
echo
echo "When done testing, press Ctrl+C to stop the server"

# Wait for user to finish testing
wait $APP_PID
