#!/bin/bash

# Backup the original .env file
cp .env .env.backup

# Update the WebSocket URL in the .env file
sed -i '' 's/VITE_WEBSOCKET_URL=ws:\/\/localhost:8080/VITE_WEBSOCKET_URL=ws:\/\/localhost:1236/' .env

echo "Updated WebSocket URL in .env from port 8080 to 1236"
echo "Original file backed up as .env.backup"