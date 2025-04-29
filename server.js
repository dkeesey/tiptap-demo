// Simple Express wrapper for Y.js WebSocket server
// Can be deployed to AWS EC2, Render, Fly.io, or any Node.js hosting platform
const express = require('express');
const http = require('http');
const WebSocketServer = require('ws').Server;
const Y = require('yjs');
const awarenessProtocol = require('y-protocols/awareness');
const syncProtocol = require('y-protocols/sync');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');

// Create Express app for health checks and server info
const app = express();
const PORT = process.env.PORT || 1236;

// Simple logging with log levels
const LOG_LEVEL = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : 2; // 0=error, 1=warn, 2=info, 3=debug

function log(level, message, data) {
  if (level <= LOG_LEVEL) {
    const prefix = level === 0 ? '[ERROR]' :
                  level === 1 ? '[WARN]' :
                  level === 2 ? '[INFO]' : '[DEBUG]';
    
    console.log(`${prefix} ${message}`);
    if (data && level <= LOG_LEVEL) {
      console.log(data);
    }
  }
}

// Setup API routes
app.get('/', (req, res) => {
  res.send('TipTap WebSocket Server is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    connections: wss ? wss.clients.size : 0,
    rooms: rooms ? rooms.size : 0
  });
});

app.get('/metrics', (req, res) => {
  const metrics = {
    connections: wss ? wss.clients.size : 0,
    rooms: rooms ? rooms.size : 0,
    roomsList: Array.from(rooms.keys()),
    roomSizes: {}
  };
  
  // Add room sizes
  rooms.forEach((clients, room) => {
    metrics.roomSizes[room] = clients.size;
  });
  
  res.status(200).json(metrics);
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server,
  clientTracking: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 1 
    }
  }
});

// Message types for Y.js protocol
const messageSync = 0;
const messageAwareness = 1;
const messagePing = 3;
const messagePong = 4;

// Room and document management
const rooms = new Map();
const connectionToRoom = new Map();
const docs = new Map();
const awareness = new Map();
const connectionStatus = new Map();

// Helper to safely send messages with error handling
function send(conn, message) {
  try {
    if (conn.readyState === WebSocketServer.OPEN) {
      conn.send(message);
      return true;
    }
  } catch (err) {
    log(0, 'Error sending message', err);
    
    // Update connection status
    connectionStatus.set(conn, {
      ...connectionStatus.get(conn) || {},
      state: 'error',
      lastError: err.message,
      timestamp: Date.now()
    });
  }
  return false;
}

// Get or create a Y.js document for a room
const getYDoc = (docName) => {
  let doc = docs.get(docName);
  if (!doc) {
    log(2, `Creating new doc: ${docName}`);
    
    try {
      doc = new Y.Doc();
      docs.set(docName, doc);
      
      // Set up awareness
      const awarenessState = new awarenessProtocol.Awareness(doc);
      awareness.set(docName, awarenessState);
      
      // Set up awareness update handler
      awarenessState.on('update', ({ added, updated, removed }, origin) => {
        try {
          const clients = rooms.get(docName) || new Set();
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messageAwareness);
          encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awarenessState, added.concat(updated, removed)));
          const message = encoding.toUint8Array(encoder);
          
          // Send to all clients except the originator
          clients.forEach((client) => {
            if (client !== origin && client.readyState === WebSocketServer.OPEN) {
              send(client, message);
            }
          });
        } catch (err) {
          log(0, 'Error in awareness update', err);
        }
      });
    } catch (err) {
      log(0, `Error creating doc: ${docName}`, err);
      throw err;
    }
  }
  return doc;
};

// Helper for handling disconnects consistently
function handleDisconnect(conn) {
  try {
    const roomName = connectionToRoom.get(conn);
    if (roomName) {
      const room = rooms.get(roomName);
      if (room) {
        room.delete(conn);
        if (room.size === 0) {
          rooms.delete(roomName);
          log(2, `Room ${roomName} is now empty`);
        }
      }
      connectionToRoom.delete(conn);
      
      // Clean up awareness
      const awarenessState = awareness.get(roomName);
      if (awarenessState) {
        const clientId = conn.clientId;
        const removed = [];
        
        if (clientId !== undefined) {
          removed.push(clientId);
        }
        
        if (removed.length > 0) {
          awarenessProtocol.removeAwarenessStates(
            awarenessState, 
            removed, 
            'connection closed'
          );
        }
      }
      
      connectionStatus.delete(conn);
      log(2, 'Client disconnected and cleanup complete');
    }
  } catch (err) {
    log(0, 'Error during client disconnect', err);
  }
}

