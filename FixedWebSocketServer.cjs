// FixedWebSocketServer.cjs
// Optimized WebSocket server for Y.js collaboration with fixed awareness handling

const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const map = require('lib0/map');

// Logging with log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1, 
  INFO: 2,
  DEBUG: 3
};

// Set default log level
const LOG_LEVEL = process.env.LOG_LEVEL ? 
  parseInt(process.env.LOG_LEVEL) : 
  (process.env.DEBUG ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO);

// Logging utility
function log(level, message, data) {
  if (level <= LOG_LEVEL) {
    const prefix = level === LOG_LEVELS.ERROR ? '[ERROR]' :
                  level === LOG_LEVELS.WARN ? '[WARN]' :
                  level === LOG_LEVELS.INFO ? '[INFO]' : '[DEBUG]';
    
    console.log(`${prefix} ${message}`);
    if (data && level <= LOG_LEVELS.DEBUG) {
      console.log(data);
    }
  }
}

function logError(message, err) {
  log(LOG_LEVELS.ERROR, message, err);
}

function logWarn(message, data) {
  log(LOG_LEVELS.WARN, message, data);
}

function logInfo(message, data) {
  log(LOG_LEVELS.INFO, message, data);
}

function logDebug(message, data) {
  log(LOG_LEVELS.DEBUG, message, data);
}

// Simple debounce
const debounce = (fn, time) => {
  let timeout = null;
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn(...args);
      timeout = null;
    }, time);
  };
};

// Use port from environment or default
const port = process.env.WS_PORT || process.env.PORT || 1236;

// Create HTTP server
const server = http.createServer((request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  response.end('Y.js WebSocket server running\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  clientTracking: true,
  perMessageDeflate: false,
  maxPayload: 50 * 1024 * 1024
});

// Messaging constants
const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;
const messagePing = 3;
const messagePong = 4;

// State management
const rooms = new Map();
const docs = new Map();
const awareness = new Map();
const connectionToRoom = new Map();
const connectionStatus = new Map();

// Safely send messages
function send(conn, message) {
  try {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(message);
      return true;
    }
  } catch (err) {
    logError('Error sending message', err);
    connectionStatus.set(conn, {
      ...connectionStatus.get(conn) || {},
      state: 'error',
      lastError: err.message,
      timestamp: Date.now()
    });
  }
  return false;
}

// Get or create Y.js document
const getYDoc = (docName) => {
  let doc = docs.get(docName);
  if (!doc) {
    logInfo(`Creating new doc: ${docName}`);
    
    try {
      doc = new Y.Doc();
      docs.set(docName, doc);
      
      // Create default document structure if needed
      doc.getXmlFragment('document');
      
      // Set up awareness with fixed broadcasting
      const awarenessState = new awarenessProtocol.Awareness(doc);
      awareness.set(docName, awarenessState);
      
      // Handle awareness updates properly
      awarenessState.on('update', ({ added, updated, removed }) => {
        const clients = rooms.get(docName) || new Set();
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageAwareness);
        encoding.writeVarUint8Array(
          encoder,
          awarenessProtocol.encodeAwarenessUpdate(awarenessState, [...added, ...updated, ...removed])
        );
        const message = encoding.toUint8Array(encoder);
        
        logDebug(`Broadcasting awareness update to ${clients.size} clients`);
        
        // Broadcast to all clients
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            send(client, message);
          }
        });
      });
      
      // Track document updates to ensure they're broadcast properly
      doc.on('update', (update, origin) => {
        if (origin !== 'remote') { // Only broadcast updates from local changes
          const clients = rooms.get(docName) || new Set();
          
          // Create update message
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messageSync);
          encoding.writeVarUint(encoder, 2); // update message
          encoding.writeVarUint8Array(encoder, update);
          const message = encoding.toUint8Array(encoder);
          
          // Broadcast to all clients except origin
          clients.forEach((client) => {
            if (client !== origin && client.readyState === WebSocket.OPEN) {
              send(client, message);
            }
          });
        }
      });
    } catch (err) {
      logError(`Error creating doc: ${docName}`, err);
      throw err;
    }
  }
  return doc;
};

// Broadcast document update
function broadcastDocumentUpdate(docName, conn, update) {
  const room = rooms.get(docName);
  if (room) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    encoding.writeVarUint(encoder, 2); // update message
    encoding.writeVarUint8Array(encoder, update);
    const message = encoding.toUint8Array(encoder);
    
    room.forEach((client) => {
      if (client !== conn && client.readyState === WebSocket.OPEN) {
        send(client, message);
      }
    });
  }
}

