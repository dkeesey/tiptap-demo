// Simple WebSocket server for Railway deployment
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Create Express app
const app = express();
const PORT = process.env.PORT || 1236;

// Simple health check endpoints
app.get('/', (req, res) => {
  res.send('TipTap WebSocket Server is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    
    // Echo the message back to the client
    ws.send(`Echo: ${message}`);
    
    // Broadcast message to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`Broadcast: ${message}`);
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

