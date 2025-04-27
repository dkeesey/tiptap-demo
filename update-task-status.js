/**
 * Task Status Update Script
 * A Node.js script to update task statuses in the taskmaster JSON files
 * 
 * Usage: node update-task-status.js [task-id] [new-status]
 */

const fs = require('fs');
const path = require('path');

// Validate arguments
const taskId = process.argv[2];
const newStatus = process.argv[3];

if (!taskId || !newStatus) {
  console.error('Usage: node update-task-status.js [task-id] [new-status]');
  console.error('Status options: todo, in-progress, review, done');
  process.exit(1);
}

// Validate status
const validStatuses = ['todo', 'in-progress', 'review', 'done'];
if (!validStatuses.includes(newStatus)) {
  console.error(`Invalid status: ${newStatus}`);
  console.error(`Valid options: ${validStatuses.join(', ')}`);
  process.exit(1);
}

console.log(`Searching for task ${taskId}...`);

// Get all task files
const tasksDir = path.join(__dirname, 'tasks');
let files;

try {
  files = fs.readdirSync(tasksDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(tasksDir, file));
} catch (error) {
  console.error('Error reading tasks directory:', error.message);
  process.exit(1);
}

// Initialize tracking variables
let found = false;
let taskTitle = '';

// Search all files for the task ID
for (const file of files) {
  let data;
  
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${file}:`, error.message);
    continue;
  }
  
  let updated = false;
  
  // Check main tasks
  for (const task of data.tasks || []) {
    if (task.id === taskId) {
      task.status = newStatus;
      updated = true;
      found = true;
      taskTitle = task.title;
      console.log(`Updated main task: ${task.title}`);
    }
    
    // Check subtasks
    if (task.subtasks) {
      for (const subtask of task.subtasks) {
        if (subtask.id === taskId) {
          subtask.status = newStatus;
          updated = true;
          found = true;
          taskTitle = subtask.title;
          console.log(`Updated subtask: ${subtask.title} in task: ${task.title}`);
        }
      }
    }
  }
  
  // Write updated data
  if (updated) {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      console.log(`Successfully updated task status to "${newStatus}" in ${path.basename(file)}`);
    } catch (error) {
      console.error(`Error writing to ${file}:`, error.message);
    }
  }
}

if (!found) {
  console.error(`Task with ID "${taskId}" not found in any task file`);
  console.log('Available task files:');
  files.forEach(file => console.log(`- ${path.basename(file)}`));
  process.exit(1);
} else {
  console.log(`✅ Successfully updated "${taskTitle}" (${taskId}) to status: ${newStatus}`);
  process.exit(0);
}
