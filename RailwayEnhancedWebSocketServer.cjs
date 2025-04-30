// RailwayEnhancedWebSocketServer.cjs
// Optimized Y.js WebSocket server for Railway deployment

const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const map = require('lib0/map');
const express = require('express');

// Enhanced logging with log levels and environment configuration
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1, 
  INFO: 2,
  DEBUG: 3
};

// Set log level from environment or use default
const LOG_LEVEL = process.env.LOG_LEVEL ? 
  parseInt(process.env.LOG_LEVEL) : 
  (process.env.DEBUG ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO);

// Determine deployment environment
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const IS_RAILWAY = process.env.RAILWAY_ENVIRONMENT ? true : false;

// Better logging utility with environment context
function log(level, message, data) {
  if (level <= LOG_LEVEL) {
    const prefix = level === LOG_LEVELS.ERROR ? '[ERROR]' :
                  level === LOG_LEVELS.WARN ? '[WARN]' :
                  level === LOG_LEVELS.INFO ? '[INFO]' : '[DEBUG]';
    
    const timestamp = new Date().toISOString();
    const envTag = IS_RAILWAY ? '[RAILWAY]' : '[LOCAL]';
    
    console.log(`${timestamp} ${prefix} ${envTag} ${message}`);
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

// Configurable port handling for Railway deployment
// Railway assigns a PORT env var automatically
const port = process.env.PORT || 1236;

// Create Express app for enhanced routing and middleware
const app = express();

// Add CORS middleware (important for cross-domain requests)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  next();
});

// Enhanced health check endpoint with detailed metrics
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    connections: wss ? wss.clients.size : 0,
    rooms: Array.from(rooms.keys()),
    uptime: process.uptime(),
    environment: IS_RAILWAY ? 'railway' : 'local',
    timestamp: Date.now(),
    version: '1.2.0',
    metrics: {
      memoryUsage: process.memoryUsage(),
      roomCount: rooms.size,
      clientCount: wss ? wss.clients.size : 0,
      documentCount: docs.size
    },
    deploymentInfo: {
      railway: IS_RAILWAY,
      project: process.env.RAILWAY_PROJECT_NAME || 'unknown',
      service: process.env.RAILWAY_SERVICE_NAME || 'unknown',
      environment: process.env.RAILWAY_ENVIRONMENT || 'unknown'
    }
  });
});

// Root route with basic server info
app.get('/', (req, res) => {
  res.send('Y.js WebSocket server running on Railway');
});

// Create HTTP server with Express app
const server = http.createServer(app);

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

// Add server statistics
const serverStats = {
  startTime: Date.now(),
  totalConnections: 0,
  messagesSent: 0,
  messagesReceived: 0,
  errors: 0,
  reconnections: 0
};

// Helper to safely send messages with error handling
function send(conn, message) {
  try {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(message);
      serverStats.messagesSent++;
      return true;
    }
  } catch (err) {
    logError('Error sending message', err);
    serverStats.errors++;
    
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
          serverStats.errors++;
        }
      }, 100, { leading: false }));
    } catch (err) {
      logError(`Error creating doc: ${docName}`, err);
      serverStats.errors++;
      throw err; // Re-throw to allow proper handling
    }
  }
  return doc;
};

// Improved error handling
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception', err);
  serverStats.errors++;
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
          serverStats.reconnections++;
        } else if (conn.readyState !== WebSocket.CONNECTING) {
          logInfo('Cleaning up broken connection');
          handleDisconnect(conn);
        }
      } catch (err) {
        logError('Error during connection cleanup', err);
        serverStats.errors++;
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
    serverStats.errors++;
  }
}

// WebSocket connection handler
wss.on('connection', (conn, req) => {
  // Extract room name from URL (default to a named room if none provided)
  // Support both /roomName and ?roomName=xyz formats
  let docName;
  const url = new URL(req.url, 'http://localhost');
  
  if (url.pathname.length > 1) {
    // Format: /roomName
    docName = url.pathname.slice(1);
  } else if (url.searchParams.has('roomName')) {
    // Format: /?roomName=xyz
    docName = url.searchParams.get('roomName');
  } else {
    // Default room
    docName = 'tiptap-demo-default-room';
  }
  
  const clientIp = req.headers['x-forwarded-for'] || 
                   req.socket.remoteAddress;
  
  // Update server stats
  serverStats.totalConnections++;
  
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
      serverStats.errors++;
    }

    // Enhanced message handler
    conn.on('message', (message) => {
      try {
        // Update stats
        serverStats.messagesReceived++;
        
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
                serverStats.errors++;
              }
            }
          } catch (syncErr) {
            logError('Error processing sync message', syncErr);
            serverStats.errors++;
          }
        } else if (messageType === messagePing) {
          // Handle ping messages
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messagePong);
          send(conn, encoding.toUint8Array(encoder));
        }
      } catch (err) {
        logError('Error processing WebSocket message', err);
        serverStats.errors++;
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
        serverStats.errors++;
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
      serverStats.errors++;
      connectionStatus.set(conn, {
        ...connectionStatus.get(conn) || {},
        state: 'error',
        lastError: err.message,
        timestamp: Date.now()
      });
    });

  } catch (connectionErr) {
    logError('Error handling WebSocket connection', connectionErr);
    serverStats.errors++;
    try {
      conn.close();
    } catch (closeErr) {
      logError('Error closing WebSocket connection', closeErr);
    }
  }
});

// Start health check timer
setInterval(checkConnections, 30000);

// Add periodic stats logging for Railway monitoring
setInterval(() => {
  if (IS_RAILWAY) {
    const uptime = Math.floor((Date.now() - serverStats.startTime) / 1000);
    logInfo(`Server stats: ${wss.clients.size} clients, ${rooms.size} rooms, ${uptime}s uptime`, {
      clientCount: wss.clients.size,
      roomCount: rooms.size,
      docCount: docs.size,
      messagesSent: serverStats.messagesSent,
      messagesReceived: serverStats.messagesReceived,
      errors: serverStats.errors,
      totalConnections: serverStats.totalConnections
    });
  }
}, 60000);

// Start server with better error handling
server.on('error', (err) => {
  logError(`HTTP server error on port ${port}`, err);
  serverStats.errors++;
  
  // Try to restart on a different port if there's a conflict
  if (err.code === 'EADDRINUSE') {
    const newPort = port + 1;
    logInfo(`Port ${port} in use, trying ${newPort}`);
    server.listen(newPort);
  }
});

server.listen(port, () => {
  logInfo(`Y.js WebSocket server running on port ${port}, environment: ${ENVIRONMENT}`);
  if (IS_RAILWAY) {
    logInfo('Running on Railway', {
      project: process.env.RAILWAY_PROJECT_NAME,
      service: process.env.RAILWAY_SERVICE_NAME,
      environment: process.env.RAILWAY_ENVIRONMENT
    });
  }
});

module.exports = {
  server,
  wss,
  docs,
  awareness,
  rooms,
  LOG_LEVELS,
  serverStats
};
