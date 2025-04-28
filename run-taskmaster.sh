#!/bin/bash

# Clear the terminal
clear

# Colorful header
echo -e "\033[1;36m" # Cyan
echo "=========================================="
echo "   TipTap Demo Taskmaster Management      "
echo "=========================================="
echo -e "\033[0m" # Reset color

# Check if the tasks directory exists
if [ ! -d "./tasks" ]; then
  echo -e "\033[1;31mError: tasks directory not found. Make sure you're in the project root.\033[0m"
  exit 1
fi

# Check if taskmaster.json exists
if [ ! -f "./taskmaster.json" ]; then
  echo -e "\033[1;31mError: taskmaster.json not found. Make sure you're in the project root.\033[0m"
  exit 1
fi

# Run taskmaster
echo -e "\033[1;33mStarting Taskmaster...\033[0m"
echo ""
npx task-master-ai

# Optional: Add a section to update tasks if needed
# echo -e "\033[1;33mDo you want to update a task? (y/n)\033[0m"
# read response
# if [ "$response" == "y" ]; then
#   echo "Enter task ID to update: "
#   read taskId
#   echo "Enter new status (todo/in-progress/review/done): "
#   read status
#   # Find and update the task status in the JSON files
#   # This would require a JSON parser like jq
# fi

echo ""
echo -e "\033[1;32mTaskmaster session completed.\033[0m"
echo "Remember to regularly update your tasks as you make progress!"
echo ""
