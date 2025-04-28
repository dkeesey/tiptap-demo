# Coordinated Development Guidelines

This document outlines the workflow for coordinated development using the taskmaster system.

## Workflow Overview

1. **Check Available Tasks**
   - Run `./run-taskmaster.sh` to see all tasks and their statuses
   - Identify a task that is not assigned/in-progress

2. **Create a Task-Specific Branch**
   - Use the provided script: `./create-task-branch.sh <task-id> [agent-name]`
   - Example: `./create-task-branch.sh toolbar-appearance cursor`

3. **Update Task Status**
   - Mark the task as in-progress: `./update-task.sh <task-id> in-progress`
   - This indicates to other agents that you're working on this task

4. **Implement the Task**
   - Work on the specific changes required for the task
   - Follow the requirements in the task description
   - Keep changes focused on the task to avoid conflicts

5. **Commit Changes**
   - Use the task ID in your commits: `git commit -m "task(<task-id>): Your message"`
   - Example: `git commit -m "task(toolbar-appearance): Enhance button styles"`

6. **Push Your Branch**
   - Push to a branch with the same name: `git push origin task/<task-id>[-agent-name]`

7. **Update Task Status**
   - When complete, mark the task as review or done: `./update-task.sh <task-id> review`

8. **Create a Pull Request**
   - Create a PR from your task branch to main
   - Reference the task ID in the PR title and description

## Branch Naming Convention

- Task branches: `task/<task-id>[-agent-name]`
- Examples:
  - `task/editor-styling-cursor`
  - `task/toolbar-appearance-cdt`

## Commit Message Format

- Format: `task(<task-id>): <description>`
- Examples:
  - `task(editor-styling): Apply prose classes to editor content`
  - `task(toolbar-appearance): Improve button styling and hover states`

## Coordination Between Agents

- Check the taskmaster status before starting work on a task
- Don't modify files that are part of a task assigned to another agent
- Use the memory-bank to share important information between agents
- If conflicts arise, communicate through the taskmaster system

## Running the Taskmaster System

- View all tasks: `./run-taskmaster.sh`
- Update task status: `./update-task.sh <task-id> <status>`
- Valid statuses: todo, in-progress, review, done 