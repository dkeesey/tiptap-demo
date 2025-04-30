#!/usr/bin/env node

/**
 * WebSocket Connection Tester
 * 
 * This script tests connectivity to both WebSocket servers (primary and fallback)
 * and provides detailed diagnostics to help troubleshoot connection issues.
 */

const WebSocket = require('ws');
const https = require('https');
const http = require('http');

// WebSocket servers to test
const SERVERS = [
  {
    name: 'Railway Primary',
    url: 'wss://websocket-server-production-b045.up.railway.app',
    httpHealthUrl: 'https://websocket-server-production-b045.up.railway.app/health'
  },
  {
    name: 'WebRTC Fallback',
    url: 'wss://y-webrtc-signal-backend.fly.dev',
    httpHealthUrl: 'https://y-webrtc-signal-backend.fly.dev/health'
  }
];

// Test parameters
const TEST_TIMEOUT = 10000; // 10 seconds
const CONNECTION_TIMEOUT = 5000; // 5 seconds
const TEST_ROOM = 'connection-test-' + Math.floor(Math.random() * 1000000);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Test HTTP endpoint
 */
async function testHttpEndpoint(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        status: 0,
        data: null,
        error: error.message,
        success: false
      });
    });

    req.setTimeout(CONNECTION_TIMEOUT, () => {
      req.abort();
      resolve({
        status: 0,
        data: null,
        error: 'Connection timeout',
        success: false
      });
    });
  });
}

/**
 * Test WebSocket connection
 */
async function testWebSocketConnection(url, room = TEST_ROOM) {
  return new Promise((resolve) => {
    // Append room name to URL if not already present
    const fullUrl = url.indexOf('?') > -1 ? url : `${url}/${room}`;
    
    console.log(`${colors.bright}Connecting to WebSocket${colors.reset}: ${fullUrl}`);
    
    const ws = new WebSocket(fullUrl);
    let messageReceived = false;
    let connected = false;
    
    const timeout = setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      resolve({
        connected,
        messageReceived,
        error: 'Connection timeout',
        success: connected && messageReceived
      });
    }, CONNECTION_TIMEOUT);
    
    ws.on('open', () => {
      connected = true;
      console.log(`${colors.green}✓ Connection established${colors.reset}`);
      
      // Send a test message (y-websocket expects binary data)
      try {
        const pingMessage = new Uint8Array([3]); // Message type 3 = ping
        ws.send(pingMessage);
        console.log(`${colors.blue}→ Sent ping message${colors.reset}`);
      } catch (err) {
        console.log(`${colors.red}× Error sending message:${colors.reset} ${err.message}`);
      }
    });
    
    ws.on('message', (data) => {
      messageReceived = true;
      console.log(`${colors.green}← Received message (${data.length} bytes)${colors.reset}`);
      clearTimeout(timeout);
      ws.close();
      resolve({
        connected,
        messageReceived,
        success: true
      });
    });
    
    ws.on('error', (error) => {
      console.log(`${colors.red}× WebSocket error:${colors.reset} ${error.message}`);
      clearTimeout(timeout);
      resolve({
        connected,
        messageReceived,
        error: error.message,
        success: false
      });
    });
    
    ws.on('close', (code, reason) => {
      console.log(`${colors.yellow}Connection closed:${colors.reset} ${code} ${reason}`);
      clearTimeout(timeout);
      if (!messageReceived) {
        resolve({
          connected,
          messageReceived,
          error: `Connection closed (${code})`,
          success: false
        });
      }
    });
  });
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`\n${colors.bright}${colors.cyan}=== WebSocket Connection Diagnostic ====${colors.reset}\n`);
  
  let hasFunctioningServer = false;
  
  for (const server of SERVERS) {
    console.log(`\n${colors.bright}${colors.magenta}Testing ${server.name}${colors.reset} (${server.url})`);
    console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}`);
    
    // Test HTTP health endpoint first
    if (server.httpHealthUrl) {
      console.log(`\n${colors.bright}Testing HTTP health endpoint${colors.reset}: ${server.httpHealthUrl}`);
      const httpResult = await testHttpEndpoint(server.httpHealthUrl);
      
      if (httpResult.success) {
        console.log(`${colors.green}✓ HTTP endpoint is healthy${colors.reset}`);
        try {
          const healthData = JSON.parse(httpResult.data);
          console.log('Health data:', healthData);
        } catch (e) {
          console.log('Response:', httpResult.data);
        }
      } else {
        console.log(`${colors.red}× HTTP endpoint check failed${colors.reset}: ${httpResult.error || `Status ${httpResult.status}`}`);
      }
    }
    
    // Test WebSocket connection
    console.log(`\n${colors.bright}Testing WebSocket connection${colors.reset}`);
    const wsResult = await testWebSocketConnection(server.url);
    
    if (wsResult.success) {
      console.log(`${colors.green}✓ WebSocket connection test passed${colors.reset}\n`);
      hasFunctioningServer = true;
    } else {
      console.log(`${colors.red}× WebSocket connection test failed${colors.reset}: ${wsResult.error || 'No message received'}\n`);
    }
  }
  
  // Final assessment
  console.log(`\n${colors.bright}${colors.cyan}=== Diagnosis Summary ====${colors.reset}\n`);
  
  if (hasFunctioningServer) {
    console.log(`${colors.green}✓ At least one WebSocket server is operational${colors.reset}`);
    console.log('Next steps:');
    console.log('1. Update your frontend environment variables to use the working server URL');
    console.log('2. Ensure your WebSocketService.ts is correctly configured');
    console.log('3. Add DEBUG_WEBSOCKET=true to your frontend environment to get detailed logs');
  } else {
    console.log(`${colors.red}× All WebSocket servers failed connection tests${colors.reset}`);
    console.log('Troubleshooting steps:');
    console.log('1. Check if your Railway WebSocket server is properly deployed and running');
    console.log('2. Verify network connectivity and any firewall/security settings');
    console.log('3. Ensure your WebSocket server is properly configured for y-websocket protocol');
    console.log('4. Try redeploying your WebSocket server');
  }
  
  console.log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
}

// Run the tests
runTests().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
