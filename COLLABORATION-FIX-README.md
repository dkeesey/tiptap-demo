# Collaboration Fix Documentation

## Overview

This document describes the changes made to fix the WebSocket collaboration issues in the TipTap editor demo. The primary problems addressed were:

1. Multiple browser windows showing the same user identity
2. Connected users not seeing each other in the collaboration UI
3. Document changes not synchronizing between clients

## Changes Made

### 1. Switched to RailwayCollaborationContext

The most significant change was switching from `CollaborationContext` to `RailwayCollaborationContext`, which implements proper session-specific user IDs:

```diff
- import { CollaborationProvider } from './context/CollaborationContext'
+ import { RailwayCollaborationProvider } from './context/RailwayCollaborationContext'

// In JSX:
- <CollaborationProvider room={roomName}>
+ <RailwayCollaborationProvider room={roomName}>
  {/* ... */}
- </CollaborationProvider>
+ </RailwayCollaborationProvider>
```

### 2. Enhanced Session-Specific User IDs

The `RailwayCollaborationContext` fixes a critical issue with user identity generation by adding session-specific identifiers:

```js
// In RailwayCollaborationContext.tsx
const generateSessionId = () => {
  return 'session-' + Math.random().toString(36).substring(2, 15);
};

const getUserId = () => {
  // Get base user ID from localStorage
  let baseUserId = localStorage.getItem('user-id');
  if (!baseUserId) {
    baseUserId = 'user-' + Math.floor(Math.random() * 1000000).toString();
    localStorage.setItem('user-id', baseUserId);
  }
  
  // Add session-specific suffix for unique identity across windows
  return `${baseUserId}-${generateSessionId()}`;
};
```

### 3. Improved Awareness Protocol Debugging

Added verbose logging to the awareness protocol for easier troubleshooting:

```js
// In RailwayCollaborationContext.tsx handleAwarenessUpdate function
console.log(`[Railway Collab] Awareness update received. All states:`, 
  Array.from(states.entries()).map(([clientId, state]) => ({
    clientId,
    user: state.user,
    timestamp: new Date().toISOString()
  }))
);
```

### 4. Fixed Client Component Integration

Updated all components using the collaboration context to work with the Railway version:

- `CollaborativeTiptapEditor.tsx`
- `UserPresence.tsx`
- `ConnectionStatus.tsx`

### 5. Created Debugging Tools

Added a console script to help diagnose collaboration issues:

```js
// test-collaborative-sync.js
// Run in browser console to diagnose collaboration
window.__railwayCollabDebug__.manualSync()
```

## How to Use the Fix

1. Ensure you're using `RailwayCollaborationProvider` in App.tsx
2. Verify your WebSocket URL is correctly set in environment variables
3. Open the application in multiple browser windows to test collaboration
4. Use the debugging script if needed: `test-collaborative-sync.js`

## Technical Details

### Unique User Identity Generation

The core issue was that localStorage is shared across all browser tabs/windows from the same browser. By adding a session-specific suffix to user IDs, each browser window now generates a unique identity while still maintaining personalized settings (like user colors).

### Awareness Protocol

The Y.js awareness protocol uses client IDs (not user IDs) to track connections. The fix ensures proper tracking of multiple clients even when they share the same base user identity.

### Connection Management

Connection status is now properly managed with more detailed reporting, allowing users to see exactly what's happening with their collaborative connection.

## Testing the Fix

1. Open the app in two different browser windows
2. Check the developer console to see unique user IDs being generated
3. Verify that changes in one window appear in the other
4. Check that both windows show the other user's cursor/presence

## Reference

- [Y.js Documentation](https://docs.yjs.dev/)
- [TipTap Collaboration Guide](https://tiptap.dev/docs/editor/guide/collaborative-editing) 