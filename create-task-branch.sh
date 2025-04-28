#!/bin/bash

# Script to create a task-specific branch for coordinated development

# Check if a task ID was provided
if [ -z "$1" ]; then
  echo "Error: Task ID is required"
  echo "Usage: ./create-task-branch.sh <task-id> [agent-name]"
  echo "Example: ./create-task-branch.sh editor-styling cursor"
  exit 1
fi

TASK_ID=$1
AGENT_NAME=${2:-}

# Format the branch name
if [ -z "$AGENT_NAME" ]; then
  BRANCH_NAME="task/$TASK_ID"
else
  BRANCH_NAME="task/$TASK_ID-$AGENT_NAME"
fi

# Create the branch from main
git checkout main
git pull origin main
git checkout -b $BRANCH_NAME

echo "Created branch $BRANCH_NAME for task $TASK_ID"
echo ""
echo "When you're ready to commit your changes, use:"
echo "git add <files>"
echo "git commit -m \"task($TASK_ID): Your commit message\""
echo ""
echo "To push your changes, use:"
echo "git push origin $BRANCH_NAME"
echo ""
echo "When the task is complete, update the task status in the taskmaster file:"
echo "./update-task.sh $TASK_ID in-progress"
echo ""
echo "Happy coding!" 