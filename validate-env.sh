#!/bin/bash
# validate-env.sh - Script to validate environment variables before deployment

# Check if VITE_WEBSOCKET_URL is set
if [ -z "$VITE_WEBSOCKET_URL" ]; then
  echo "WARNING: VITE_WEBSOCKET_URL environment variable is not set."
  echo "Will use fallback or detection logic instead."
fi

# Check if .env.production exists and VITE_WEBSOCKET_URL is properly set
if [ -f .env.production ]; then
  websocket_url=$(grep VITE_WEBSOCKET_URL .env.production | cut -d '=' -f2)
  if [ -z "$websocket_url" ]; then
    echo "WARNING: VITE_WEBSOCKET_URL not found in .env.production"
  else
    echo "Found VITE_WEBSOCKET_URL in .env.production: $websocket_url"
    
    # Validate format of WebSocket URL
    if [[ "$websocket_url" != ws://* && "$websocket_url" != wss://* ]]; then
      echo "ERROR: VITE_WEBSOCKET_URL must start with ws:// or wss://"
      echo "Current value: $websocket_url"
      exit 1
    fi

    # Validate for production (must use wss://)
    if [[ "$NODE_ENV" == "production" && "$websocket_url" != wss://* ]]; then
      echo "WARNING: In production, WebSocket URL should use secure protocol (wss://)"
      echo "Current value: $websocket_url"
    fi
  fi
else
  echo "WARNING: .env.production file not found"
fi

# Check Vercel configuration if available
if [ -f vercel.json ]; then
  websocket_url=$(grep -o '"VITE_WEBSOCKET_URL": *"[^"]*"' vercel.json | grep -o '"[^"]*"$' | tr -d '"')
  if [ -z "$websocket_url" ]; then
    echo "WARNING: VITE_WEBSOCKET_URL not found in vercel.json"
  else
    echo "Found VITE_WEBSOCKET_URL in vercel.json: $websocket_url"
  fi
fi

# Check Railway configuration if available
if command -v railway &> /dev/null; then
  echo "Checking Railway variables..."
  railway variables get | grep -i websocket || echo "No WebSocket variables found in Railway"
fi

echo "Environment validation complete"
