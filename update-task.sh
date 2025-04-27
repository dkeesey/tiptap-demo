#!/bin/bash

# Script to update task status in taskmaster files
# Usage: ./update-task.sh [task-id] [new-status]

TASK_ID=$1
NEW_STATUS=$2

if [ -z "$TASK_ID" ] || [ -z "$NEW_STATUS" ]; then
  echo "Usage: ./update-task.sh [task-id] [new-status]"
  echo "Status options: todo, in-progress, review, done"
  exit 1
fi

# Validate status
if [[ ! "$NEW_STATUS" =~ ^(todo|in-progress|review|done)$ ]]; then
  echo "Invalid status: $NEW_STATUS"
  echo "Valid options: todo, in-progress, review, done"
  exit 1
fi

echo "Searching for task $TASK_ID..."

# Find the task in all JSON files
found=false
for file in tasks/*.json; do
  if grep -q "\"id\": \"$TASK_ID\"" "$file"; then
    echo "Found task in $file"
    found=true
    
    # Create a temporary file for the update
    temp_file=$(mktemp)
    
    # Use node to update the JSON since it's more reliable than text processing
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('$file', 'utf8'));
      
      let updated = false;
      
      // Update main tasks
      for (const task of data.tasks) {
        if (task.id === '$TASK_ID') {
          task.status = '$NEW_STATUS';
          updated = true;
          console.log('Updated main task: ' + task.title);
        }
        
        // Check subtasks
        if (task.subtasks) {
          for (const subtask of task.subtasks) {
            if (subtask.id === '$TASK_ID') {
              subtask.status = '$NEW_STATUS';
              updated = true;
              console.log('Updated subtask: ' + subtask.title);
            }
          }
        }
      }
      
      if (updated) {
        fs.writeFileSync('$temp_file', JSON.stringify(data, null, 2));
        console.log('Successfully updated task status to $NEW_STATUS');
      } else {
        console.log('Task ID found in file but could not update it');
        process.exit(1);
      }
    "
    
    # If update was successful, replace the original file
    if [ $? -eq 0 ]; then
      mv "$temp_file" "$file"
      echo "Updated task $TASK_ID in $file to status: $NEW_STATUS"
      exit 0
    else
      rm "$temp_file"
      echo "Failed to update task"
      exit 1
    fi
  fi
done

if [ "$found" = false ]; then
  echo "Task with ID $TASK_ID not found in any task file"
  echo "Available task files:"
  ls -la tasks/*.json
  exit 1
fi
