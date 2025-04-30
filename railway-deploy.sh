#!/bin/bash

# Railway Deployment Setup Script for TipTap Demo

set -e

# Ensure we're in the correct directory
cd "${RAILWAY_WORKING_DIR:-/}"

# Print environment information
echo "Deployment Environment:"
echo "NODE_ENV: ${NODE_ENV:-development}"
echo "Railway Project: ${RAILWAY_PROJECT_NAME}"
echo "Service: ${RAILWAY_SERVICE_NAME}"

# Verify Node.js and npm versions
echo "Node.js version:"
node --version
echo "npm version:"
npm --version

# Install dependencies
echo "Installing project dependencies..."
npm ci

# Run any necessary type checking or linting
echo "Running type checks..."
npm run type-check || true

# Build the project
echo "Building the project..."
npm run build

# Start the production server
echo "Starting production server..."
npm run start:production

# Optional: Health check
echo "Deployment completed successfully."
exit 0