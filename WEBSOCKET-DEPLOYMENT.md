# WebSocket Server Deployment Guide

This guide provides step-by-step instructions for deploying the WebSocket server required for the collaborative editing features of the TipTap demo application.

## Option 1: Deploy to an EC2 Instance (Recommended for Development)

EC2 instances provide a simple, cost-effective way to run your WebSocket server with full control.

### 1. Launch an EC2 Instance

1. Log in to your AWS Management Console
2. Go to EC2 Dashboard and click "Launch instance"
3. Choose an Ubuntu Server (t2.micro is sufficient for testing and is free-tier eligible)
4. Configure security groups to allow inbound traffic on:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 1236 (WebSocket)
5. Launch the instance and save your key pair

### 2. Connect to Your Instance

```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

### 3. Upload Files to Your Instance

Option A: Using SCP:
```bash
scp -i your-key.pem server.js deploy-websocket.sh ubuntu@your-instance-ip:~/
```

Option B: Clone from your repository:
```bash
git clone https://github.com/yourusername/tiptap-demo.git
```

### 4. Run the Deployment Script

```bash
cd ~/
chmod +x deploy-websocket.sh
./deploy-websocket.sh
```

This script will:
- Update system packages
- Install Node.js and npm
- Install PM2 for process management
- Set up the WebSocket server
- Configure auto-restart and system boot startup
- Optionally set up Nginx and SSL

### 5. Verify the Deployment

The WebSocket server should now be running at `ws://your-instance-ip:1236`.

Check server status:
```bash
pm2 status
```

Test the server health endpoint:
```bash
curl http://your-instance-ip:1236/health
```

## Option 2: Deploy to Render.com

Render.com provides a simple managed platform for running services with persistent connections.

### 1. Create an Account on Render

Sign up at [render.com](https://render.com) if you don't already have an account.

### 2. Create a New Web Service

1. Click "New" and select "Web Service"
2. Connect your GitHub repository or upload your files
3. Configure the service:
   - **Name**: tiptap-websocket
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (for testing) or Standard (for production)

### 3. Configure Environment Variables

Add the following environment variables:
- `PORT`: 10000 (Render assigns this port)
- `LOG_LEVEL`: 2 (or your preferred level)

### 4. Deploy the Service

Click "Create Web Service" and wait for the deployment to complete.

Your WebSocket server will be available at `wss://your-service-name.onrender.com`.

## Option 3: Deploy to Fly.io

Fly.io is well-suited for WebSocket applications with a generous free tier.

### 1. Install the Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### 2. Sign Up and Log In

```bash
fly auth signup
# or
fly auth login
```

### 3. Create a fly.toml Configuration File

Create a `fly.toml` file in your project directory:

```toml
app = "tiptap-websocket"
primary_region = "sjc"  # Choose your primary region

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "8080"
  LOG_LEVEL = "2"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

### 4. Deploy to Fly.io

```bash
fly launch
fly deploy
```

Your WebSocket server will be available at `wss://tiptap-websocket.fly.dev`.

## Updating Your Frontend (Vercel)

Once your WebSocket server is deployed, you need to update your Vercel environment variables:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add a new environment variable:
   - Key: `VITE_WEBSOCKET_URL`
   - Value: Your WebSocket URL (e.g., `wss://your-domain.com` or `wss://tiptap-websocket.fly.dev`)
4. Save the changes and redeploy your application

## Testing the Connection

1. Open your deployed application
2. Open the browser console and check for WebSocket connection messages
3. Try collaborating with yourself by opening the application in two different browser windows

## Troubleshooting

### Connection Issues

If you're experiencing connection issues:

1. Check if your WebSocket server is running:
   ```bash
   curl https://your-websocket-url/health
   ```

2. Verify your security groups/firewall allows WebSocket traffic

3. Test with a WebSocket client like wscat:
   ```bash
   npm install -g wscat
   wscat -c wss://your-websocket-url
   ```

### Persistence Issues

If your documents aren't persisting between