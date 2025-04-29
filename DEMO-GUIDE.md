# TipTap Collaborative Demo Guide

## Demo URL
[https://tiptap-demo-chi.vercel.app/](https://tiptap-demo-chi.vercel.app/)

## How to Demonstrate the Collaborative Features

### Basic Setup
1. Open the demo in your primary browser
2. You'll see a rich text editor with formatting options at the top
3. The connection status is displayed beneath the toolbar

### Testing Collaboration
1. Click the "Create Test User" button in the top right
   - This opens a new browser window with a simulated second user
   - Each user has a unique color and name

2. Start typing in either window
   - You'll see real-time updates across both windows
   - Each user's cursor is visible to the other with their name
   - Text changes sync automatically between users

### Testing Markdown and Rich Text
1. Try the formatting options in the toolbar:
   - Bold, italic, headings, lists, etc.
   - These changes sync to all connected users

2. Try the "/" command to access more formatting options:
   - Type "/" to see a popup with options
   - Select options like Heading, Blockquote, etc.

### Understanding the Connection Debugger
At the bottom of the page, you'll see a Connection Debugger panel:
1. Click "Expand" to see detailed connection information
   - Connected users with their IDs
   - Connection status
   - Room information

2. Click "Test Sync" to manually force synchronization
   - Useful if you suspect a sync issue

3. Click "Show Logs" to see connection events
   - Monitors connects/disconnects
   - Shows synchronization events

## Technical Highlights

### Architecture
- Frontend: React + TipTap editor (Vercel)
- Backend: WebSocket server for real-time syncing (Railway)
- Data Sync: Y.js for CRDT-based document sync
- Fallback: WebRTC for peer-to-peer fallback when WebSocket fails

### Key Features Demonstrated
- Real-time collaborative text editing
- User presence and cursor awareness
- Rich text formatting with collaborative sync
- Connection state management and error handling
- Fallback connection strategies for reliability

### Implementation Details
- WebSocket connection handling with retry logic
- User identification and persistence
- Document state management
- Custom TipTap extensions
- Comprehensive error handling

## What to Look For
- Seamless real-time updates between browsers
- Consistent state across multiple clients
- Graceful handling of network interruptions
- Clean, intuitive UI for collaboration 