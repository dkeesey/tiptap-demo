# TipTap Collaborative Editor - Deployment Guide

This guide explains how to deploy the TipTap Collaborative Editor, with a focus on ensuring reliable WebSocket connectivity for real-time collaboration.

## Deployment Options

You have two primary deployment options:

1. **Consolidated Railway Deployment** (Recommended)
   - Both frontend and WebSocket server on Railway
   - Simplified environment variable management
   - Coordinated deployments

2. **Hybrid Deployment** (Vercel + Railway)
   - Frontend on Vercel
   - WebSocket server on Railway
   - More complex environment configuration

## Files and Scripts Created

### Deployment Scripts

- **deploy-railway.sh**: Deploys both services to Railway with proper coordination
- **validate-env.sh**: Validates environment variables before deployment
- **collect-logs.sh**: Gathers logs for troubleshooting
- **setup-deployment-scripts.sh**: Makes all scripts executable

### Configuration Files

- **frontend-railway.json**: Railway configuration for frontend service
- **websocket-railway.json**: Railway configuration for WebSocket server
- **vercel.json.new**: Updated Vercel configuration with proper environment variables

### Code Updates

- **src/services/WebSocketService.ts**: Enhanced with better connection handling
- **src/components/ConnectionStatus.tsx**: New component for connection visualization
- **EnhancedWebSocketServer.cjs**: Updated with health endpoint and CORS configuration

### Testing

- **test-collaborative-features.js**: Automated testing for collaborative features
- **memory-bank/collaborative-testing-checklist.md**: Checklist for manual testing

### Documentation

- **docs/deployment-architecture.md**: Comprehensive documentation of deployment architecture
- **memory-bank/deployment-solution.md**: Detailed explanation of implemented solutions
- **DEPLOYMENT.md**: This guide

## Deployment Instructions

### 1. Initial Setup

```bash
# Make deployment scripts executable
chmod +x setup-deployment-scripts.sh
./setup-deployment-scripts.sh
```

### 2. Consolidated Railway Deployment

```bash
# Install Railway CLI if not already installed
npm i -g @railway/cli

# Login to Railway
railway login

# Deploy both services
./deploy-railway.sh
```

### 3. Hybrid Deployment (Vercel + Railway)

**Step 1: Deploy WebSocket Server to Railway**
```bash
# Install Railway CLI if not already installed
npm i -g @railway/cli

# Login to Railway
railway login

# Copy WebSocket configuration
cp websocket-railway.json railway.json

# Deploy WebSocket server
railway up --detach

# Note the Railway domain
WS_URL=$(railway domain)
echo "WebSocket server deployed at: wss://$WS_URL"
```

**Step 2: Update Vercel Configuration**
```bash
# Replace placeholders in vercel.json.new
# with your actual WebSocket URL
sed "s/tiptap-demo-production.up.railway.app/$WS_URL/g" vercel.json.new > vercel.json

# Deploy to Vercel using Vercel CLI
vercel --prod
```

## Validation and Troubleshooting

### 1. Validate Environment Variables

```bash
./validate-env.sh
```

### 2. Test Collaborative Features

```bash
# Install test dependencies
npm i puppeteer uuid

# Run automated tests
node test-collaborative-features.js
```

### 3. Collect Logs for Troubleshooting

```bash
./collect-logs.sh
```

## Common Issues and Solutions

### WebSocket Connection Issues

**Problem**: Frontend cannot connect to WebSocket server
**Solution**: 
- Ensure WebSocket URL is correct in environment variables
- Verify WebSocket server is running (check health endpoint)
- Check for protocol mismatch (ws:// vs wss://)

### Environment Variable Problems

**Problem**: Environment variables not propagating to the frontend
**Solution**:
- Verify variables are set correctly in deployment platform
- Ensure VITE_ prefix is used for frontend variables
- Check browser console for loaded environment variables

### CORS Errors

**Problem**: Cross-origin requests blocked
**Solution**:
- Verify WebSocket server has proper CORS headers
- Check for protocol mismatches in URLs
- Ensure domains are properly configured

## Additional Resources

For more detailed information, refer to:
- **deployment-architecture.md**: Comprehensive documentation of the architecture
- **deployment-solution.md**: Detailed explanation of implemented solutions
- **WebSocketService.ts**: Implementation details of connection handling
