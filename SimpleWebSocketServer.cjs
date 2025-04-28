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

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

const port = process.env.PORT || 1236;

// Create a simple HTTP server
const server = http.createServer((request, response) => {
  // Add CORS headers to allow requests from any origin
  response.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  response.end('Y.js WebSocket server running\n');
});

// Create WebSocket server with ping
const wss = new WebSocket.Server({ 
  server,
  clientTracking: true,
  perMessageDeflate: false, // Disable compression for better stability
  maxPayload: 50 * 1024 * 1024 // 50 MB max message size
});

// Messaging constants
const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;
const messagePing = 3;
const messagePong = 4;

// Room and document management
const rooms = new Map();
const docs = new Map();
const awareness = new Map();
const connectionToRoom = new Map();
const connectionToClientId = new Map();

// Helper to safely send messages
function send(conn, message) {
  try {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(message);
      return true;
    }
  } catch (err) {
    logError('Error sending message', err);
  }
  return false;
}

// Get or create a shared document for a room
const getYDoc = (docName, conn) => {
  let doc = docs.get(docName);
  if (!doc) {
    doc = new Y.Doc();
    docs.set(docName, doc);
    log(`Created new document for room: ${docName}`);
    
    // Set up awareness
    const awarenessState = new awarenessProtocol.Awareness(doc);
    awareness.set(docName, awarenessState);
    
    // Handle awareness updates
    awarenessState.on('update', ({ added, updated, removed }, origin) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(encoder, 
        awarenessProtocol.encodeAwarenessUpdate(awarenessState, added.concat(updated).concat(removed))
      );
      const message = encoding.toUint8Array(encoder);
      
      const room = rooms.get(docName);
      if (room) {
        room.forEach((client) => {
          if (client !== origin && client.readyState === WebSocket.OPEN) {
            send(client, message);
          }
        });
      }
    });
  }
  return doc;
};

// Broadcast document update to all clients in a room
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

// Clean up client connection
function cleanupClientConnection(conn) {
  try {
    const roomName = connectionToRoom.get(conn);
    if (roomName) {
      const room = rooms.get(roomName);
      if (room) {
        room.delete(conn);
        if (room.size === 0) {
          rooms.delete(roomName);
          log(`Room ${roomName} is empty, cleaning up`);
        }
      }
      
      const clientId = connectionToClientId.get(conn);
      if (clientId) {
        const awarenessState = awareness.get(roomName);
        if (awarenessState) {
          awarenessProtocol.removeAwarenessStates(awarenessState, [clientId], 'connection closed');
        }
        connectionToClientId.delete(conn);
      }
      
      connectionToRoom.delete(conn);
      log(`Client disconnected from room: ${roomName}`);
    }
  } catch (err) {
    logError('Error during cleanup', err);
  }
}

// WebSocket connection handler
wss.on('connection', (conn, req) => {
  const docName = req.url.slice(1).split('?')[0] || 'tiptap-demo-default-room';
  log(`New client connecting to room: ${docName}`);
  
  // Set up ping interval
  const pingInterval = setInterval(() => {
    if (conn.readyState === WebSocket.OPEN) {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messagePing);
      send(conn, encoding.toUint8Array(encoder));
    }
  }, 30000);

  try {
    // Initialize room if needed
    let room = rooms.get(docName);
    if (!room) {
      room = new Set();
      rooms.set(docName, room);
    }
    room.add(conn);
    connectionToRoom.set(conn, docName);

    // Get or create document and awareness
    const doc = getYDoc(docName, conn);
    const awarenessState = awareness.get(docName);

    // Generate unique client ID
    const clientId = Math.floor(Math.random() * 1000000);
    connectionToClientId.set(conn, clientId);
    log(`Assigned client ID ${clientId} for room ${docName}`);

    // Send initial sync
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    send(conn, encoding.toUint8Array(encoder));

    // Send current awareness state
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
        const decoder = decoding.createDecoder(new Uint8Array(message));
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case messageSync: {
            const syncMessageType = decoding.readVarUint(decoder);
            
            switch (syncMessageType) {
              case 0: { // step 1
                const encoder = encoding.createEncoder();
                encoding.writeVarUint(encoder, messageSync);
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
                Y.applyUpdate(doc, update);
                broadcastDocumentUpdate(docName, conn, update);
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
          case messagePong: {
            // Handle pong if needed
            break;
          }
        }
      } catch (err) {
        logError('Error processing message', err);
      }
    });

    conn.on('close', () => {
      clearInterval(pingInterval);
      cleanupClientConnection(conn);
    });

    conn.on('error', (err) => {
      logError('WebSocket error', err);
      clearInterval(pingInterval);
      cleanupClientConnection(conn);
    });

  } catch (err) {
    logError('Error handling connection', err);
    clearInterval(pingInterval);
    cleanupClientConnection(conn);
  }
});

// Handle server errors
server.on('error', (err) => {
  logError('Server error', err);
});

// Start server
server.listen(port, () => {
  log(`Y.js WebSocket server running on port ${port}`);
});
