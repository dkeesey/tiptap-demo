/**
 * WebSocket Connection Tester
 * 
 * A utility class to test WebSocket connections to a server
 * Supports detailed diagnostics and health checks
 */

/**
 * Test a WebSocket connection to a specified URL
 * 
 * @param url The WebSocket URL to test
 * @param options Configuration options for the test
 * @returns Promise with connection test results
 */
export async function testWebSocketConnection(
  url: string,
  options: {
    timeout?: number;
    pingInterval?: number;
    testDuration?: number;
    roomName?: string;
  } = {}
): Promise<WebSocketTestResult> {
  const {
    timeout = 5000,
    pingInterval = 1000,
    testDuration = 3000,
    roomName = 'connection-test-' + Math.floor(Math.random() * 100000)
  } = options;

  // Results object to track test metrics
  const results: WebSocketTestResult = {
    success: false,
    url,
    connectTime: -1,
    messagesSent: 0,
    messagesReceived: 0,
    pingLatencies: [],
    errors: [],
    connectionState: 'closed',
    httpHealthCheck: null
  };

  // Test HTTP health endpoint first if available
  try {
    const healthUrl = url.replace(/^wss?:\/\//, '');
    const protocol = url.startsWith('wss:') ? 'https://' : 'http://';
    const healthCheckUrl = `${protocol}${healthUrl}/health`;
    
    console.log(`Testing health endpoint: ${healthCheckUrl}`);
    
    const healthResponse = await fetch(healthCheckUrl, { 
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(timeout)
    });
    
    if (healthResponse.ok) {
      try {
        const healthData = await healthResponse.json();
        results.httpHealthCheck = {
          success: true,
          status: healthResponse.status,
          data: healthData
        };
      } catch (error) {
        results.httpHealthCheck = {
          success: true,
          status: healthResponse.status,
          data: await healthResponse.text()
        };
      }
    } else {
      results.httpHealthCheck = {
        success: false,
        status: healthResponse.status,
        data: null
      };
    }
  } catch (error) {
    // Health check error - but this is optional, so continue with WebSocket test
    console.warn('Health check error:', error);
    results.httpHealthCheck = {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }

  // Start WebSocket connection test
  return new Promise((resolve) => {
    const startTime = Date.now();
    let ws: WebSocket | null = null;
    let pingTimer: NodeJS.Timeout | null = null;
    let closeTimer: NodeJS.Timeout | null = null;
    
    // Function to clean up resources
    const cleanup = () => {
      if (pingTimer) clearInterval(pingTimer);
      if (closeTimer) clearTimeout(closeTimer);
      
      if (ws) {
        // Remove event listeners
        ws.onopen = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        
        // Close connection if still open
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }
    };
    
    // Function to complete the test
    const completeTest = () => {
      cleanup();
      
      // Calculate average latency if applicable
      if (results.pingLatencies.length > 0) {
        const sum = results.pingLatencies.reduce((a, b) => a + b, 0);
        results.averageLatency = sum / results.pingLatencies.length;
      }
      
      // Set success flag if we received any messages
      results.success = results.messagesReceived > 0;
      
      resolve(results);
    };
    
    // Set timeout to end test after specified duration
    closeTimer = setTimeout(() => {
      results.testDuration = Date.now() - startTime;
      completeTest();
    }, testDuration);
    
    // Create WebSocket connection
    try {
      // Include room name in URL or use as separate path
      const connectionUrl = url.includes('?') ? `${url}&room=${roomName}` : `${url}/${roomName}`;
      console.log(`Connecting to: ${connectionUrl}`);
      
      ws = new WebSocket(connectionUrl);
      
      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws && ws.readyState !== WebSocket.OPEN) {
          results.errors.push('Connection timeout');
          
          if (ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
        }
      }, timeout);
      
      // Event handlers
      ws.onopen = () => {
        results.connectTime = Date.now() - startTime;
        results.connectionState = 'open';
        console.log(`Connection established in ${results.connectTime}ms`);
        
        clearTimeout(connectionTimeout);
        
        // Start sending ping messages
        pingTimer = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            const pingTime = Date.now();
            const pingData = JSON.stringify({ type: 'ping', time: pingTime });
            
            ws.send(pingData);
            results.messagesSent++;
            console.log(`Ping sent: ${pingData}`);
          }
        }, pingInterval);
      };
      
      ws.onmessage = (event) => {
        results.messagesReceived++;
        
        try {
          // Try to parse message as JSON
          const data = JSON.parse(event.data);
          
          // If it's a pong response, calculate latency
          if (data.type === 'pong' && data.time) {
            const latency = Date.now() - data.time;
            results.pingLatencies.push(latency);
            console.log(`Received pong, latency: ${latency}ms`);
          } else {
            console.log(`Received message: ${event.data}`);
          }
        } catch (e) {
          // Not JSON or couldn't parse
          console.log(`Received non-JSON message: ${event.data}`);
        }
      };
      
      ws.onerror = (event) => {
        results.errors.push('WebSocket error');
        results.connectionState = 'error';
        console.error('WebSocket error:', event);
      };
      
      ws.onclose = (event) => {
        results.connectionState = 'closed';
        console.log(`Connection closed: ${event.code} ${event.reason}`);
        
        if (event.code !== 1000) {
          // Not a normal closure
          results.errors.push(`Abnormal closure: ${event.code} ${event.reason}`);
        }
      };
    } catch (error) {
      results.errors.push(error instanceof Error ? error.message : String(error));
      results.connectionState = 'failed';
      completeTest();
    }
  });
}

/**
 * Result of a WebSocket connection test
 */
export interface WebSocketTestResult {
  success: boolean;
  url: string;
  connectTime: number;
  messagesSent: number;
  messagesReceived: number;
  pingLatencies: number[];
  averageLatency?: number;
  errors: string[];
  connectionState: 'connecting' | 'open' | 'closing' | 'closed' | 'error' | 'failed';
  httpHealthCheck: {
    success: boolean;
    status: number;
    data: any;
    error?: string;
  } | null;
  testDuration?: number;
}

/**
 * Test multiple WebSocket servers in parallel
 * 
 * @param urls List of WebSocket URLs to test
 * @param options Test configuration options
 * @returns Promise with test results for each URL
 */
export async function testMultipleWebSocketServers(
  urls: string[],
  options?: {
    timeout?: number;
    pingInterval?: number;
    testDuration?: number;
    roomName?: string;
  }
): Promise<{[url: string]: WebSocketTestResult}> {
  const results: {[url: string]: WebSocketTestResult} = {};
  
  // Run tests in parallel
  const testPromises = urls.map(url => 
    testWebSocketConnection(url, options)
      .then(result => {
        results[url] = result;
        return result;
      })
  );
  
  await Promise.all(testPromises);
  return results;
}

/**
 * Determine the best WebSocket server from multiple options
 * 
 * @param testResults Test results for multiple servers
 * @returns The URL of the best performing server or null if none are working
 */
export function determineBestServer(
  testResults: {[url: string]: WebSocketTestResult}
): string | null {
  const workingServers = Object.entries(testResults)
    .filter(([_, result]) => result.success)
    .sort((a, b) => {
      const aResult = a[1];
      const bResult = b[1];
      
      // Prefer servers with lower latency
      if (aResult.averageLatency && bResult.averageLatency) {
        return aResult.averageLatency - bResult.averageLatency;
      }
      
      // If latency not available, prefer servers with faster connect time
      return aResult.connectTime - bResult.connectTime;
    });
  
  return workingServers.length > 0 ? workingServers[0][0] : null;
}
