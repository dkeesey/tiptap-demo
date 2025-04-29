# Deploying TipTap Collaborative Editor on Railway

This guide will help you deploy both the WebSocket server and the frontend of your TipTap collaborative editor to Railway.

## Prerequisites

- A [Railway](https://railway.app) account
- Git installed on your machine
- Node.js and npm installed locally for testing

## Deployment Overview

We'll deploy two separate services on Railway:
1. **WebSocket Server**: Handles real-time collaboration through Y.js
2. **Frontend Application**: The TipTap editor interface

## Step 1: Deploy the WebSocket Server

### Option A: Deploy via Railway Dashboard

1. Log in to your Railway account
2. Click on "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Choose the `websocket-server` folder as the deployment directory
5. Railway will automatically detect and deploy your Node.js application

### Option B: Deploy via Railway CLI

1. Install the Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to your Railway account:
   ```bash
   railway login
   ```

3. Navigate to your websocket-server directory:
   ```bash
   cd ~/Workspace/tiptap-demo/websocket-server
   ```

4. Deploy to Railway:
   ```bash
   railway up
   ```

5. Get your deployed service URL:
   ```bash
   railway domain
   ```

## Step 2: Configure Environment Variables

After deploying the WebSocket server:

1. Go to your project in the Railway dashboard
2. Navigate to the websocket-server service
3. Click on "Variables"
4. Add the following variables:
   - `PORT`: Leave as default (Railway sets this automatically)
   - `LOG_LEVEL`: `2`
   - `NODE_ENV`: `production`

## Step 3: Deploy the Frontend

### Option A: Deploy via Railway Dashboard

1. In your Railway project, click "New Service" > "Deploy from GitHub repo"
2. Select the same repository but with the root directory
3. Railway will detect your Vite/Next.js application

### Option B: Deploy via Railway CLI

1. Navigate to your project root:
   ```bash
   cd ~/Workspace/tiptap-demo
   ```

2. Link to an existing Railway project:
   ```bash
   railway link
   ```

3. Deploy the frontend:
   ```bash
   railway up
   ```

## Step 4: Connect Frontend to WebSocket Server

1. Get the URL of your WebSocket server from the Railway dashboard or CLI:
   ```bash
   railway domain --service websocket-server
   ```

2. In your frontend service, add an environment variable:
   - `VITE_WEBSOCKET_URL`: `wss://your-websocket-service.railway.app`

3. Ensure your WebSocketService.ts is using this environment variable:
   ```typescript
   this.config = {
     primaryUrl: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:1236',
     // other config...
   };
   ```

4. Redeploy your frontend if needed:
   ```bash
   railway up
   ```

## Step 5: Set Up Custom Domains (Optional)

1. In the Railway dashboard, go to your project
2. Select the frontend service
3. Go to "Settings" > "Domains"
4. Click "Generate Domain" for a Railway subdomain or "Custom Domain" to use your own

## Advanced Configuration

### Railway Project Structure

You can organize your services in a Railway project using a structure like:

```
my-tiptap-project/
├── websocket-server/     # WebSocket service
└── frontend/             # Frontend service
```

Each service can have its own configuration and environment variables while sharing the same project.

### Monitoring and Logs

1. In the Railway dashboard, navigate to your service
2. Click on "Metrics" to view resource usage
3. Click on "Logs" to view real-time logs
4. Use the health endpoint (`/health`) to monitor the WebSocket server status

## Troubleshooting

### WebSocket Connection Issues

If your frontend can't connect to the WebSocket server:

1. Check that the WebSocket URL is using `wss://` protocol (secure WebSockets)
2. Verify that the WebSocket server is running (`/health` endpoint should return a 200 status)
3. Check the CORS configuration in both services
4. Verify environment variables are correctly set

### Railway Deployment Failed

If deployment fails:

1. Check the deployment logs in the Railway dashboard
2. Ensure your package.json has the correct start script
3. Verify that all dependencies are properly listed
4. Check for any file size or resource limits

## Scaling Your Application

Railway makes it easy to scale your application:

1. Go to your service settings
2. Adjust the memory, CPU, and instances as needed
3. Enable auto-scaling for the WebSocket server if needed

Railway automatically handles scaling and load balancing for your services.