// Client disconnection handler
function handleDisconnect(conn) {
  try {
    const roomName = connectionToRoom.get(conn);
    if (roomName) {
      const room = rooms.get(roomName);
      if (room) {
        room.delete(conn);
        if (room.size === 0) {
          rooms.delete(roomName);
          logInfo(`Room ${roomName} is now empty`);
        }
      }
      connectionToRoom.delete(conn);
      
      // Clean up awareness
      const awarenessState = awareness.get(roomName);
      if (awarenessState) {
        awarenessProtocol.removeAwarenessStates(
          awarenessState, 
          [conn], 
          'connection closed'
        );
      }
      
      connectionStatus.delete(conn);
      logInfo('Client disconnected and cleanup complete');
    }
  } catch (err) {
    logError('Error during client disconnect', err);
  }
}

// WebSocket connection handler
wss.on('connection', (conn, req) => {
  const docName = req.url.slice(1).split('?')[0] || 'tiptap-demo-default-room';
  const clientIp = req.socket.remoteAddress;
  logInfo(`New client connecting from ${clientIp} to room: ${docName}`);

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
      logInfo(`Created new room: ${docName}`);
    }
    room.add(conn);
    connectionToRoom.set(conn, docName);

    // Get or create document and awareness
    const doc = getYDoc(docName);
    const awarenessState = awareness.get(docName);

    // Send initial sync
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    send(conn, encoding.toUint8Array(encoder));

    // Send current awareness state if any clients are already connected
    if (awarenessState.getStates().size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, messageAwareness);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(awarenessState, Array.from(awarenessState.getStates().keys()))
      );
      send(conn, encoding.toUint8Array(awarenessEncoder));
    }

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
          logInfo('Received non-binary message, ignoring');
          return;
        }

        const decoder = decoding.createDecoder(messageData);
        const encoder = encoding.createEncoder();
        const messageType = decoding.readVarUint(decoder);
        
        switch (messageType) {
          case messageSync: {
            const syncMessageType = decoding.readVarUint(decoder);
            
            switch (syncMessageType) {
              case 0: { // step 1
                syncProtocol.writeSyncStep2(encoder, doc);
                send(conn, encoding.toUint8Array(encoder));
                break;
              }
              case 1: { // step 2
                syncProtocol.readSyncStep2(decoder, doc);
                const encoder = encoding.createEncoder();
                encoding.writeVarUint(encoder, messageSync);
                syncProtocol.writeSyncStep1(encoder, doc);
                send(conn, encoding.toUint8Array(encoder));
                break;
              }
              case 2: { // update
                const update = decoding.readVarUint8Array(decoder);
                // Apply update to the document with origin set to the connection
                // This prevents the update from being broadcast back to the same client
                Y.applyUpdate(doc, update, conn);
                break;
              }
            }
            break;
          }
          case messageAwareness: {
            const awarenessUpdate = decoding.readVarUint8Array(decoder);
            awarenessProtocol.applyAwarenessUpdate(awarenessState, awarenessUpdate, conn);
            break;
          }
          case messagePing: {
            // Send pong response
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

    // Add ping interval
    const pingInterval = setInterval(() => {
      if (conn.readyState === WebSocket.OPEN) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messagePing);
        send(conn, encoding.toUint8Array(encoder));
      }
    }, 30000);

    conn.on('close', () => {
      clearInterval(pingInterval);
      handleDisconnect(conn);
    });

    conn.on('error', (err) => {
      logError('WebSocket connection error', err);
      connectionStatus.set(conn, {
        ...connectionStatus.get(conn) || {},
        state: 'error',
        lastError: err.message,
        timestamp: Date.now()
      });
    });

  } catch (err) {
    logError('Error handling WebSocket connection', err);
    try {
      conn.close();
    } catch (closeErr) {
      logError('Error closing WebSocket connection', closeErr);
    }
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception', err);
});

// Start server with error handling
server.on('error', (err) => {
  logError(`HTTP server error on port ${port}`, err);
  
  // Try to restart on a different port if there's a conflict
  if (err.code === 'EADDRINUSE') {
    const newPort = port + 1;
    logInfo(`Port ${port} in use, trying ${newPort}`);
    server.listen(newPort);
  }
});

server.listen(port, () => {
  logInfo(`Fixed Y.js WebSocket server running on port ${port}`);
});

module.exports = {
  server,
  wss,
  docs,
  awareness,
  rooms,
  LOG_LEVELS
}; 