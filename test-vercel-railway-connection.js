const https = require('https');
const WebSocket = require('ws');

// URLs to test
const RAILWAY_WS_URL = 'wss://websocket-server-production-b045.up.railway.app';
const VERCEL_FRONTEND_URL = 'https://tiptap-demo.vercel.app'; // Update this with your actual Vercel URL

// Test HTTP connectivity to the Railway WebSocket server
function testHttpConnectivity(url) {
  return new Promise((resolve, reject) => {
    console.log(`Testing HTTP connectivity to ${url}...`);
    
    https.get(url.replace('wss://', 'https://'), (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Headers: ${JSON.stringify(res.headers)}`);
        console.log(`  Response: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', (err) => {
      console.error(`  Error: ${err.message}`);
      reject(err);
    });
  });
}

// Test WebSocket connectivity
function testWsConnectivity(url) {
  return new Promise((resolve, reject) => {
    console.log(`Testing WebSocket connectivity to ${url}...`);
    
    const ws = new WebSocket(url, {
      headers: {
        'Origin': VERCEL_FRONTEND_URL
      }
    });
    
    // Set a timeout for connection
    const timeout = setTimeout(() => {
      ws.terminate();
      console.error('  Connection timed out after 5 seconds');
      reject(new Error('Connection timeout'));
    }, 5000);
    
    ws.on('open', () => {
      clearTimeout(timeout);
      console.log('  WebSocket connection established successfully!');
      
      // Send a ping message
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        console.log('  Ping message sent');
      }
      
      // Close after a short delay
      setTimeout(() => {
        ws.close();
        resolve(true);
      }, 1000);
    });
    
    ws.on('message', (data) => {
      console.log(`  Received message: ${data}`);
    });
    
    ws.on('error', (err) => {
      clearTimeout(timeout);
      console.error(`  WebSocket Error: ${err.message}`);
      reject(err);
    });
    
    ws.on('close', (code, reason) => {
      console.log(`  WebSocket connection closed with code ${code}${reason ? ': ' + reason : ''}`);
    });
  });
}

// Test if the Vercel frontend can load
function testVercelFrontend() {
  return new Promise((resolve, reject) => {
    console.log(`Testing Vercel frontend at ${VERCEL_FRONTEND_URL}...`);
    
    https.get(VERCEL_FRONTEND_URL, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Response size: ${data.length} bytes`);
        
        // Check if the response contains WebSocket URL references
        const hasWsReference = data.includes(RAILWAY_WS_URL.replace('wss://', '')) || 
                               data.includes('websocket-server-production');
        
        console.log(`  Contains WebSocket references: ${hasWsReference}`);
        
        resolve({
          status: res.statusCode,
          size: data.length,
          hasWsReference: hasWsReference
        });
      });
    }).on('error', (err) => {
      console.error(`  Error: ${err.message}`);
      reject(err);
    });
  });
}

// Run all tests
async function runTests() {
  console.log('=== VERCEL-RAILWAY CONNECTION TEST ===');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('');
  
  try {
    // Test 1: HTTP connectivity to Railway WebSocket server
    await testHttpConnectivity(RAILWAY_WS_URL);
    console.log('');
    
    // Test 2: WebSocket connectivity to Railway server
    await testWsConnectivity(RAILWAY_WS_URL);
    console.log('');
    
    // Test 3: Vercel frontend load
    await testVercelFrontend();
    console.log('');
    
    console.log('All tests completed! If everything passed, the connection should be working.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Open the Vercel frontend in your browser');
    console.log('2. Open browser developer tools (F12) and go to the Console tab');
    console.log('3. Check for any WebSocket connection errors or successful connections');
    
  } catch (err) {
    console.error('Test suite failed:', err.message);
  }
}

runTests(); 