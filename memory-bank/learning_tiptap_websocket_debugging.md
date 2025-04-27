# Lessons Learned: TipTap WebSocket Debugging

## Major Issues Encountered

1. **WebSocket Connectivity Issues**
   - Connection status would perpetually toggle between "connecting..." and "offline"
   - Y.js and WebSocket events created excessive console messages (1000+ per second)
   - Bubble menu was appearing when clicking anywhere and not disappearing

## Root Causes

1. **Port Mismatch**
   - Client was attempting to connect to port 1234 while server was on 1235

2. **Missing Protocol Constants**
   - Server code was missing crucial Y.js messaging protocol constants:
     - `messageSyncStep1`
     - `messageSyncStep2`
     - `messageUpdate`

3. **Excessive Logging**
   - Y.js and its dependencies generate excessive internal logging
   - No rate limiting on event emission and propagation
   - Default logging configuration was too verbose

4. **UI Implementation Issues**
   - BubbleMenu component was missing proper selection state checking
   - No conditional rendering based on text selection state

## Solutions Implemented

1. **WebSocket Configuration**
   - Fixed port mismatch between client and server
   - Added proper protocol constants
   - Enhanced connection handling and error resilience
   - Implemented graceful reconnection strategies

2. **Logging Reduction**
   - Disabled Y.js internal logging system
   - Created custom logging wrappers to filter messages
   - Implemented browser-level console filtering 
   - Added rate limiting to cap console output
   - Silenced non-critical errors

3. **UI Improvements**
   - Added `shouldShow` condition to BubbleMenu 
   - Implemented proper selection state checking
   - Only display bubble menu with actual text selection

## Key Learnings

1. **WebSocket Architecture**
   - Y.js uses a robust CRDT system for conflict resolution
   - WebSocket connections need careful configuration for stability
   - Collaborative editing requires well-handled connection states

2. **Performance Optimization**
   - Excessive logging can severely impact performance and debugging
   - Browser console can be overwhelmed by high-frequency events
   - Rate limiting and filtering are essential for maintainability

3. **TipTap Component Design**
   - Menu components should have proper state conditions
   - Collaborative extensions need special handling
   - UI interactions must consider both local and remote states

4. **Debugging Techniques**
   - Browser-level console filtering is a powerful tool
   - Throttling event handlers prevents event flooding
   - Diagnosing WebSocket issues requires multi-layered approach

## Best Practices Established

1. Always verify port configurations across client and server
2. Implement proper protocol constants for WebSocket messaging
3. Add rate limiting to any event-based system
4. Use browser-level console filtering for troubleshooting
5. Ensure UI components check selection state before rendering
6. Implement graceful offline handling for collaborative features
7. Provide clear user feedback for connection state changes