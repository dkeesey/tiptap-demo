# Collaborative Editing Testing Checklist

This checklist outlines the key tests to perform to verify the collaborative editing functionality after deployment.

## Connection Tests

- [ ] **Basic Connection**
  - Open the editor on two different devices/browsers
  - Verify both connect to the same room
  - Check connection indicator shows "Connected" status

- [ ] **Connection Recovery**
  - Temporarily disable internet on one device
  - Verify the connection indicator changes to "Disconnected"
  - Make changes while disconnected
  - Restore internet connection
  - Verify changes sync correctly after reconnection
  - Verify connection indicator returns to "Connected"

- [ ] **Room Isolation**
  - Open the editor in two browsers with different room names
  - Verify changes in one room don't affect the other
  - Verify users in different rooms don't see each other

## Editing Tests

- [ ] **Basic Text Entry**
  - Type text on Device A
  - Verify text appears on Device B in real-time
  - Type text on Device B 
  - Verify text appears on Device A in real-time

- [ ] **Simultaneous Editing**
  - Edit the same paragraph from both devices simultaneously
  - Verify changes from both devices are merged correctly
  - Verify no conflicts or lost changes

- [ ] **Formatting**
  - Apply formatting (bold, italic, etc.) on Device A
  - Verify formatting appears on Device B
  - Create headings, lists, and blockquotes on Device A
  - Verify they render correctly on Device B

## User Presence Tests

- [ ] **Cursor Visibility**
  - Position cursor in the document on Device A
  - Verify cursor is visible on Device B
  - Verify cursor colors and user names are displayed correctly

- [ ] **Selection Synchronization**
  - Select text on Device A
  - Verify selection is visible on Device B
  - Verify selection color matches the user's color

## Advanced Tests

- [ ] **Large Document Handling**
  - Create a document with multiple pages of content
  - Verify synchronization works correctly throughout the document
  - Test performance with large documents

- [ ] **Offline Mode**
  - Disconnect Device A from the internet
  - Make changes on Device A
  - Reconnect Device A
  - Verify changes sync to Device B

- [ ] **Multi-User Collaboration**
  - Connect 3+ devices to the same room
  - Verify all users' cursors are visible
  - Test editing with multiple simultaneous users

## Deployment-Specific Tests

- [ ] **Environment Variable Verification**
  - Check browser console for WebSocket connection details
  - Verify connecting to the correct WebSocket URL
  - Check for any errors related to environment variables

- [ ] **Cross-Origin Testing**
  - Test collaboration between different domains
  - Verify CORS settings are working correctly
  - Check for any cross-origin errors in console

- [ ] **Protocol Testing**
  - Test both ws:// and wss:// protocols
  - Verify secure connections work correctly
  - Check for mixed content warnings

## AI Feature Integration Tests

- [ ] **AI Feature Synchronization**
  - Use AI features on Device A
  - Verify AI-generated content appears on Device B
  - Verify AI UI components work correctly in collaborative mode

- [ ] **Slash Commands**
  - Test slash commands on Device A
  - Verify command results appear on Device B
  - Test command menu synchronization

## Post-Deployment Verification

After completing all tests, document results and any issues found. For each issue, include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser console logs
5. Screenshots/videos if applicable

This comprehensive testing approach ensures all aspects of the collaborative functionality are working as expected after deployment.
