# TipTap Frontend Service - Manual Update Instructions

Since we're having authentication issues with the Railway CLI, please follow these manual steps to update the frontend service in the Railway dashboard:

## 1. Log in to Railway Dashboard

Go to https://railway.app and log in to your account.

## 2. Navigate to Your Project

Find and select the TipTap project.

## 3. Update Frontend Service Configuration

1. Select the frontend service (tiptap-frontend)
2. Go to the "Settings" tab
3. Update the "Start Command" to:
   ```
   node server.js
   ```
4. Save the changes

## 4. Update Environment Variables

1. Go to the "Variables" tab
2. Add or update the following environment variables:
   - `VITE_WEBSOCKET_URL` = `wss://websocket-server-production-b045.up.railway.app`
   - `NODE_ENV` = `production`
   - `VITE_APP_TITLE` = `TipTap Collaborative Editor`
   - `ENABLE_COLLABORATION` = `true`
   - `ENABLE_WEBSOCKET_FALLBACK` = `true`
3. Save the changes

## 5. Redeploy the Service

1. Go to the "Deployments" tab
2. Click "Deploy Now" to redeploy the service with the new configuration
3. Wait for the deployment to complete

## 6. Verify the Deployment

1. Once deployment is complete, click on the service URL or navigate to:
   https://tiptap-frontend-production.up.railway.app/
2. You should now see the TipTap editor interface instead of the "Y.js WebSocket server running" message

## Troubleshooting

If you still see "Y.js WebSocket server running" after redeployment:

1. Check the deployment logs for errors
2. Verify that the start command is correctly set to `node server.js`
3. Make sure that the server.js file exists in the repository
4. Try restarting the service from the "Settings" tab 