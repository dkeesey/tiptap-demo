#!/bin/bash
# collect-logs.sh - Gather logs from both services for debugging

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_DIR="deployment-logs-$TIMESTAMP"

mkdir -p "$LOG_DIR"

# Check if railway CLI is available
if ! command -v railway &> /dev/null; then
  echo "Railway CLI not found. Install with: npm i -g @railway/cli"
  echo "Then login with: railway login"
  exit 1
fi

# Collect WebSocket server logs
echo "Collecting WebSocket server logs..."
railway logs > "$LOG_DIR/websocket-server.log" || echo "Failed to get WebSocket logs"

# Collect frontend logs
echo "Collecting frontend logs..."
railway logs > "$LOG_DIR/frontend.log" || echo "Failed to get frontend logs"

# Collect environment variables
echo "Collecting environment variables..."
railway variables get > "$LOG_DIR/railway-env.txt" || echo "Failed to get environment variables"

# Check for local environment files
echo "Collecting local environment files..."
if [ -f .env ]; then
  cp .env "$LOG_DIR/.env"
fi
if [ -f .env.local ]; then
  cp .env.local "$LOG_DIR/.env.local"
fi
if [ -f .env.production ]; then
  cp .env.production "$LOG_DIR/.env.production"
fi

# Check for Vercel configuration
if [ -f vercel.json ]; then
  cp vercel.json "$LOG_DIR/vercel.json"
fi

# Test WebSocket connection if wscat is available
if command -v wscat &> /dev/null; then
  echo "Testing WebSocket connection..."
  
  # Try to extract WebSocket URL from environment files
  WS_URL=""
  if [ -f .env.production ]; then
    WS_URL=$(grep VITE_WEBSOCKET_URL .env.production | cut -d '=' -f2)
  fi
  
  if [ -z "$WS_URL" ] && [ -f vercel.json ]; then
    WS_URL=$(grep -o '"VITE_WEBSOCKET_URL": *"[^"]*"' vercel.json | grep -o '"[^"]*"$' | tr -d '"')
  fi
  
  if [ -n "$WS_URL" ]; then
    echo "Testing connection to $WS_URL"
    wscat -c "$WS_URL" --wait 2000 > "$LOG_DIR/websocket-test.log" 2>&1 || echo "WebSocket connection test failed"
  else
    echo "Could not determine WebSocket URL for testing"
  fi
fi

# Create summary report
echo "Creating summary report..."
cat > "$LOG_DIR/summary.md" << EOF
# Deployment Log Collection
**Date:** $(date)

## Environment Files
$(ls -la "$LOG_DIR"/*.env* 2>/dev/null || echo "No environment files found")

## Configuration Files
$(ls -la "$LOG_DIR"/*.json 2>/dev/null || echo "No configuration files found")

## Log Files
$(ls -la "$LOG_DIR"/*.log 2>/dev/null || echo "No log files found")
EOF

echo "Log collection complete: $LOG_DIR"
echo "To analyze logs, run: less $LOG_DIR/websocket-server.log"
