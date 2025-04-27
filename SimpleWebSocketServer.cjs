// SimpleWebSocketServer.cjs
// Custom WebSocket server for Y.js collaboration

const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const map = require('lib0/map');

// Disable all logging in Y.js
if (Y.logging) {
  Y.logging.setLevel('error');
  // Further disable logging
  Y.logging.createLogger = () => ({
    print: () => {}, // No-op function
  });
}

// Disable lib0 logging
const lib0Logging = require('lib0/logging');
if (lib0Logging) {
  lib0Logging.createModuleLogger = () => ({
    print: () => {}, // No-op function
  });
}
// Create a simple debounce function since lib0 doesn't export debounce
const debounce = {
  debounce: (fn, time) => {
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
  }
};

const port = process.env.PORT || 1235;

// Create a simple HTTP server
const server = http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Y.js WebSocket server running\n');
});

// Create WebSocket server with more robust configuration
const wss = new WebSocket.Server({ 
  server,
  // Increase timeout to detect dead clients
  clientTracking: true,
  // Higher ping interval for better connection monitoring
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 1 // Faster, less CPU intensive compression
    }
  }
});

// Map from room name to set of connected clients
const rooms = new Map();
// Map from client connection to room name
const connectionToRoom = new Map();
// Map from room name to shared document
const docs = new Map();
// Map from room name to awareness instance
const awareness = new Map();

// Message types
const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;
const messageQueryAwareness = 3;

// Sync message subtypes
const messageSyncStep1 = 0;
const messageSyncStep2 = 1;
const messageUpdate = 2;

const getYDoc = (docName) => {
  let doc = docs.get(docName);
  if (!doc) {
    doc = new Y.Doc();
    docs.set(docName, doc);
    const awarenessState = new awarenessProtocol.Awareness(doc);
    awareness.set(docName, awarenessState);
    awarenessState.on('update', debounce.debounce((updates, origin) => {
      const clients = rooms.get(docName) || new Set();
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awarenessState, updates));
      const message = encoding.toUint8Array(encoder);
      
      clients.forEach((client) => {
        if (client !== origin && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }, 100));
  }
  return doc;
};

// Disable all verbose logging to reduce console flooding
const ENABLE_VERBOSE_LOGGING = false;

function log(...args) {
  // Completely disable all log messages
  // if (ENABLE_VERBOSE_LOGGING) {
  //   console.log(...args);
  // }
}

function logError(...args) {
  // Only log critical errors, not routine ones
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('Caught global exception') || 
       args[0].includes('Failed to'))) {
    console.error(...args);
  }
}

// Global error handler to prevent server crashes
process.on('uncaughtException', (err) => {
  logError('Caught global exception:', err.message);
  logError(err.stack);
});

