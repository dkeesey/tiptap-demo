/**
 * Test Railway WebSocket Server Connection
 * 
 * This script tests connectivity to the WebSocket server deployed on Railway.
 * It performs both HTTP health checks and direct WebSocket connection tests.
 * 
 * Usage:
 *   node test-railway-connection.js [optional-websocket-url]
 * 
 * If no URL is provided, it will test the default Railway deployment URL
 * from the .env.production file.
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Default URL (will be overridden by .env.production if found)
let DEFAULT_WEBSOCKET_URL = 'wss://websocket-server-production-b045.up.railway.app';

// Read environment variables from .env.production
try {
  const envPath = path.resolve(__dirname, '.env.production');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      if (line.trim() && !line.startsWith('#')) {
        const match = line.match(/^VITE_WEBSOCKET_PRIMARY_URL=(.+)$/);
        if (match) {
          DEFAULT_WEBSOCKET_URL = match[1];
          break;
        }
      }
    }
  }
} catch (error) {
  console.error('Error reading .env.production:', error.message);
}

// Get the WebSocket URL from command line args or use default
const websocketUrl = process.argv[2] || DEFAULT_WEBSOCKET_URL;

// Test parameters
const TEST_DURATION = 10000; // 10 seconds
const PING_INTERVAL = 1000;  // 1 second

// Terminal output colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// Create a random room name for this test
const testRoomName = `test-room-${Math.floor(Math.random() * 1000000)}`;

// Test results tracking
const testResults = {
  httpHealthCheck: null,
  websocketConnection: {
    connected: false,
    connectionTime: null,
    sentMessages: 0,
    receivedMessages: 0,
    errors: [],
    pingResults: []
  }
};

/**
 * Make an HTTP request
 * @param {string} url The URL to request
 * @returns {Promise<Object>} The response data
 */
function makeHttpRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 5000,
      headers: {
        'User-Agent': 'TipTap-Connection-Tester/1.0'
      }
    };

    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          // Return as text if not valid JSON
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    
    req.end();
  });
}

/**
 * Test the HTTP health endpoint
 */
