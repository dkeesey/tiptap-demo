# TipTap Demo - Project Rules and Intelligence

## Taskmaster System for Cursor

### Overview
The TipTap demo project uses a taskmaster system for tracking task status, priorities, and progress. This system is set up in `~/Workspace/tiptap-demo/` and consists of configuration files and task definitions organized by category.

### Taskmaster Structure
1. **Main configuration**: `~/Workspace/tiptap-demo/taskmaster.json`
   - Defines categories, status options, and priorities
   - Sets default values for new tasks

2. **Task files**: Located in `~/Workspace/tiptap-demo/tasks/`
   - `ai-features.json`: AI integration tasks
   - `ui-enhancements.json`: UI improvement tasks
   - `debugging.json`: Bug fixes and debugging tools
   - `collaboration.json`: Collaborative editing features
   - `documentation.json`: Documentation and presentation materials

### Task Properties
Each task has the following properties:
- `id`: Unique identifier for the task
- `title`: Descriptive title
- `description`: Detailed explanation of the task
- `category`: Category for organization
- `status`: Current status (todo, in-progress, review, done)
- `priority`: Importance level (low, medium, high, critical)
- `due`: Due date for completion
- `subtasks`: List of smaller tasks within the main task

### Viewing Tasks
To view the current task list and status:

```bash
cd ~/Workspace/tiptap-demo
npm run taskmaster
```

This will display an interactive interface showing all tasks organized by category.

### Updating Task Status
Use the `update-task-status.js` script to update task status from the command line:

```bash
cd ~/Workspace/tiptap-demo
node update-task-status.js [task-id] [new-status]
```

Example:
```bash
node update-task-status.js ai-sidebar in-progress
```

Valid status options:
- `todo`: Not started
- `in-progress`: Currently being worked on
- `review`: Completed but needs review
- `done`: Completed and verified

### Task Update Guidelines
When updating tasks, follow these guidelines:

1. **Starting work on a task**:
   - Update status to `in-progress`
   - Create a Git commit with the task ID in the message

2. **Completing work on a task**:
   - Update status to `review` if it needs verification
   - Update status to `done` if completely finished
   - Create a Git commit with details about the implementation

3. **Commit message format**:
   ```
   [task-id] - Brief description of work
   
   - Details of what was implemented
   - Changes made to the system
   - Any remaining issues
   
   Status: [new-status]
   ```

### Task Coordination with Claude
To coordinate work with Claude:

1. **Handoff format** when completing a task:
   ```
   ## Handoff: [task-id] - [task title]
   
   ### Implementation Status
   - Current status: [in-progress/review/done]
   - Implementation progress: [percentage]
   
   ### Completed Items
   - [List of completed items]
   
   ### Pending Items
   - [List of remaining work needed]
   
   ### Integration Notes
   - [How to integrate with other components]
   
   ### Known Issues
   - [Any known bugs or limitations]
   
   ### Next Steps
   - [Instructions for the next steps]
   ```

2. **Priority focus**:
   - High-priority tasks for the April 28 presentation
   - Tasks marked as blocking others
   - Tasks that Claude has provided initial implementations for

### Relationship to Global Taskmaster
This taskmaster setup is specific to the TipTap demo project and is a localized version of the global taskmaster setup in `~/Workspace/tools/`. While they share similar concepts, the TipTap taskmaster is configured specifically for this project's needs and timeline.

If you need to access the global taskmaster system, it's available in `~/Workspace/tools/`, but for all TipTap demo work, use the local system in `~/Workspace/tiptap-demo/`.

### Project Timeline
All tasks should be completed by **April 27, 2025**, to allow for final testing before the Wordware presentation on **April 28, 2025**.

Priority order:
1. Debugging and WebSocket issues
2. Core AI feature implementation
3. UI enhancements
4. Documentation and presentation preparation

### Example Task Update Workflow
```bash
# Check task status
cd ~/Workspace/tiptap-demo
npm run taskmaster

# Update task to in-progress
node update-task-status.js ai-sidebar in-progress

# After implementing, update to review
node update-task-status.js ai-sidebar review

# After verification, mark as done
node update-task-status.js ai-sidebar done
```

Always document your work in Git commits using the specified format.

## Collaborative Editing Architecture

### Real-time Collaboration Implementation
For implementing real-time collaboration similar to Wordware's approach:

1. **Y.js Integration**
   - Use Y.js as the CRDT (Conflict-free Replicated Data Type) library
   - Integrate with TipTap via the Collaboration extension
   - Implement collaborative cursors with the CollaborationCursor extension

2. **Collaboration Backend**
   - Implement a WebSocket server using y-websocket
   - Consider PartyKit for production-ready implementation
   - Ensure proper authentication and document access control

3. **State Management**
   - Use SyncedStore for structured state management
   - Implement React context for collaboration state
   - Handle offline/online transitions gracefully

4. **User Experience**
   - Show user presence with avatars and names
   - Display connection status indicators
   - Implement cursor and selection highlighting

### Notion-like Interface Implementation
To create a Notion-like interface similar to Wordware:

1. **Slash Command Interface**
   - Implement a slash command extension
   - Show command menu on typing "/"
   - Include common block types and AI-specific blocks

2. **Block-based Editing**
   - Create custom node types for different blocks
   - Implement drag-and-drop reordering
   - Support nested blocks for structured content

3. **AI Prompt Components**
   - Create specialized blocks for prompt sections
   - Implement variables/parameters system
   - Add syntax highlighting for prompt syntax

