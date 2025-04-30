# TipTap Collaborative Editor - Deployment Troubleshooting Guide

## Deployment Environment
- **Frontend**: Vercel
- **WebSocket Server**: Railway
- **Project Path**: `/Users/deankeesey/Workspace/tiptap-demo`

## Deployment Failure Diagnostics

### Common Deployment Blockers
1. Incorrect Build Commands
2. Missing Environment Variables
3. Incompatible Node.js Versions
4. Misconfigured Start Scripts
5. Dependency Conflicts

### Diagnostic Checklist

#### Frontend (Vercel) Deployment
- [ ] Verify `package.json` scripts
- [ ] Check Vite build configuration
- [ ] Validate environment variable setup
- [ ] Ensure correct output directory

#### WebSocket Server (Railway) Deployment
- [ ] Review server startup script
- [ ] Check dependencies
- [ ] Validate environment configuration
- [ ] Verify Node.js compatibility

## Troubleshooting Workflow

### Comprehensive Logging Script
```bash
#!/bin/bash

# Deployment Diagnostic Script

# Environment Information
echo "=== System Information ==="
echo "Node.js Version: $(node --version)"
echo "npm Version: $(npm --version)"
echo "Current Directory: $(pwd)"
echo "Git Branch: $(git rev-parse --abbrev-ref HEAD)"

# Dependency Check
echo -e "\n=== Dependency Verification ==="
npm ls --depth=0 || npm install

# Build Diagnostics
echo -e "\n=== Build Diagnostics ==="
npm run build --verbose

# Start Command Test
echo -e "\n=== Start Command Test ==="
npm run start:production || echo "Start command failed"

# Environment Variable Dump
echo -e "\n=== Environment Variables ==="
env | grep -E 'VITE_|RAILWAY_|NODE_ENV'
```

### Debugging Checklist
1. Verify Node.js Version Compatibility
   - Ensure consistent Node.js version across local and deployment environments
   - Use `.nvmrc` or `engines` in `package.json`

2. Environment Variable Configuration
   - Use `.env.production` for production-specific variables
   - Ensure critical variables are set in deployment platform
   - Use environment-specific configuration

3. Dependency Management
   - Use `npm ci` instead of `npm install` in CI/CD
   - Maintain consistent `package-lock.json`
   - Prune unnecessary dependencies

4. Build and Start Scripts
   ```json
   {
     "scripts": {
       "build": "vite build",
       "start:production": "npm run build && vite preview --port 3000",
       "start": "node EnhancedWebSocketServer.cjs"
     }
   }
   ```

## Deployment Configuration Best Practices

### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_WEBSOCKET_URL": "@websocket-server-url"
  }
}
```

### Railway Configuration (`railway.json`)
```json
{
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm install && npm run build",
    "nixpacksPlan": {
      "phases": {
        "setup": ["export NODE_ENV=production"],
        "install": ["npm ci"],
        "build": ["npm run build"]
      }
    }
  },
  "deploy": {
    "startCommand": "npm run start:production",
    "healthcheckPath": "/health",
    "restartPolicyType": "on_failure"
  }
}
```

## Connection Troubleshooting

### WebSocket Connection Debugging
1. Verify WebSocket URL
2. Check CORS configuration
3. Implement connection logging
4. Test fallback mechanisms

### Logging Mechanism
```typescript
class WebSocketDebugger {
  static logConnectionAttempt(url: string) {
    console.log(`Attempting WebSocket connection to: ${url}`);
  }

  static logConnectionSuccess(url: string) {
    console.log(`Successfully connected to WebSocket: ${url}`);
  }

  static logConnectionError(url: string, error: Error) {
    console.error(`WebSocket connection failed for ${url}:`, error);
  }
}
```

## Next Investigation Steps
1. Review most recent deployment logs
2. Verify environment configurations
3. Test local build and start processes
4. Validate WebSocket connection mechanism

## Recommended Tools
- Railway CLI
- Vercel CLI
- Chrome DevTools Network tab
- WebSocket testing tools (Postman, WebSocket King)

## Document Versions and Tracking
- Last Updated: 2025-04-29
- Project Status: Deployment in Progress
- Primary Focus: WebSocket Server Deployment