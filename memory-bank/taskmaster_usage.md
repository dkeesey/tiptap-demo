# Taskmaster Usage Guide

This document provides detailed instructions for using the taskmaster system in the TipTap demo project. It covers all aspects of task management, status tracking, and coordination between Claude and Cursor.

## Table of Contents
1. [Reading and Updating the Task List](#reading-and-updating-the-task-list)
2. [Task Status Workflow](#task-status-workflow)
3. [Claiming Tasks](#claiming-tasks)
4. [Handling Task Dependencies](#handling-task-dependencies)
5. [Adding New Tasks](#adding-new-tasks)
6. [Passing Context Between Agents](#passing-context-between-agents)

## Reading and Updating the Task List

### Viewing Tasks

The taskmaster system stores tasks in JSON files within the `~/Workspace/tiptap-demo/tasks/` directory. To view all tasks in an interactive format:

```bash
cd ~/Workspace/tiptap-demo
npm run taskmaster
```

This will display a terminal interface showing all tasks organized by category, with color-coding for different statuses.

### Understanding Task Structure

Each task is stored in a category-specific JSON file (e.g., `ai-features.json`, `debugging.json`). Tasks have the following structure:

```json
{
  "id": "unique-task-id",
  "title": "Task Title",
  "description": "Detailed task description...",
  "category": "category-name",
  "status": "todo|in-progress|review|done",
  "priority": "low|medium|high|critical",
  "due": "YYYY-MM-DD",
  "subtasks": [
    {
      "id": "subtask-id",
      "title": "Subtask Title",
      "status": "todo|in-progress|review|done"
    }
  ]
}
```

### Updating Task Status

Use the provided script to update task status:

```bash
node update-task-status.js [task-id] [new-status]
```

Example:
```bash
node update-task-status.js ai-service in-progress
```

Valid status values:
- `todo`: Task has not been started
- `in-progress`: Task is currently being worked on
- `review`: Task is complete but needs review
- `done`: Task is complete and verified

### Checking Current Task Status

To check the current status of all tasks in a specific category:

```bash
cat ~/Workspace/tiptap-demo/tasks/ai-features.json | grep -A 3 "status"
```

## Task Status Workflow

Follow this standard workflow for task progression:

```
todo → in-progress → review → done
```

### Status Definitions and Criteria

1. **todo**
   - Initial state for all tasks
   - Task is defined but no work has started
   - May be blocked by dependencies

2. **in-progress**
   - Work has actively started on the task
   - The assignee is currently implementing the task
   - Update to this status when you begin work

3. **review**
   - Implementation is complete
   - Task needs verification or testing
   - Code is committed but awaiting review

4. **done**
   - Task is fully completed
   - All implementation is verified
   - No further work needed

### Status Update Responsibilities

- When starting work: Update to `in-progress`
- When completing implementation: Update to `review`
- When verifying completion: Update to `done`
- If issues are found during review: Revert to `in-progress` with notes

### Git Integration

Always include the task status in commit messages:

```
[task-id] - Brief description of changes

- Detailed changes made
- Technical implementation notes

Status: in-progress|review|done
```

## Claiming Tasks

To avoid duplication of effort, follow these guidelines when claiming tasks:

### Claiming Process

1. **Check Task Status First**
   ```bash
   npm run taskmaster
   ```
   Look for tasks that are still in `todo` status

2. **Announce Task Claim**
   Update the task status to `in-progress`:
   ```bash
   node update-task-status.js [task-id] in-progress
   ```

3. **Create Claim Commit**
   ```bash
   git commit -m "[task-id] - Claiming task for implementation
   
   - Starting work on [brief description]
   - Expected completion: [timeframe]
   
   Status: in-progress"
   ```

### Conflict Resolution

If you discover someone else has claimed the same task:

1. Check the git history to see when it was claimed
2. Coordinate through comments in the code or via communication channels
3. Either:
   - Find another task to work on
   - Split the task into logical segments if possible
   - Collaborate on the task together with clear responsibilities

### Abandoning a Claimed Task

If you need to abandon a task you've claimed:

1. Update the status back to `todo`:
   ```bash
   node update-task-status.js [task-id] todo
   ```

2. Create a commit explaining why:
   ```bash
   git commit -m "[task-id] - Releasing task claim
   
   - Reason for releasing: [brief explanation]
   - Current progress: [status summary]
   
   Status: todo"
   ```

## Handling Task Dependencies

Many tasks depend on others. Here's how to handle dependencies:

### Identifying Dependencies

Dependencies are implicit based on task descriptions. Look for:
- References to other tasks in the description
- Logical sequencing requirements (e.g., backend before frontend)
- Shared component dependencies

### Working with Dependencies

1. **Check Dependency Status**
   Before starting a task, verify its dependencies are complete:
   ```bash
   npm run taskmaster
   ```

2. **Handling Blocked Tasks**
   If a task is blocked by incomplete dependencies:
   - Focus on unblocked tasks first
   - Help complete blocking dependencies
   - Document the dependency in your commits

3. **Parallel Work Strategy**
   For tasks with partial dependencies:
   - Identify independent portions that can be started
   - Create stub implementations or mocks
   - Document assumptions about the dependency interface

### Dependency Example

Task: `inline-suggestions` depends on `ai-service`

Approach:
1. Check status of `ai-service` first
2. If `ai-service` is `done`, proceed normally
3. If `ai-service` is `in-progress`:
   - Review the current implementation
   - Coordinate with assignee to understand the interface
   - Mock what you need for your task
   - Document dependencies in your implementation

## Adding New Tasks

As the project evolves, you may need to add new tasks:

### Task Creation Process

1. **Identify the appropriate category file** in `~/Workspace/tiptap-demo/tasks/`

2. **Edit the JSON file** and add a new task entry:
   ```json
   {
     "id": "new-unique-id",
     "title": "Clear Task Title",
     "description": "Detailed description of the task requirements...",
     "category": "ai-features|ui-enhancements|debugging|collaboration|documentation",
     "status": "todo",
     "priority": "low|medium|high|critical",
     "due": "2025-04-27",
     "subtasks": [
       {
         "id": "subtask-1",
         "title": "First Subtask",
         "status": "todo"
       }
     ]
   }
   ```

3. **Maintain JSON integrity** - ensure proper formatting with commas and brackets

4. **Commit the new task**:
   ```bash
   git add tasks/[category].json
   git commit -m "[new-task-id] - Add new task for [brief description]
   
   - Created task definition
   - Set priority to [priority]
   - Added [number] subtasks
   
   Status: todo"
   ```

### Task ID Format Conventions

- Use kebab-case (lowercase with hyphens)
- Keep IDs short but descriptive
- Follow existing naming patterns
- Examples: `ai-sidebar`, `websocket-issues`, `inline-suggestions`

### Task Description Guidelines

- Be specific and actionable
- Include acceptance criteria
- Reference related tasks or dependencies
- Provide context and reasoning
- Include technical approach if known

## Passing Context Between Agents

Effective collaboration between Claude and Cursor requires clear context sharing:

### Standard Handoff Format

When passing work between Claude and Cursor, use this format:

```
## Handoff: [task-id] - [task-title]

### Implementation Status
- Current status: [in-progress|review|done]
- Implementation progress: [percentage]

### Completed Items
- [List of completed items with technical details]

### Pending Items
- [List of remaining work needed]

### Implementation Details
- File locations: [paths to relevant files]
- Key components: [components created or modified]
- Architecture decisions: [important design choices]

### Integration Notes
- [How to integrate this component with others]
- [Dependencies and requirements]

### Known Issues/Limitations
- [Any bugs or limitations]
- [Workarounds if applicable]

### Next Steps
- [Clear instructions for the next steps]
```

### Example Handoff

```
## Handoff: ai-sidebar - Build AI sidebar component

### Implementation Status
- Current status: in-progress
- Implementation progress: 70%

### Completed Items
- Created basic sidebar structure (src/components/ai/AISidebar.tsx)
- Implemented sidebar toggle functionality
- Added tabs for chat, actions, and settings
- Integrated with AIContext provider

### Pending Items
- Style refinement for dark mode
- Performance optimization
- Integration with editor selection events
- Improve mobile responsiveness

### Implementation Details
- File locations: src/components/ai/AISidebar.tsx, src/components/ai/index.ts
- Key components: AISidebar, TabPanel
- Architecture decisions: Used React context for state management, implemented tabs with render props pattern

### Integration Notes
- Import from 'src/components/ai/AISidebar'
- Wrap with AIProvider from 'src/context/AI/AIContext'
- Position is fixed to viewport, should be added at App.tsx level

### Known Issues/Limitations
- Chat scrolling behavior needs improvement
- Actions tab needs connection to editor instance
- Settings don't persist between sessions yet

### Next Steps
1. Complete styling for dark mode
2. Implement editor selection integration
3. Add local storage for settings persistence
4. Test on mobile devices and fix responsiveness issues
```

### Contextual Information to Include

1. **Code References**
   - File paths and relevant line numbers
   - Component names and interfaces
   - API endpoints or service methods

2. **Implementation Details**
   - Architectural decisions and rationale
   - Design patterns used
   - State management approach
   - Performance considerations

3. **Dependencies**
   - External libraries or services
   - Related components
   - Required context providers

4. **Testing Information**
   - Test cases covered
   - Edge cases to be aware of
   - Known limitations

### Context Preservation

To ensure context is preserved across handoffs:

1. **Document thoroughly in code comments**
2. **Maintain comprehensive commit messages**
3. **Update task status with relevant notes**
4. **Reference related tasks and dependencies**
5. **Include progress indicators and next steps**

## Conclusion

By following these guidelines, Claude and Cursor can effectively coordinate work on the TipTap demo project, ensure tasks are properly tracked, and maintain clear context when passing implementation work between agents. This structured approach will help ensure the project is completed successfully for the April 28, 2025 presentation.