async function testHealthEndpoint() {
  console.log(`\n${colors.bright}Testing HTTP health endpoint...${colors.reset}`);
  
  try {
    // Convert WebSocket URL to HTTP URL
    let healthUrl = websocketUrl.replace(/^wss:\/\//i, 'https://').replace(/^ws:\/\//i, 'http://');
    
    // Ensure we have the /health path
    if (!healthUrl.endsWith('/health')) {
      healthUrl = healthUrl.replace(/\/$/, '') + '/health';
    }
    
    console.log(`Requesting: ${healthUrl}`);
    
    const result = await makeHttpRequest(healthUrl);
    
    if (result.status >= 200 && result.status < 300) {
      console.log(`${colors.green}✓ Health check succeeded: ${result.status}${colors.reset}`);
      console.log('Response data:', result.data);
      
      testResults.httpHealthCheck = {
        success: true,
        status: result.status,
        data: result.data
      };
    } else {
      console.log(`${colors.red}✗ Health check failed: ${result.status}${colors.reset}`);
      console.log('Response data:', result.data);
      
      testResults.httpHealthCheck = {
        success: false,
        status: result.status,
        data: result.data
      };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Health check error: ${error.message}${colors.reset}`);
    
    testResults.httpHealthCheck = {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test direct WebSocket connection
 */
function testWebSocketConnection() {
  return new Promise((resolve) => {
    console.log(`\n${colors.bright}Testing WebSocket connection...${colors.reset}`);
    console.log(`URL: ${websocketUrl}`);
    console.log(`Room: ${testRoomName}`);
    
    // Add room name to the URL
    const connectionUrl = websocketUrl.includes('?') 
      ? `${websocketUrl}&room=${testRoomName}` 
      : `${websocketUrl}/${testRoomName}`;
    
    console.log(`Connection URL: ${connectionUrl}`);
    
    const startTime = Date.now();
    let ws = null;
    let pingInterval = null;
    let testTimeout = null;
    
    // Function to clean up resources
    const cleanup = () => {
      if (pingInterval) clearInterval(pingInterval);
      if (testTimeout) clearTimeout(testTimeout);
      
      if (ws) {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        } catch (err) {
          console.error('Error closing WebSocket:', err);
        }
      }
    };
    
    // Function to complete the test
    const completeTest = () => {
      cleanup();
      
      // Calculate average ping if we have any results
      if (testResults.websocketConnection.pingResults.length > 0) {
        const sum = testResults.websocketConnection.pingResults.reduce((a, b) => a + b, 0);
        testResults.websocketConnection.averagePing = 
          sum / testResults.websocketConnection.pingResults.length;
      }
      
      resolve();
    };
    
    // Set timeout to end test after duration
    testTimeout = setTimeout(() => {
      console.log(`\n${colors.yellow}Test duration reached (${TEST_DURATION / 1000}s)${colors.reset}`);
      completeTest();
    }, TEST_DURATION);
    
    try {
      // Create WebSocket connection
      ws = new WebSocket(connectionUrl);
      
      // Connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws && ws.readyState !== WebSocket.OPEN) {
          console.log(`${colors.red}✗ Connection timeout after 5 seconds${colors.reset}`);
          testResults.websocketConnection.errors.push('Connection timeout');
          
          if (ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
        }
      }, 5000);
      
      // WebSocket event handlers
      ws.on('open', () => {
        const connectTime = Date.now() - startTime;
        console.log(`${colors.green}✓ Connected in ${connectTime}ms${colors.reset}`);
        
        testResults.websocketConnection.connected = true;
        testResults.websocketConnection.connectionTime = connectTime;
        
        clearTimeout(connectionTimeout);
        
        // Start sending pings
        pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            const pingTime = Date.now();
            const pingData = JSON.stringify({ type: 'ping', time: pingTime });
            
            try {
              ws.send(pingData);
              testResults.websocketConnection.sentMessages++;
              console.log(`Ping sent: ${pingData}`);
            } catch (err) {
              console.error('Error sending ping:', err);
              testResults.websocketConnection.errors.push(`Send error: ${err.message}`);
            }
          }
        }, PING_INTERVAL);
      });
      
      ws.on('message', (data) => {
        testResults.websocketConnection.receivedMessages++;
        
        try {
          // Try to parse as JSON
          const parsedData = JSON.parse(data);
          
          if (parsedData.type === 'pong' && parsedData.time) {
            const pingTime = Date.now() - parsedData.time;
            testResults.websocketConnection.pingResults.push(pingTime);
            console.log(`${colors.green}← Pong received, latency: ${pingTime}ms${colors.reset}`);
          } else {
            console.log(`${colors.blue}← Message received: ${data}${colors.reset}`);
          }
        } catch (err) {
          // Not JSON or couldn't parse
          console.log(`${colors.blue}← Non-JSON message: ${data}${colors.reset}`);
        }
      });
      
      ws.on('error', (error) => {
        console.log(`${colors.red}✗ WebSocket error: ${error.message}${colors.reset}`);
        testResults.websocketConnection.errors.push(`WebSocket error: ${error.message}`);
      });
      
      ws.on('close', (code, reason) => {
        console.log(`${colors.yellow}WebSocket closed: ${code} ${reason}${colors.reset}`);
        
        if (code !== 1000) {
          // Not a normal closure
          testResults.websocketConnection.errors.push(`Abnormal closure: ${code} ${reason}`);
        }
      });
    } catch (error) {
      console.log(`${colors.red}✗ Failed to create WebSocket: ${error.message}${colors.reset}`);
      testResults.websocketConnection.errors.push(`Connection error: ${error.message}`);
      completeTest();
    }
  });
}

/**
 * Print the test results summary
 */
function printResults() {
  console.log(`\n${colors.bright}${colors.white}========== TEST RESULTS ===========${colors.reset}`);
  console.log(`\n${colors.bright}WebSocket URL:${colors.reset} ${websocketUrl}`);
  console.log(`${colors.bright}Test room:${colors.reset} ${testRoomName}`);
  
  // HTTP Health Results
  console.log(`\n${colors.bright}HTTP Health Check:${colors.reset}`);
  if (testResults.httpHealthCheck) {
    if (testResults.httpHealthCheck.success) {
      console.log(`${colors.green}✓ Success (${testResults.httpHealthCheck.status})${colors.reset}`);
    } else if (testResults.httpHealthCheck.status) {
      console.log(`${colors.red}✗ Failed (${testResults.httpHealthCheck.status})${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Error: ${testResults.httpHealthCheck.error}${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}? Not tested${colors.reset}`);
  }
  
  // WebSocket Connection Results
  console.log(`\n${colors.bright}WebSocket Connection:${colors.reset}`);
  if (testResults.websocketConnection.connected) {
    console.log(`${colors.green}✓ Connected${colors.reset} (in ${testResults.websocketConnection.connectionTime}ms)`);
  } else {
    console.log(`${colors.red}✗ Failed to connect${colors.reset}`);
  }
  
  console.log(`${colors.bright}Messages sent:${colors.reset} ${testResults.websocketConnection.sentMessages}`);
  console.log(`${colors.bright}Messages received:${colors.reset} ${testResults.websocketConnection.receivedMessages}`);
  
  if (testResults.websocketConnection.pingResults.length > 0) {
    console.log(`${colors.bright}Average ping:${colors.reset} ${Math.round(testResults.websocketConnection.averagePing)}ms`);
    console.log(`${colors.bright}Min ping:${colors.reset} ${Math.min(...testResults.websocketConnection.pingResults)}ms`);
    console.log(`${colors.bright}Max ping:${colors.reset} ${Math.max(...testResults.websocketConnection.pingResults)}ms`);
  }
  
  if (testResults.websocketConnection.errors.length > 0) {
    console.log(`\n${colors.bright}${colors.red}Errors:${colors.reset}`);
    testResults.websocketConnection.errors.forEach(error => {
      console.log(`- ${error}`);
    });
  }
  
  // Overall status
  console.log(`\n${colors.bright}Overall Status:${colors.reset}`);
  
  const healthOk = testResults.httpHealthCheck && testResults.httpHealthCheck.success;
  const wsOk = testResults.websocketConnection.connected && 
               testResults.websocketConnection.receivedMessages > 0;
  
  if (healthOk && wsOk) {
    console.log(`${colors.bgGreen}${colors.white} ✓ ALL TESTS PASSED ${colors.reset}`);
    console.log(`\nThe WebSocket server at ${websocketUrl} is functioning correctly.`);
  } else if (wsOk) {
    console.log(`${colors.bgYellow}${colors.white} ! WEBSOCKET OK, HEALTH CHECK FAILED ${colors.reset}`);
    console.log(`\nThe WebSocket connection works, but the HTTP health endpoint failed.`);
    console.log(`This may cause issues with some monitoring systems, but basic functionality should work.`);
  } else if (healthOk) {
    console.log(`${colors.bgRed}${colors.white} ✗ WEBSOCKET FAILED, HEALTH CHECK OK ${colors.reset}`);
    console.log(`\nThe HTTP health endpoint works, but WebSocket connections are failing.`);
    console.log(`This indicates a problem with the WebSocket server configuration.`);
  } else {
    console.log(`${colors.bgRed}${colors.white} ✗ ALL TESTS FAILED ${colors.reset}`);
    console.log(`\nBoth HTTP health check and WebSocket connection failed.`);
    console.log(`This indicates either the server is down or there are networking issues.`);
  }
  
  // Recommendations
  console.log(`\n${colors.bright}Recommendations:${colors.reset}`);
  
  if (!healthOk && !wsOk) {
    console.log(`1. Check if the Railway deployment is running`);
    console.log(`2. Verify the WebSocket URL is correct: ${websocketUrl}`);
    console.log(`3. Check Railway logs for errors`);
    console.log(`4. Try restarting the WebSocket server`);
  } else if (!wsOk) {
    console.log(`1. Check WebSocket server configuration`);
    console.log(`2. Verify proper CORS settings are in place`);
    console.log(`3. Check for any firewall or proxy issues`);
  } else if (!healthOk) {
    console.log(`1. Check health endpoint configuration in the WebSocket server`);
    console.log(`2. Ensure the server is properly exposing the /health route`);
  } else {
    console.log(`WebSocket server is working correctly. No action needed.`);
  }
  
  console.log(`\n${colors.white}====================================${colors.reset}\n`);
}

/**
 * Main function to run all tests
 */
async function runTests() {
  console.log(`\n${colors.bgBlue}${colors.white} WEBSOCKET SERVER CONNECTION TEST ${colors.reset}`);
  console.log(`\n${colors.bright}Target:${colors.reset} ${websocketUrl}`);
  console.log(`${colors.bright}Test duration:${colors.reset} ${TEST_DURATION / 1000} seconds`);
  
  // Test health endpoint first
  await testHealthEndpoint();
  
  // Then test WebSocket connection
  await testWebSocketConnection();
  
  // Print the results
  printResults();
  
  process.exit(0);
}

// Run the tests
runTests();
