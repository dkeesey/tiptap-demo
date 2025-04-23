// SimpleWebSocketServer.js
// A simplified WebSocket server for local collaboration testing

const WebSocket = require('ws');
const http = require('http');
const port = process.env.PORT || 1234;

const server = http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('WebSocket server for TipTap collaboration\n');
});

const wss = new WebSocket.Server({ server });

// Map to store active rooms and their clients
const rooms = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected');
  let clientRoom = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle room-based message forwarding
      if (data.type === 'join-room') {
        const roomName = data.room;
        clientRoom = roomName;
        
        // Create room if it doesn't exist
        if (!rooms.has(roomName)) {
          rooms.set(roomName, new Set());
        }
        
        // Add client to room
        rooms.get(roomName).add(ws);
        console.log(`Client joined room: ${roomName}`);
        
        // Send acknowledgment
        ws.send(JSON.stringify({
          type: 'room-joined',
          room: roomName,
          timestamp: Date.now()
        }));
      } 
      // Forward update messages to all clients in the same room
      else if (data.type === 'update' && clientRoom) {
        const roomClients = rooms.get(clientRoom);
        if (roomClients) {
          roomClients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        }
      }
      // Handle awareness updates (cursor positions, etc.)
      else if (data.type === 'awareness' && clientRoom) {
        const roomClients = rooms.get(clientRoom);
        if (roomClients) {
          roomClients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Remove client from room
    if (clientRoom && rooms.has(clientRoom)) {
      rooms.get(clientRoom).delete(ws);
      
      // Clean up empty rooms
      if (rooms.get(clientRoom).size === 0) {
        rooms.delete(clientRoom);
        console.log(`Room deleted: ${clientRoom}`);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port}`);
});
