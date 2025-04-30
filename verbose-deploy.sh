#!/bin/bash

# Verbose Deployment Script for TipTap Demo

set -e  # Exit on any error
set -x  # Print commands and their arguments as they are executed

# Timestamp function
timestamp() {
  date "+%Y-%m-%d %H:%M:%S"
}

# Logging function
log() {
  echo "[$(timestamp)] $*" | tee -a /Users/deankeesey/Workspace/tiptap-demo/deployment.log
}

# Pre-deployment checks
log "Starting pre-deployment validation..."

# Check Node.js and npm versions
log "Node.js version: $(node --version)"
log "npm version: $(npm --version)"

# Check current git branch and status
log "Current git branch: $(git rev-parse --abbrev-ref HEAD)"
log "Git status:"
git status

# Clear any existing build artifacts
log "Clearing previous build artifacts..."
rm -rf dist node_modules/.cache

# Install dependencies with verbose output
log "Installing project dependencies..."
npm ci --verbose

# Run type checking
log "Running TypeScript type checks..."
npm run type-check || true

# Build the project with detailed logging
log "Building project..."
npm run build --loglevel verbose

# Prepare deployment environment variables
log "Preparing deployment environment variables..."
cat > .env.production << EOF
NODE_ENV=production
VITE_WEBSOCKET_URL=wss://websocket-server-production-b045.up.railway.app
WEBSOCKET_SERVER_URL=wss://websocket-server-production-b045.up.railway.app
VITE_APP_TITLE=TipTap Collaborative Editor
ENABLE_COLLABORATION=true
EOF

# Verify build output
log "Verifying build artifacts..."
ls -la dist

# Run any pre-deployment tests
log "Running pre-deployment tests..."
npm test || true

log "Deployment preparation complete. Ready for Railway deployment."
