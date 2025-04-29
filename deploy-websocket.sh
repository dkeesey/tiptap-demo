#!/bin/bash
# WebSocket server deployment script for EC2 or similar VPS
# Save this as deploy-websocket.sh and run with: bash deploy-websocket.sh

# Make script exit on any error
set -e

# Update system packages
echo "====== Updating system packages ======"
sudo apt update
sudo apt upgrade -y

# Install Node.js and npm if not already installed
echo "====== Installing Node.js and npm ======"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Show Node.js and npm versions
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Install PM2 for process management
echo "====== Installing PM2 ======"
sudo npm install -g pm2

# Create directory for the WebSocket server
echo "====== Setting up application directory ======"
mkdir -p ~/tiptap-websocket
cd ~/tiptap-websocket

# Copy server files from current directory
echo "====== Copying files ======"
cp ../server.js .
cp ../package.json .

# Create a package.json if it doesn't exist
if [ ! -f package.json ]; then
    echo "Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "tiptap-websocket-server",
  "version": "1.0.0",
  "description": "WebSocket server for TipTap collaborative editing",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.13.0",
    "yjs": "^13.6.8",
    "y-protocols": "^1.0.5",
    "lib0": "^0.2.88"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF
fi

# Install dependencies
echo "====== Installing dependencies ======"
npm install

# Set up PM2 configuration
echo "====== Setting up PM2 configuration ======"
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "tiptap-websocket",
    script: "server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "300M",
    env: {
      NODE_ENV: "production",
      PORT: "1236",
      LOG_LEVEL: "2"
    }
  }]
};
EOF

# Set up log rotation
echo "====== Setting up log rotation ======"
sudo touch /etc/logrotate.d/pm2-tiptap
sudo cat > /etc/logrotate.d/pm2-tiptap << 'EOF'
/home/ubuntu/.pm2/logs/*.log {
  daily
  rotate 7
  compress
  missingok
  notifempty
  copytruncate
}
EOF

# Start the server with PM2
echo "====== Starting WebSocket server with PM2 ======"
pm2 start ecosystem.config.js
pm2 save

# Set up PM2 to start on boot
echo "====== Setting up PM2
 to start on boot ======"
pm2 startup | grep -v PM2
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME | grep -v PM2
pm2 save

# Set up a simple nginx reverse proxy for SSL if needed
echo "====== Do you want to set up Nginx for SSL? (y/n) ======"
read -p "Install Nginx? (y/n): " install_nginx

if [ "$install_nginx" = "y" ]; then
    # Install Nginx
    sudo apt install -y nginx certbot python3-certbot-nginx

    # Create Nginx config
    sudo cat > /etc/nginx/sites-available/tiptap-websocket << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN.COM;  # Replace with your domain

    location / {
        proxy_pass http://localhost:1236;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

    # Enable site
    sudo ln -s /etc/nginx/sites-available/tiptap-websocket /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl restart nginx

    # Set up SSL with Let's Encrypt
    echo "====== Do you want to set up SSL with Let's Encrypt? (y/n) ======"
    read -p "Set up SSL? (y/n): " setup_ssl

    if [ "$setup_ssl" = "y" ]; then
        read -p "Enter your domain name: " domain_name
        sudo sed -i "s/YOUR_DOMAIN.COM/$domain_name/g" /etc/nginx/sites-available/tiptap-websocket
        sudo certbot --nginx -d $domain_name
    fi
fi

# Show server status
echo "====== WebSocket Server Status ======"
pm2 status

# Show server logs
echo "====== WebSocket Server Logs ======"
pm2 logs tiptap-websocket --lines 10

# Test the server with curl
echo "====== Testing server with curl ======"
curl -i http://localhost:1236/health

echo ""
echo "====== WebSocket server deployment complete! ======"
echo "The server is running on port 1236"
echo "To check server status, run: pm2 status"
echo "To view logs, run: pm2 logs tiptap-websocket"
echo "To restart the server, run: pm2 restart tiptap-websocket"
