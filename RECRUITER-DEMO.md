# TipTap Collaborative Editor Demo - Recruiter Guide

## Quick Start (2 minutes)

1. **Start the WebSocket server first**:
   ```bash
   npm run websocket:official
   ```
   **Note**: We're using the official y-websocket server which is guaranteed to work with TipTap's collaboration extension.

2. **Start the application in a new terminal**:
   ```bash
   npm run dev
   ```

3. **Open the application**:
   - Navigate to: http://localhost:5174

## Demo Features

### Collaboration Demonstration (Key Feature)

1. **Enable Collaboration Mode**:
   - Toggle the "Collaboration Mode" switch at the top of the editor
   - The status should change to "Connected" after a moment

2. **Test Real-Time Collaboration**:
   - Open another browser window to http://localhost:5174
   - **Important**: Use the same room name in both windows
   - Type in one window and see changes appear in the other
   - Try formatting text with the toolbar in one window and see it update in the other

3. **Observe User Presence**:
   - Notice different user colors for each window
   - See cursor positions update in real-time
   - You should see "2 users connected" at the top of the editor

### Rich Editor Features

- Format text using the toolbar
- Insert images and links
- Use Markdown shortcuts (like `#` for headings)

### Slash Commands

- Type `/` in the editor to access commands menu
- Try different content types like headings, lists and quotes

## Troubleshooting Guide

If you encounter any issues during the demonstration:

1. **WebSocket Connection Errors**:
   - Verify the WebSocket server is running (`npm run websocket:official`)
   - Check if port 1236 is free (`lsof -i :1236`)
   - If already in use, stop the process: `lsof -i :1236 | grep -v PID | awk '{print $2}' | xargs kill -9`

2. **User Presence Not Showing**:
   - Try refreshing both browser windows
   - **Ensure both windows are connected to the same room name**
   - Toggle collaboration off and on again

3. **Synchronization Issues**:
   - Check console for WebSocket errors
   - Verify that both windows show "Connected" status
   - Try a different browser for the second window
   - Restart the WebSocket server to ensure clean state

## Architecture Highlights

- **Frontend**: React, TypeScript, TipTap, Tailwind CSS
- **Real-time Collaboration**: Y.js, WebSocket
- **Modular Design**: Component-based architecture with React Context

## Technical Notes

- The official y-websocket server handles document synchronization with native Y.js support
- User presence is managed through Y.js awareness protocol
- The editor integrates the TipTap extension system for collaborative features
- Document updates sync in real-time with the official synchronization protocol 