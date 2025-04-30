// EnhancedWebSocketServer.cjs
// Improved WebSocket server for Y.js collaboration with better error handling and reconnection logic

const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const map = require('lib0/map');
const express = require('express');

// Improved logging with log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1, 
  INFO: 2,
  DEBUG: 3
};

// Set default log level (can be overridden via environment variable)
const LOG_LEVEL = process.env.LOG_LEVEL ? 
  parseInt(process.env.LOG_LEVEL) : 
  (process.env.DEBUG ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO);

// Better logging utility
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

// Enhanced debounce with configurable options
const debounce = {
  debounce: (fn, time, options = {}) => {
    let timeout = null;
    const { leading = false } = options;
    
    return (...args) => {
      if (timeout) {
        clearTimeout(timeout);
      } else if (leading) {
        fn(...args);
      }
      
      timeout = setTimeout(() => {
        fn(...args);
        timeout = null;
      }, time);
    };
  }
};

// Configurable port from environment or use default
const port = process.env.WS_PORT || process.env.PORT || 1236;

// HTTP handler with health endpoint
const httpHandler = (req, res) => {
  // Set CORS headers for all HTTP responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }
  
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      status: 'healthy',
      connections: wss.clients.size,
      rooms: Array.from(rooms.keys()),
      uptime: process.uptime(),
      timestamp: Date.now()
    }));
    return true;
  }
  
  return false;
};

// Create HTTP server
const server = http.createServer((req, res) => {
  if (!httpHandler(req, res)) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Y.js WebSocket server running\n');
  }
});

// Create WebSocket server with enhanced options
const wss = new WebSocket.Server({ 
  server,
  clientTracking: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 1 
    }
  },
  // Add ping interval for connection health checks
  pingInterval: 30000, // 30 seconds
  pingTimeout: 10000   // 10 seconds
});

// Messaging constants
const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;
const messagePing = 3;
const messagePong = 4;

// Room and document management
const rooms = new Map();
const connectionToRoom = new Map();
const docs = new Map();
const awareness = new Map();
const connectionStatus = new Map(); // Track connection health

// Helper to safely send messages with error handling
function send(conn, message) {
  try {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(message);
      return true;
    }
  } catch (err) {
    logError('Error sending message', err);
    
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

// Enhanced getYDoc with better error handling
const getYDoc = (docName) => {
  let doc = docs.get(docName);
  if (!doc) {
    logInfo(`Creating new doc: ${docName}`);
    
    try {
      doc = new Y.Doc();
      docs.set(docName, doc);
      
      // Set up awareness
      const awarenessState = new awarenessProtocol.Awareness(doc);
      awareness.set(docName, awarenessState);
      
      // Add error handling to awareness updates
      awarenessState.on('update', debounce.debounce((updates, origin) => {
        try {
          const clients = rooms.get(docName) || new Set();
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messageAwareness);
          encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awarenessState, updates));
          const message = encoding.toUint8Array(encoder);
          
          // Track how many clients received the update
          let successCount = 0;
          
          clients.forEach((client) => {
            if (client !== origin && client.readyState === WebSocket.OPEN) {
              if (send(client, message)) {
                successCount++;
              }
            }
          });
          
          logDebug(`Awareness update sent to ${successCount}/${clients.size} clients`);
        } catch (err) {
          logError('Error in awareness update', err);
        }
      }, 100, { leading: false }));
    } catch (err) {
      logError(`Error creating doc: ${docName}`, err);
      throw err; // Re-throw to allow proper handling
    }
  }
  return doc;
};

// Improved error handling
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception', err);
  // Attempt to cleanup and continue running instead of crashing
});

// Health check for connections
const checkConnections = debounce.debounce(() => {
  const now = Date.now();
  connectionStatus.forEach((status, conn) => {
    if (status.state === 'error' && now - status.timestamp > 30000) {
      try {
        // Try to reconnect or clean up
        if (conn.readyState === WebSocket.OPEN) {
          logInfo('Ping connection after previous error');
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messagePing);
          conn.send(encoding.toUint8Array(encoder));
        } else if (conn.readyState !== WebSocket.CONNECTING) {
          logInfo('Cleaning up broken connection');
          handleDisconnect(conn);
        }
      } catch (err) {
        logError('Error during connection cleanup', err);
      }
    }
  });
}, 30000, { leading: true });

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

    // Send initial sync message with error handling
    try {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeSyncStep1(encoder, doc);
      if (send(conn, encoding.toUint8Array(encoder))) {
        logDebug('Initial sync message sent successfully');
      }
    } catch (syncErr) {
      logError('Error sending initial sync message', syncErr);
    }

    // Enhanced message handler
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
        
        if (messageType === messageSync) {
          try {
            const syncMessageType = decoding.readVarUint(decoder);
            
            // Reduced logging for sync messages
            logDebug(`Received sync message of type: ${syncMessageType}`);

            // Defensive checks before processing
            if (decoder.arr.length - decoder.pos < 1) {
              logWarn('Sync message too short, ignoring');
              return;
            }

            // Process sync messages with added safety
            if (syncMessageType === 0) { // sync step 1
              syncProtocol.writeSyncStep2(encoder, doc);
              send(conn, encoding.toUint8Array(encoder));
            } else if (syncMessageType === 1) { // sync step 2
              try {
                syncProtocol.readSyncStep2(decoder, doc);
              } catch (step2Err) {
                logError('Error processing sync step 2', step2Err);
              }
            }
          } catch (syncErr) {
            logError('Error processing sync message', syncErr);
          }
        } else if (messageType === messagePing) {
          // Handle ping messages
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messagePong);
          send(conn, encoding.toUint8Array(encoder));
        }
      } catch (err) {
        logError('Error processing WebSocket message', err);
      }
    });

    // Add ping handler for connection health
    const pingInterval = setInterval(() => {
      try {
        if (conn.readyState === WebSocket.OPEN) {
          const status = connectionStatus.get(conn);
          const now = Date.now();
          
          // Only ping if no activity in the last minute
          if (status && (!status.lastActivity || now - status.lastActivity > 60000)) {
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messagePing);
            send(conn, encoding.toUint8Array(encoder));
            
            logDebug('Ping sent to maintain connection');
          }
        } else {
          clearInterval(pingInterval);
        }
      } catch (pingErr) {
        logError('Error sending ping', pingErr);
        clearInterval(pingInterval);
      }
    }, 30000);

    // Enhanced disconnect handler
    conn.on('close', () => {
      clearInterval(pingInterval);
      handleDisconnect(conn);
    });

    // Handle errors on connection
    conn.on('error', (err) => {
      logError('WebSocket connection error', err);
      connectionStatus.set(conn, {
        ...connectionStatus.get(conn) || {},
        state: 'error',
        lastError: err.message,
        timestamp: Date.now()
      });
    });

  } catch (connectionErr) {
    logError('Error handling WebSocket connection', connectionErr);
    try {
      conn.close();
    } catch (closeErr) {
      logError('Error closing WebSocket connection', closeErr);
    }
  }
});

// Start health check timer
setInterval(checkConnections, 30000);

// Start server with better error handling
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
  logInfo(`Y.js WebSocket server running on port ${port}`);
});

module.exports = {
  server,
  wss,
  docs,
  awareness,
  rooms,
  LOG_LEVELS
};
