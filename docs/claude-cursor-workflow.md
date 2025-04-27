# Claude-Cursor Workflow Coordination

This document outlines the workflow between Claude and Cursor for the TipTap Demo project, including task allocation, communication protocols, and coordination strategies.

## Responsibility Allocation

### Claude's Responsibilities

- **Architecture & Design**:
  - Overall system architecture design
  - Component structure planning
  - API design and interfaces

- **Code Generation**:
  - Initial implementation of components
  - Service layer implementation
  - Context providers and state management
  - Documentation generation

- **Task Management**:
  - Tracking task status
  - Updating the taskmaster system
  - Prioritizing work based on PRD requirements

### Cursor's Responsibilities

- **Code Refinement**:
  - Improving generated code
  - Fixing bugs and edge cases
  - Optimizing performance

- **UI/UX Implementation**:
  - Building visual components
  - Implementing UI interactions
  - Styling and CSS refinement

- **Testing**:
  - Unit and integration testing
  - Real-world scenario testing
  - Cross-browser compatibility

## Workflow Patterns

### Implementation Workflow

1. **Planning Phase**:
   - Claude analyzes requirements from the PRD
   - Claude designs the component architecture
   - Cursor reviews and refines the architecture

2. **Implementation Phase**:
   - Claude generates initial implementation
   - Cursor reviews and enhances the code
   - Claude suggests improvements and fixes
   - Cursor integrates and tests the changes

3. **Review Phase**:
   - Both evaluate implementations against requirements
   - Cursor performs real-world testing
   - Claude updates task status

### Task Handoff Protocol

When transitioning work between Claude and Cursor:

1. **Task Start**:
   - Update task status to "in-progress" using `node update-task-status.js [task-id] in-progress`
   - Document work started in Git commit message

2. **Handoff to Cursor**:
   - Document current state and pending work
   - Highlight areas needing attention
   - Provide context about design decisions

3. **Handoff to Claude**:
   - Document changes made, challenges, and improvements
   - Highlight areas for further enhancement
   - List any bugs or issues encountered

4. **Task Completion**:
   - Update task status to "review" or "done"
   - Document completion in Git commit message

## Communication Framework

### Standard Communication Format

When documenting work for handoff:

```
## Task: [task-id] - [task-title]

### Current Status
- [Brief description of current implementation state]
- Status: [in-progress/review/done]

### Completed Items
- [Item 1]
- [Item 2]

### Pending Items
- [Item 1]
- [Item 2]

### Notes
- [Important context]
- [Design decisions]
- [Known issues]

### Next Steps
- [Clear action items]
```

### Git Commit Format

Use structured commit messages:

```
[task-id] - [brief description]

- Implemented [feature]
- Fixed [issue]
- Improved [component]

Status: [in-progress/review/done]
```

## Development Guidelines

### Directory Structure

```
tiptap-demo/
├── src/
│   ├── components/     # UI components
│   │   ├── ai/         # AI-specific components 
│   │   ├── editor/     # Editor components
│   │   └── shared/     # Shared UI components
│   ├── context/        # React context providers
│   │   └── AI/         # AI context
│   ├── services/       # Service abstraction layer
│   │   └── ai/         # AI service implementation
│   ├── extensions/     # TipTap extensions
│   ├── utils/          # Utility functions
│   └── App.tsx         # Main application
├── tasks/              # Taskmaster tasks
└── docs/               # Documentation
```

### Code Ownership

- **Claude-Owned Files**:
  - Service interfaces and implementations
  - Context providers
  - Architecture documentation
  - High-level component structures

- **Cursor-Owned Files**:
  - UI component implementation details
  - Styling and CSS
  - Browser-specific tweaks
  - Test implementations

- **Shared Ownership**:
  - Extension configuration
  - Main application flow
  - Documentation

## Priority Tasks (April 27, 2025)

Based on the PRD requirements and upcoming presentation date (April 28), here are the priority tasks:

### Immediate (High Priority)

1. **WebSocket Connectivity (Fix)**
   - Status: In progress
   - Owner: Claude (initial fix), Cursor (testing)
   - Task ID: `websocket-issues`

2. **AI Service Abstraction (Implement)**
   - Status: In progress
   - Owner: Claude
   - Task ID: `ai-service`

3. **AI Context Provider (Implement)**
   - Status: In progress
   - Owner: Claude
   - Task ID: `ai-context`

4. **AI Prompt Node (Update)**
   - Status: Pending
   - Owner: Claude (interface), Cursor (UI implementation)
   - Task ID: `ai-prompt-node`

### Next (Medium Priority)

1. **Inline AI Suggestions (Implement)**
   - Status: Pending
   - Owner: Claude (service), Cursor (UI implementation)
   - Task ID: `inline-suggestions`

2. **Bubble Menu Fixes (Fix)**
   - Status: In progress
   - Owner: Cursor
   - Task ID: `bubble-menu-fixes`

3. **Slash Commands with AI Actions (Enhance)**
   - Status: Pending
   - Shared responsibility
   - Task ID: `slash-commands`

### Final (Lower Priority)

1. **AI Sidebar (Build)**
   - Status: Pending
   - Owner: Cursor (UI), Claude (integration)
   - Task ID: `ai-sidebar`

2. **AI Actions Menu (Create)**
   - Status: Pending
   - Owner: Cursor
   - Task ID: `ai-actions-menu`

3. **AI Docs (Add)**
   - Status: Pending
   - Owner: Claude
   - Task ID: `ai-docs`

## Getting Started Today (April 27)

To start the collaborative workflow immediately:

1. **Clone the repository** (if not done already)
   ```bash
   git clone [repository-url]
   cd tiptap-demo
   npm install
   ```

2. **Run the enhanced WebSocket server**
   ```bash
   npm run websocket:enhanced
   ```

3. **Review the implementation of AI services**
   - Check the service interfaces in `src/services/ai/AIService.ts`
   - Review the mock implementation in `src/services/ai/MockAIService.ts`
   - Explore the AI context in `src/context/AI/AIContext.tsx`

4. **Update task status as you work**
   ```bash
   # Use the Node script
   node update-task-status.js ai-service in-progress
   
   # Or use the Bash script (if jq is installed)
   ./update-task.sh ai-service in-progress
   ```

5. **Coordinate using git commits**
   ```bash
   git add .
   git commit -m "[ai-service] - Implemented AI service abstraction
   
   - Created service interfaces
   - Implemented mock AI service
   - Added context provider
   
   Status: in-progress"
   ```

## Examples of Effective Collaboration

### Example 1: Claude generates, Cursor refines

**Claude (Implementation)**:
- Designs AI service interfaces
- Creates mock implementation
- Establishes context provider
- Hands off for UI implementation

**Cursor (Refinement)**:
- Improves error handling
- Implements UI components
- Tests across different browsers
- Suggests optimizations

### Example 2: Cursor encounters issue, Claude assists

**Cursor (Issue)**:
- Identifies a problem with WebSocket reconnection
- Documents the specific issue
- Asks for architectural guidance

**Claude (Assistance)**:
- Analyzes the problem
- Proposes refactored implementation
- Provides code snippets and explanations
- Suggests testing strategy

## Conclusion

This coordinated workflow between Claude and Cursor leverages the strengths of both to efficiently complete the TipTap Demo project. Claude excels at architecture, code generation, and documentation, while Cursor excels at refinement, UI implementation, and testing. Together, they form a powerful team for delivering a high-quality product by the April 28 deadline.
