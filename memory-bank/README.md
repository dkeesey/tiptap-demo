# TipTap Collaborative Editor - Project Memory Bank

This directory contains documentation of key learnings, fixes, and technical knowledge accumulated during the development of the TipTap collaborative editor.

## Core Documentation

| Document | Description |
|----------|-------------|
| [WebSocket Collaboration Fixes](./websocket_collaboration_fixes.md) | Comprehensive documentation of fixes for WebSocket collaboration and user awareness issues |
| [TipTap Collaborative Editor Learnings](./tiptap-collaborative-editor-learnings.md) | General learnings about implementing TipTap with collaborative features |
| [Collaborative Synchronization Issues](./tiptap_collaborative_synchronization_issues.md) | Analysis of synchronization issues between editor instances |

## Feature-Specific Documentation

| Document | Description |
|----------|-------------|
| [Bubble Menu Fix](./bubble_menu_fix.md) | Solutions for issues with the TipTap bubble menu positioning and visibility |
| [WebSocket and AIActionsMenu Fixes](./tiptap_fixes_websocket_aiactionsmenu.md) | Combined fixes for WebSocket stability and AI menu functionality |

## Technical Areas

### Collaboration

- Y.js awareness protocol uses clientID (connection-specific) for tracking connections
- Each browser tab gets a unique clientID even for the same user
- The awareness states map is keyed by clientID, not userID
- WebSocket connections need proper CORS headers when connecting across origins

### User Experience

- User colors should be consistent across sessions for identification
- Connection status should be clearly visible to users
- User preferences should persist across browser refreshes
- Error handling should provide clear feedback to users

### Performance Considerations

- Awareness updates should be throttled to reduce network traffic
- Editor operations should be optimized for large documents
- WebSocket reconnection should use exponential backoff

## References

- [Y.js Documentation](https://docs.yjs.dev/)
- [TipTap Documentation](https://tiptap.dev/docs)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) 