// Simple WebSocket test script
// Run with: node websocket-test.js

const WebSocket = require('ws');

// Connect to your WebSocket server
const url = 'ws://localhost:1236/tiptap-demo-room-567';
console.log(`Connecting to ${url}...`);

const ws = new WebSocket(url);

// Connection opened
ws.on('open', function() {
  console.log('Connection established successfully!');
  
  // Send a test message
  const message = JSON.stringify({type: 'test', content: 'Hello WebSocket Server!'});
  ws.send(message);
  console.log(`Sent message: ${message}`);
  
  // Keep connection open for a few seconds then close
  setTimeout(() => {
    console.log('Test completed, closing connection');
    ws.close();
  }, 5000);
});

// Listen for messages
ws.on('message', function(data) {
  console.log('Message from server:', data);
});

// Error handling
ws.on('error', function(error) {
  console.error('WebSocket error:', error.message);
});

// Connection closed
ws.on('close', function(code, reason) {
  console.log(`Connection closed: ${code} - ${reason}`);
});

// Set timeout for entire test
setTimeout(() => {
  console.log('Test timed out, forcing exit');
  process.exit(1);
}, 10000);