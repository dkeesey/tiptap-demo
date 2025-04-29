// y-websocket-server.cjs
// Using the official y-websocket implementation
const WebSocketServer = require('ws').Server;
const http = require('http');
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');

// Create server
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('y-websocket server running\n');
});

// Create WebSocket server
const wss = new WebSocketServer({ server });
const port = 1236;

// Y.js setup - track documents by room name
const docs = new Map();

// Connect to y-websocket
wss.on('connection', (conn, req) => {
  console.log('New connection');
  
  // Use the built-in y-websocket utils to handle the connection
  // This handles all the synchronization logic automatically
  setupWSConnection(conn, req, { 
    // This callback creates/gets the Y.js document for the given document ID
    docName: req.url.slice(1).split('?')[0] || 'default-room',
    gc: true, // Enable garbage collection
  });
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Start server
server.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
}); 