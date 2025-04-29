# TipTap Demo - Presentation Quick Reference

## Startup Sequence

1. **Start WebSocket Server First**
   ```bash
   cd ~/Workspace/tiptap-demo
   npm run websocket:official
   ```

2. **Start Frontend in New Terminal**
   ```bash
   cd ~/Workspace/tiptap-demo
   npm run dev
   ```

3. **Open Browser Windows**
   - Main demo: http://localhost:5174
   - Collaboration demo: Open a second window/browser with the same URL

## Key Features to Demonstrate

### Basic Editor (Must Show)
- [x] Text formatting with toolbar (bold, italic, headings)
- [x] Bubble menu on text selection
- [x] Floating menu on empty paragraph
- [x] Slash commands (type `/`)
- [x] Document persistence (refresh page)

### Collaboration (Must Show)
- [x] Enable collaboration toggle
- [x] Real-time editing across two windows
- [x] User cursors with different colors
- [x] Connection status indicator

### AI Features (Must Show)
- [x] AI sidebar with chat functionality
- [x] AI actions on selected text
- [x] AI slash commands
- [x] Inline completion with `/complete`

## Troubleshooting

### WebSocket Issues
- **Connection Error**: Check if WebSocket server is running in terminal
- **Fix**: Restart WebSocket server with `npm run websocket:official`
- **Alt Fix**: Toggle collaboration off and on again
- **Last Resort**: Use public WebSocket URL by setting:
  ```javascript
  // In App.tsx, update websocketUrl:
  const websocketUrl = 'wss://y-webrtc-signal-backend.fly.dev'
  ```

### Bubble Menu Issues
- **Menu Not Appearing**: May be a positioning issue or selection event
- **Fix**: Click outside editor and try again
- **Alt Fix**: Refresh the page

### AI Features Issues
- **Features Not Working**: Check if AI toggle is enabled
- **Fix**: Toggle AI features off and on again
- **Alt Fix**: Check browser console for errors

### General Issues
- **Slow Performance**: Check browser console for excessive logging
- **Formatting Issues**: Try multiple clicks on formatting buttons
- **Page Not Loading**: Restart Vite dev server

## Key Points to Emphasize

1. **Architecture Quality**
   - Clean component hierarchy
   - Separation of concerns
   - Modular extension approach

2. **Technical Challenges Solved**
   - WebSocket connectivity (April 27 fix)
   - Bubble menu positioning
   - Console logging reduction
   - Offline resilience

3. **User Experience Focus**
   - Notion-like interface
   - Responsive design
   - Clear connection status
   - Progressive enhancement

## Deployed Versions

- **Vercel Deployment**: https://tiptap-demo-deankeesey.vercel.app
- **WebSocket Server**: https://tiptap-websocket.fly.dev

## Backup Plans

If local demo doesn't work, use the deployed version on Vercel with:
1. Open https://tiptap-demo-deankeesey.vercel.app in two browser windows
2. Enable collaboration in both windows with the same room name
3. Demonstrate features using the cloud deployment

## Repository Information

- **GitHub**: https://github.com/deankeesey/tiptap-demo
- **Key Files to Reference**:
  - `src/App.tsx`: Main application structure
  - `src/components/Editor`: Core editor components
  - `src/context/CollaborationContext.tsx`: Y.js integration
  - `src/context/AI/AIContext.tsx`: AI features integration
  - `EnhancedWebSocketServer.cjs`: Custom WebSocket server

## Last-Minute Checks

- [x] WebSocket server running properly
- [x] Frontend application building successfully
- [x] Collaboration working between browser windows
- [x] AI features responding as expected
- [x] All UI elements rendering correctly
- [x] No console errors during operation