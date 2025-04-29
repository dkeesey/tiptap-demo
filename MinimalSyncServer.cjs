// MinimalSyncServer.cjs - Simple WebSocket server for Y.js document synchronization
const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');

// Simple logging
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Error logging
function logError(message, error) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
}

// Set up HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Y.js WebSocket server running\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });
const port = 1236;

// Global state
const docs = new Map();
const awareness = new Map();
const rooms = new Map();
const connections = new Map();

// Message types
const messageSync = 0;
const messageAwareness = 1;
const messagePing = 3;
const messagePong = 4;

// Helper to send messages
function send(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(message);
    return true;
  }
  return false;
}

// Helper to broadcast to room
function broadcastToRoom(room, message, except) {
  const clients = rooms.get(room) || new Set();
  clients.forEach(client => {
    if (client !== except && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Get or create a document
function getDocument(name) {
  let doc = docs.get(name);
  
  if (!doc) {
    log(`Creating new document: ${name}`);
    doc = new Y.Doc();
    docs.set(name, doc);
    
    // Create XML fragment for use by editor
    doc.getXmlFragment('document');
    
    // Create awareness instance
    const aw = new awarenessProtocol.Awareness(doc);
    awareness.set(name, aw);
    
    // Handle document updates
    doc.on('update', (update, origin) => {
      log(`Document update in ${name}`);
      
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      encoding.writeVarUint8Array(encoder, update);
      const message = encoding.toUint8Array(encoder);
      
      // Broadcast to all clients except the originator
      broadcastToRoom(name, message, origin);
    });
    
    // Handle awareness updates
    aw.on('update', ({ added, updated, removed }) => {
      const changedClients = [...added, ...updated, ...removed];
      log(`Awareness update in ${name}: ${changedClients.length} clients`);
      
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(encoder, 
        awarenessProtocol.encodeAwarenessUpdate(aw, changedClients)
      );
      const message = encoding.toUint8Array(encoder);
      
      broadcastToRoom(name, message);
    });
  }
  
  return doc;
}

// Handle new connections
wss.on('connection', (conn, req) => {
  const url = new URL(req.url, 'http://localhost');
  const roomName = url.pathname.slice(1) || 'default-room';
  
  log(`New connection to room: ${roomName}`);
  
  // Set up room
  let room = rooms.get(roomName);
  if (!room) {
    room = new Set();
    rooms.set(roomName, room);
  }
  room.add(conn);
  
  // Track connection
  connections.set(conn, { room: roomName });
  
  // Get document and awareness
  const doc = getDocument(roomName);
  const aw = awareness.get(roomName);
  
  // Initial document sync
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  send(conn, encoding.toUint8Array(encoder));
  
  // Initial awareness sync (if clients already in room)
  if (aw.getStates().size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(aw, Array.from(aw.getStates().keys()))
    );
    send(conn, encoding.toUint8Array(awarenessEncoder));
  }
  
  // Handle messages
  conn.on('message', message => {
    try {
      const data = new Uint8Array(message);
      const decoder = decoding.createDecoder(data);
      const messageType = decoding.readVarUint(decoder);
      
      switch (messageType) {
        case messageSync: {
          // Apply update to doc
          const update = decoding.readVarUint8Array(decoder);
          Y.applyUpdate(doc, update, conn);
          break;
        }
        case messageAwareness: {
          // Apply awareness update
          const update = decoding.readVarUint8Array(decoder);
          awarenessProtocol.applyAwarenessUpdate(aw, update, conn);
          break;
        }
        case messagePing: {
          // Respond with pong
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messagePong);
          send(conn, encoding.toUint8Array(encoder));
          break;
        }
      }
    } catch (err) {
      logError('Error processing message', err);
    }
  });
  
  // Set up ping interval to keep connection alive
  const pingInterval = setInterval(() => {
    if (conn.readyState === WebSocket.OPEN) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messagePing);
      send(conn, encoding.toUint8Array(encoder));
    }
  }, 30000);
  
  // Handle close
  conn.on('close', () => {
    clearInterval(pingInterval);
    
    // Clean up room
    const connInfo = connections.get(conn);
    if (connInfo) {
      const roomName = connInfo.room;
      const room = rooms.get(roomName);
      if (room) {
        room.delete(conn);
        if (room.size === 0) {
          rooms.delete(roomName);
          log(`Room ${roomName} is now empty`);
        }
      }
      
      // Remove from awareness
      const aw = awareness.get(roomName);
      if (aw) {
        awarenessProtocol.removeAwarenessStates(aw, [conn], null);
      }
      
      connections.delete(conn);
      log(`Connection closed for room: ${roomName}`);
    }
  });
  
  // Handle errors
  conn.on('error', err => {
    logError('WebSocket error', err);
  });
});

// Start server
server.listen(port, () => {
  log(`WebSocket server running on port ${port}`);
}); 