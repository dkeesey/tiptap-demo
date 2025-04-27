# TipTap Demo Project: Claude-Cursor Coordination

This README documents the coordination workflow between Claude and Cursor for the TipTap Demo project. The project involves creating an advanced TipTap editor with AI features for the Wordware presentation on April 28, 2025.

## Project Overview

The TipTap Demo showcases a rich text editor with modern AI features, including:
- AI prompt blocks for generating content
- Inline AI suggestions for writing assistance
- Selection-based AI transformations
- Collaborative editing with real-time synchronization

## Getting Started

1. **Run the WebSocket server for collaboration**:
   ```bash
   npm run websocket:enhanced
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Run the complete application**:
   ```bash
   npm run start
   ```

## Task Management

We use a taskmaster system to track and manage tasks:

1. **View current tasks**:
   ```bash
   npm run taskmaster
   ```

2. **Update task status**:
   ```bash
   node update-task-status.js [task-id] [new-status]
   ```
   
   Example:
   ```bash
   node update-task-status.js ai-service in-progress
   ```

3. **Task status options**:
   - `todo`: Not started
   - `in-progress`: Currently being worked on
   - `review`: Completed and awaiting review
   - `done`: Completed and verified

## Workflow Coordination

Please refer to the detailed coordination workflow document:
[Claude-Cursor Workflow](./docs/claude-cursor-workflow.md)

### Current Work Allocation

1. **Claude's Current Tasks**:
   - AI Service abstraction implementation
   - AI Context provider implementation
   - Enhanced WebSocket server implementation

2. **Cursor's Current Tasks**:
   - UI implementation for AI features
   - Bubble menu fixes
   - Component testing and refinement

## Recent Updates

### April 27, 2025 - Infrastructure Updates

1. **Enhanced WebSocket Server**
   - Improved error handling and reconnection logic
   - Added connection state tracking and health monitoring
   - Reduced excessive logging
   - Configurable via environment variables

2. **AI Service Abstraction**
   - Created service interface for AI operations
   - Implemented mock service for development
   - Support for completions, edits, and text analysis

3. **AI Context Provider**
   - React context for AI state management
   - Settings and configuration
   - Interaction history tracking

### Pending Work

1. **High Priority**:
   - AI Prompt Node implementation
   - Inline suggestion implementation
   - Fix remaining WebSocket issues

2. **Medium Priority**:
   - Enhance slash commands with AI actions
   - Build AI sidebar component
   - Create AI actions menu

## Task Update Workflow

When updating tasks and handing off work:

1. **Update task status** when starting or completing work
2. **Create a Git commit** with details about the work done
3. **Document handoff information** using the standard format

Example handoff:

```
## Task: ai-service - Create AI service abstraction

### Current Status
- AI service interfaces defined
- Mock implementation created
- Context provider implemented
- Status: in-progress

### Completed Items
- Service interface with typings
- Mock response generation
- Context integration

### Pending Items
- Error handling improvements
- Streaming support
- UI integration

### Notes
- Mock service uses predefined responses for demonstration
- Context manages settings and service state

### Next Steps
- Implement UI components for AI features
- Test with various prompts and edit instructions
- Consider real AI service implementation for future
```

## Directory Structure

Key files for collaboration:

```
tiptap-demo/
├── src/
│   ├── services/
│   │   └── ai/                  # AI service implementation
│   │       ├── AIService.ts     # Service interfaces
│   │       ├── MockAIService.ts # Mock implementation
│   │       └── index.ts         # Exports
│   ├── context/
│   │   └── AI/
│   │       └── AIContext.tsx    # React context provider
│   └── components/
│       └── ai/                  # AI UI components (to be implemented)
├── EnhancedWebSocketServer.cjs  # Improved WS server
├── update-task-status.js        # Task status update script
└── docs/
    └── claude-cursor-workflow.md # Coordination documentation
```

## Troubleshooting

If you encounter issues with the coordination workflow:

1. **Task update issues**:
   - Check task JSON files directly in the `tasks/` directory
   - Verify task IDs in the task files
   - Run `npm run taskmaster` to see current task state

2. **WebSocket issues**:
   - Check if the server is running with `ps aux | grep websocket`
   - Try a different port using `WS_PORT=1237 npm run websocket:enhanced`
   - Look for error messages in the server logs

## Next Steps

1. Continue implementing highest priority tasks for the April 28 presentation
2. Focus on AI feature user experience
3. Test thoroughly in different scenarios
4. Prepare demonstration script for the presentation