// WebSocket connection handler
wss.on('connection', (conn, req) => {
  // Extract document name from URL path
  const docName = req.url.slice(1).split('?')[0] || 'default-room';
  const clientIp = req.socket.remoteAddress;
  
  // Generate a client ID
  conn.clientId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  
  log(2, `New client (${conn.clientId}) connecting from ${clientIp} to room: ${docName}`);

  try {
    // Initialize connection status
    connectionStatus.set(conn, {
      state: 'connected',
      timestamp: Date.now(),
      room: docName,
      ip: clientIp
    });

    // Manage room and connection
    let room = rooms.get(docName);
    if (!room) {
      room = new Set();
      rooms.set(docName, room);
      log(2, `Created new room: ${docName}`);
    }
    room.add(conn);
    connectionToRoom.set(conn, docName);

    // Get or create document and awareness
    const doc = getYDoc(docName);
    const awarenessState = awareness.get(docName);

    // Send initial sync message with error handling
    try {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeSyncStep1(encoder, doc);
      if (send(conn, encoding.toUint8Array(encoder))) {
        log(3, 'Initial sync message sent successfully');
      }
    } catch (syncErr) {
      log(0, 'Error sending initial sync message', syncErr);
    }

    // Message handler
    conn.on('message', (message) => {
      try {
        // Update connection status
        connectionStatus.set(conn, {
          ...connectionStatus.get(conn) || {},
          lastActivity: Date.now(),
          state: 'active'
        });

        // Normalize message to Uint8Array
        const messageData = message instanceof Buffer 
          ? new Uint8Array(message) 
          : message instanceof ArrayBuffer 
            ? new Uint8Array(message) 
            : null;

        if (!messageData) {
          log(2, 'Received non-binary message, ignoring');
          return;
        }

        const decoder = decoding.createDecoder(messageData);
        const encoder = encoding.createEncoder();

        const messageType = decoding.readVarUint(decoder);
        
        if (messageType === messageSync) {
          try {
            const syncMessageType = decoding.readVarUint(decoder);
            
            log(3, `Received sync message of type: ${syncMessageType}`);

            // Defensive checks before processing
            if (decoder.arr.length - decoder.pos < 1) {
              log(1, 'Sync message too short, ignoring');
              return;
            }

            // Process sync messages
            if (syncMessageType === 0) { // sync step 1
              syncProtocol.readSyncStep1(decoder, encoder, doc);
              send(conn, encoding.toUint8Array(encoder));
            } else if (syncMessageType === 1) { // sync step 2
              syncProtocol.readSyncStep2(decoder, doc);
            } else if (syncMessageType === 2) { // update
              const update = decoding.readVarUint8Array(decoder);
              Y.applyUpdate(doc, update);
              
              // Broadcast update to all clients in the room
              const clients = rooms.get(docName) || new Set();
              clients.forEach((client) => {
                if (client !== conn && client.readyState === WebSocketServer.OPEN) {
                  const updateEncoder = encoding.createEncoder();
                  encoding.writeVarUint(updateEncoder, messageSync);
                  encoding.writeVarUint(updateEncoder, 2); // update message
                  encoding.writeVarUint8Array(updateEncoder, update);
                  send(client, encoding.toUint8Array(updateEncoder));
                }
              });
            }
          } catch (syncErr) {
            log(0, 'Error processing sync message', syncErr);
          }
        } else if (messageType === messageAwareness) {
          // Handle awareness updates
          try {
            const update = decoding.readVarUint8Array(decoder);
            awarenessProtocol.applyAwarenessUpdate(awarenessState, update, conn);
          } catch (awarenessErr) {
            log(0, 'Error applying awareness update', awarenessErr);
          }
        } else if (messageType === messagePing) {
          // Handle ping message - respond with pong
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messagePong);
          send(conn, encoding.toUint8Array(encoder));
        }
      } catch (err) {
        log(0, 'Error processing WebSocket message', err);
      }
    });

    // Add ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      try {
        if (conn.readyState === WebSocketServer.OPEN) {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messagePing);
          send(conn, encoding.toUint8Array(encoder));
        } else {
          clearInterval(pingInterval);
        }
      } catch (err) {
        log(0, 'Error sending ping', err);
        clearInterval(pingInterval);
      }
    }, 30000);

    // Handle disconnection
    conn.on('close', () => {
      clearInterval(pingInterval);
      handleDisconnect(conn);
    });

    // Handle connection errors
    conn.on('error', (err) => {
      log(0, 'WebSocket connection error', err);
      connectionStatus.set(conn, {
        ...connectionStatus.get(conn) || {},
        state: 'error',
        lastError: err.message,
        timestamp: Date.now()
      });
    });

  } catch (err) {
    log(0, 'Error handling WebSocket connection', err);
    try {
      conn.close();
    } catch (closeErr) {
      log(0, 'Error closing WebSocket connection', closeErr);
    }
  }
});

// Perform a periodic check of connection statuses
setInterval(() => {
  const now = Date.now();
  const staleTimeout = 60000; // 1 minute
  
  wss.clients.forEach((client) => {
    const status = connectionStatus.get(client);
    if (status && status.lastActivity && now - status.lastActivity > staleTimeout) {
      try {
        log(2, 'Pinging inactive client', { clientId: client.clientId });
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messagePing);
        send(client, encoding.toUint8Array(encoder));
      } catch (err) {
        log(0, 'Error pinging inactive client', err);
      }
    }
  });
}, 30000);

// Handle server errors
server.on('error', (err) => {
  log(0, `HTTP server error on port ${PORT}`, err);
  
  // Try to restart on a different port if there's a conflict
  if (err.code === 'EADDRINUSE') {
    const newPort = PORT + 1;
    log(2, `Port ${PORT} in use, trying ${newPort}`);
    server.listen(newPort);
  }
});

// Start server
server.listen(PORT, () => {
  log(2, `Y.js WebSocket server running on port ${PORT}`);
  log(2, `Health check endpoint: http://localhost:${PORT}/health`);
});

// Handle process termination
process.on('SIGINT', () => {
  log(2, 'Received SIGINT signal. Shutting down gracefully...');
  wss.close(() => {
    log(2, 'WebSocket server closed');
    server.close(() => {
      log(2, 'HTTP server closed');
      process.exit(0);
    });
  });
});

process.on('SIGTERM', () => {
  log(2, 'Received SIGTERM signal. Shutting down gracefully...');
  wss.close(() => {
    log(2, 'WebSocket server closed');
    server.close(() => {
      log(2, 'HTTP server closed');
      process.exit(0);
    });
  });
});

// Export for testing or external use
module.exports = {
  server,
  wss,
  docs,
  awareness,
  rooms
};
