const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:1236/tiptap-demo-default-room');

ws.on('open', function open() {
  console.log('Connection opened successfully!');
  
  // Send a test message
  ws.send('TEST_PING');
  
  // Close after 2 seconds
  setTimeout(() => {
    ws.close();
    console.log('Test completed successfully.');
    process.exit(0);
  }, 2000);
});

ws.on('message', function incoming(data) {
  console.log('Received:', data);
});

ws.on('error', function error(err) {
  console.error('Error:', err.message);
  process.exit(1);
});

// Set timeout
setTimeout(() => {
  console.error('Connection timed out!');
  process.exit(1);
}, 5000);
