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

// Enhanced error logging function
function logError(message, err) {
  console.error(`[ERROR] ${message}`, err ? err.message : '');
  if (err && err.stack) {
    console.error(err.stack);
  }
}

// Create a simple debounce function
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

const port = process.env.PORT || 1236; // Changed from 1235 to avoid port conflict

// Create a simple HTTP server
const server = http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Y.js WebSocket server running\n');
});

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  clientTracking: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 1 
    }
  }
});

// Messaging constants
const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;

// Room and document management
const rooms = new Map();
const connectionToRoom = new Map();
const docs = new Map();
const awareness = new Map();

// Helper to safely send messages
function send(conn, message) {
  try {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(message);
    }
  } catch (err) {
    logError('Error sending message', err);
  }
}

// Get or create a shared document for a room
const getYDoc = (docName) => {
  let doc = docs.get(docName);
  if (!doc) {
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
        
        clients.forEach((client) => {
          if (client !== origin && client.readyState === WebSocket.OPEN) {
            send(client, message);
          }
        });
      } catch (err) {
        logError('Error in awareness update', err);
      }
    }, 100));
  }
  return doc;
};

// Global error handler
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception', err);
});

// WebSocket connection handler
wss.on('connection', (conn, req) => {
  const docName = req.url.slice(1).split('?')[0] || 'tiptap-demo-default-room';
  console.log(`New client connecting to room: ${docName}`);

  try {
    // Manage room and connection
    let room = rooms.get(docName);
    if (!room) {
      room = new Set();
      rooms.set(docName, room);
    }
    room.add(conn);
    connectionToRoom.set(conn, docName);

    // Get or create document and awareness
    const doc = getYDoc(docName);
    const awarenessState = awareness.get(docName);

    // Safely send initial sync message
    try {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeSyncStep1(encoder, doc);
      conn.send(encoding.toUint8Array(encoder));
    } catch (syncErr) {
      logError('Error sending initial sync message', syncErr);
    }

    // Message handler with robust error handling
    conn.on('message', (message) => {
      try {
        // Normalize message to Uint8Array
        const messageData = message instanceof Buffer 
          ? new Uint8Array(message) 
          : message instanceof ArrayBuffer 
            ? new Uint8Array(message) 
            : null;

        if (!messageData) {
          console.log('Received non-binary message, ignoring');
          return;
        }

        const decoder = decoding.createDecoder(messageData);
        const encoder = encoding.createEncoder();

        const messageType = decoding.readVarUint(decoder);

        if (messageType === messageSync) {
          try {
            const syncMessageType = decoding.readVarUint(decoder);
            
            // Detailed logging for sync messages
            console.log(`Received sync message of type: ${syncMessageType}`);

            // Defensive checks before processing
            if (decoder.arr.length - decoder.pos < 1) {
              console.warn('Sync message too short, ignoring');
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
        }
      } catch (err) {
        logError('Error processing WebSocket message', err);
      }
    });

    // Disconnect handler
    conn.on('close', () => {
      try {
        const roomName = connectionToRoom.get(conn);
        if (roomName) {
          const room = rooms.get(roomName);
          if (room) {
            room.delete(conn);
            if (room.size === 0) {
              rooms.delete(roomName);
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
        }
        console.log('Client disconnected');
      } catch (err) {
        logError('Error during client disconnect', err);
      }
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

server.listen(port, () => {
  console.log(`Y.js WebSocket server running on port ${port}`);
});