4. **Project Organization**
   - Support multiple documents/prompts
   - Implement file/folder structure
   - Add tagging and search capabilities

## Deployment Learnings

### JavaScript Module MIME Type Issue in Vercel Deployments
When deploying to Vercel, the application initially encountered "Failed to load module script" errors with the message "Expected a JavaScript module script but the server responded with a MIME type of text/html". This only occurred in production, not in development.

**Root Cause:**
- In SPA deployments, when a JavaScript module can't be found, Vercel falls back to serving index.html but with the incorrect MIME type
- The browser expects JavaScript modules to be served with the MIME type 'application/javascript'
- Development servers handle this situation differently than production servers

**Solution:**
1. Use absolute paths in Vite config: `base: '/'`
2. Configure Vercel with rewrites instead of routes:
```json
"rewrites": [
  { "source": "/(assets/.+)", "destination": "/$1" },
  { "source": "/(.*)", "destination": "/index.html" }
]
```
3. Include a `_redirects` file in the public directory as backup

**Why Development vs Production Differs:**
- Development servers (Vite) understand SPA architecture and handle non-existent file requests appropriately
- Production servers (Vercel) serve static files and need explicit configuration for SPA behavior

## Code and Architecture Patterns

### React Component Structure
- Use functional components with hooks
- Follow a clear component hierarchy
- Keep components focused on single responsibilities
- Use TypeScript interfaces for props and state

### TipTap Implementation
- Configure editor through extensions
- Create clear abstractions around the TipTap API
- Follow the "headless UI" paradigm
- Implement custom UI components for all editor controls

### Styling Approach
- Use TailwindCSS as the primary styling solution
- Maintain consistent spacing and typography
- Ensure responsive design across device sizes
- Use CSS variables for theming when appropriate
- Include the Tailwind Typography plugin for rich text styling

### State Management
- Use React context for editor state when necessary
- Keep state close to where it's used
- Minimize prop drilling
- Use local storage for document persistence

### Performance Practices
- Memoize components when appropriate
- Use virtualization for large documents
- Debounce expensive operations
- Lazy-load extensions and components when possible

## Coding Standards

### TypeScript Usage
- Use proper typing for all components and functions
- Avoid 'any' type where possible
- Create interfaces for complex data structures
- Use type guards when necessary

### Component Guidelines
- Keep components focused and small
- Use composition over inheritance
- Extract repeated logic to custom hooks
- Document complex components

### Documentation
- Add JSDoc comments for non-obvious functions
- Document key architectural decisions
- Keep the README up to date
- Document props for reusable components

### Testing
- For this demo, focus on manual testing
- Test across different browsers and devices
- Validate keyboard accessibility

## Project Management

### Time Management
- Focus on core functionality first
- Polish only after basics are working
- Assess feasibility of advanced features based on progress
- Allow time for testing and bug fixing

### Feature Prioritization
1. Core editor functionality
2. Clean, intuitive UI
3. Document persistence
4. Advanced editing features
5. Optional: Collaboration
6. Optional: AI integration

### Commit Guidelines
- Use clear, descriptive commit messages
- Commit frequently with focused changes
- Push regularly to backup work
- Keep the main branch stable

## Deployment Strategy

### Deployment Process
- Set up continuous deployment with Vercel
- Deploy early and often
- Use branch previews for testing changes
- Ensure proper configuration for production builds

### Environment Management
- Keep development and production environments consistent
- Use environment variables for configuration where needed
- Document any environment-specific settings

## Key Learnings and Insights

### TipTap Architecture
- TipTap is built on ProseMirror, a low-level editor toolkit
- The extension system is central to TipTap's architecture
- TipTap is "headless" - it provides functionality but no UI
- The React integration simplifies binding to React components
- TipTap's component hierarchy involves three main components: Editor, EditorContent, and extensions

### TipTap Extensions
- Extensions are modular pieces that add functionality to the editor
- The StarterKit extension bundle includes most common editing features
- Custom extensions can be created for specialized functionality
- Extensions can be configured with options to customize behavior
- Extensions can be combined and composed to create complex editors

### UI Implementation
- The bubble menu appears when text is selected
- The floating menu appears on empty paragraphs
- Toolbars provide persistent access to editor commands
- Each menu/toolbar component receives the editor instance as a prop
- The editor's state can be queried to determine which formatting is active

### Styling Considerations
- TipTap requires the Tailwind Typography plugin for prose styling
- Editor content can be styled using standard CSS or Tailwind classes
- The ProseMirror class is the main entry point for styling editor content
- Custom styling can be applied to specific node types (headings, lists, etc.)
- Responsive design requires careful consideration of toolbar layouts

### Document Persistence
- localStorage provides a simple way to persist editor content
- The editor's HTML can be accessed via editor.getHTML()
- Content can be loaded into the editor through the content prop
- The onUpdate callback is used to capture content changes

### Wordware Integration
- Wordware uses TipTap for collaborative editing of AI prompts
- TipTap's collaboration extensions are particularly relevant for Wordware's use case
- Understanding how to integrate TipTap with other technologies (like AI) is valuable
- The clean, extensible nature of TipTap matches Wordware's development philosophy

### Development Workflow
- Start with official examples and documentation
- Build incrementally, starting with core functionality
- Test frequently to catch styling or functionality issues early
- Use TypeScript for better developer experience and type safety
- Tailwind CSS provides rapid UI development capabilities