// Handle WebSocket connections
wss.on('connection', (conn, req) => {
  try {
    const docName = req.url.slice(1).split('?')[0] || 'tiptap-demo-default-room';
    log('Client connected:', docName);
  
  // Get or create room
  let room = rooms.get(docName);
  if (!room) {
    room = new Set();
    rooms.set(docName, room);
  }
  room.add(conn);
  connectionToRoom.set(conn, docName);

  // Get or create the shared document
  const doc = getYDoc(docName);
  const awarenessState = awareness.get(docName);

  // Listen for WebSocket messages
  conn.on('message', (message) => {
    try {
      // Handle both buffer and string messages
      let messageData;
      if (message instanceof Buffer) {
        messageData = new Uint8Array(message);
      } else if (typeof message === 'string' && message.length > 0) {
        // For string messages (debug or custom messages)
        log('Received string message:', message);
        try {
        // Attempt to parse as JSON
        const jsonData = JSON.parse(message);
        log('Parsed JSON message:', jsonData);
          // Optional: Handle any custom JSON protocol here
          return;
        } catch (e) {
          log('Non-JSON string message, ignoring');
          return;
        }
      } else if (message instanceof ArrayBuffer) {
        // For arraybuffer
        messageData = new Uint8Array(message);
      } else {
        log('Empty or invalid message received, ignoring');
        return;
      }
      
      // Check if message is empty
      if (!messageData || messageData.length === 0) {
        log('Empty binary message received, ignoring');
        return;
      }
      
      const decoder = decoding.createDecoder(messageData);
      const encoder = encoding.createEncoder();
      
      // Safely get message type
      let messageType;
      try {
        messageType = decoding.readVarUint(decoder);
      } catch (err) {
        console.error('Error reading message type:', err.message);
        return;
      }
      
      if (messageType === messageSync) {
        // Use minimal logging to reduce console flooding
        log(`Received sync from client in room ${docName}`);
        try {
          // Add length checking before trying to read the array
          if (decoder.arr.length - decoder.pos < 1) {
            logError('Error: Message too short for sync update');
            return;
          }

          const syncMessageType = decoding.readVarUint(decoder);
          if (syncMessageType === messageSyncStep1) {
            // Step 1: Client wants to get state
            console.log('Received step 1 sync message');
            // Send the current state to the client
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageSync);
            syncProtocol.writeSyncStep2(encoder, doc);
            send(conn, encoding.toUint8Array(encoder));
            // Also send awareness state if needed
            const awarenessStates = awarenessProtocol.getAwarenessStates(
              awarenessState,
              Array.from(awarenessState.getStates().keys())
            );
            if (awarenessStates.size > 0) {
              const encoder = encoding.createEncoder();
              encoding.writeVarUint(encoder, messageAwareness);
              encoding.writeVarUint8Array(
                encoder,
                awarenessProtocol.encodeAwarenessUpdate(
                  awarenessState,
                  Array.from(awarenessState.getStates().keys())
                )
              );
              send(conn, encoding.toUint8Array(encoder));
            }
          } else if (syncMessageType === messageSyncStep2) {
            console.log('Received step 2 sync message');
            // Step 2: Server receives client state
            syncProtocol.readSyncStep2(decoder, encoder => {
              send(conn, encoding.toUint8Array(encoder));
            }, doc);
          } else if (syncMessageType === messageQueryAwareness) {
            console.log('Received query awareness message');
            // Response with current awareness states
            // ...
          } else if (syncMessageType === messageUpdate) {
            console.log('Received update message');
            // Document update from client
            syncProtocol.readUpdate(decoder, doc);
          }
        } catch (err) {
          logError('Error processing sync message:', err.message, err.stack);
        }
      } else if (messageType === messageAwareness) {
        log(`Received awareness update from client in room ${docName}`);
        try {
          // Add length checking before trying to read the array
          if (decoder.arr.length - decoder.pos < 1) {
          logError('Error: Message too short for awareness update');
          return;
          }
          
          const update = decoding.readVarUint8Array(decoder);
          if (!update || update.length === 0) {
            log('Empty awareness update received, ignoring');
            return;
          }
          
          awarenessProtocol.applyAwarenessUpdate(awarenessState, update, conn);
        } catch (err) {
          logError('Error processing awareness update:', err.message, err.stack);
        }
      } else {
        log(`Received unknown message type ${messageType} from client in room ${docName}`);
      }
    } catch (err) {
      logError('Error processing Y.js message:', err.message);
      // Don't terminate connection on error - Y.js protocol is complex and may recover
    }
  });

  // Send initial sync message
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  conn.send(encoding.toUint8Array(encoder));
  
  // Send current document updates to new client
  const syncEncoder = encoding.createEncoder();
  encoding.writeVarUint(syncEncoder, messageSync);
  syncProtocol.writeSyncStep1(syncEncoder, doc);
  conn.send(encoding.toUint8Array(syncEncoder));
  
  // Also send awareness states
  const awarenessStates = awarenessState.getStates();
  if (awarenessStates.size > 0) {
    console.log(`Sending ${awarenessStates.size} awareness states to new client`);
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    encoding.writeVarUint8Array(
      awarenessEncoder,
      awarenessProtocol.encodeAwarenessUpdate(awarenessState, Array.from(awarenessStates.keys()))
    );
    conn.send(encoding.toUint8Array(awarenessEncoder));
  }
  
  // Notify everyone about the new client
  console.log(`Notifying all clients in room ${docName} about new connection`);
  room.forEach((client) => {
    if (client !== conn && client.readyState === WebSocket.OPEN) {
      const syncEncoder = encoding.createEncoder();
      encoding.writeVarUint(syncEncoder, messageSync);
      syncProtocol.writeSyncStep1(syncEncoder, doc);
      client.send(encoding.toUint8Array(syncEncoder));
    }
  });

  // Handle client disconnect
  conn.on('close', () => {
    try {
      const docName = connectionToRoom.get(conn);
      if (docName) {
        const room = rooms.get(docName);
        if (room) {
          room.delete(conn);
          if (room.size === 0) {
            rooms.delete(docName);
          }
        }
        connectionToRoom.delete(conn);
        
        // Update awareness to remove disconnected client
        const awarenessState = awareness.get(docName);
        if (awarenessState) {
          // We need to clean up awareness state when a client disconnects
          awarenessProtocol.removeAwarenessStates(
            awarenessState,
            [conn],
            'connection closed'
          );
        }
      }
      console.log('Client disconnected from', docName);
    } catch (err) {
      logError('Error during client disconnect:', err.message);
    }
  });
  } catch (err) {
    logError('Error handling WebSocket connection:', err.message);
    try {
      conn.close();
    } catch (closeErr) {
      logError('Error closing WebSocket connection:', closeErr.message);
    }
  }
});

server.listen(port, () => {
  log(`Y.js WebSocket server running on port ${port} (http://localhost:${port})`);
});
