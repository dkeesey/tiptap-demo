/**
 * Run diagnostic routines to identify connection issues
 * This is the runDiagnostics method for the EnhancedWebSocketService
 */
function runDiagnostics() {
  console.group('WebSocket Connection Diagnostics');
  console.log('%c Running comprehensive diagnostics...', 'background: #f06292; color: white; padding: 2px 6px; border-radius: 2px;');
  
  // Test network connectivity
  const networkConnectivity = navigator.onLine;
  console.log(`Network connectivity: ${networkConnectivity ? 'Online ✓' : 'Offline ✗'}`);
  
  // Current status
  console.log(`Current connection status: ${this.currentStatus}`);
  console.log(`Active provider: ${this.activeProvider || 'none'}`);
  
  // Check URLs 
  const primaryUrl = this.config.primaryUrl;
  console.log(`Primary WebSocket URL: ${primaryUrl || 'not configured'}`);

  // Test primary connection
  if (this.provider) {
    if (isWebsocketProvider(this.provider)) {
      console.log(`WebSocket connected: ${this.provider.wsconnected ? 'Yes ✓' : 'No ✗'}`);
      
      // Internal websocket object status
      // @ts-ignore - Access internal socket
      const ws = this.provider._ws;
      console.log('WebSocket readyState:', ws ? 
        ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][ws.readyState] : 'No websocket');
    } else if (isWebrtcProvider(this.provider)) {
      console.log(`WebRTC provider connected: ${this.isProviderConnected(this.provider) ? 'Yes ✓' : 'No ✗'}`);
      console.log('WebRTC peers:', Object.keys((this.provider).peers || {}).length);
    }
  } else {
    console.log('No primary provider configured ✗');
  }
  
  // Test fallback connection
  if (this.fallbackProvider) {
    console.log(`Fallback provider type: ${isWebsocketProvider(this.fallbackProvider) ? 'WebSocket' : 'WebRTC'}`);
    console.log(`Fallback connected: ${this.isProviderConnected(this.fallbackProvider) ? 'Yes ✓' : 'No ✗'}`);
  } else {
    console.log('No fallback provider configured');
  }
  
  // Check for common issues
  const issues = [];
  
  if (!networkConnectivity) {
    issues.push('Network appears to be offline. Check your internet connection.');
  }
  
  if (!this.provider && !this.fallbackProvider) {
    issues.push('No providers configured. Call createCollaborationProvider() first.');
  }
  
  if (this.provider && isWebsocketProvider(this.provider) && !this.provider.wsconnected) {
    // Check if URL looks valid
    if (!primaryUrl || !primaryUrl.startsWith('ws')) {
      issues.push(`Primary URL "${primaryUrl}" doesn't appear to be a valid WebSocket URL (should start with ws:// or wss://)`);
    }
    
    // Check for secure context issues
    if (window.location.protocol === 'https:' && primaryUrl && primaryUrl.startsWith('ws:')) {
      issues.push('Insecure WebSocket (ws://) cannot be used from secure context (https://). Use wss:// instead.');
    }
    
    // Check for recent errors
    if (this.lastError) {
      issues.push(`Last connection error: ${this.lastError.message}`);
    }
  }
  
  if (issues.length > 0) {
    console.log('%c Potential issues detected:', 'color: #f44336; font-weight: bold;');
    issues.forEach(issue => console.log(`- ${issue}`));
  } else {
    console.log('%c No obvious issues detected', 'color: #4caf50; font-weight: bold;');
  }
  
  // Record state of awareness
  if (this.provider) {
    const awareStates = this.provider.awareness.getStates();
    console.log(`Connected clients: ${awareStates.size}`);
  }
  
  // Recommended actions
  console.log('%c Recommended actions:', 'font-weight: bold;');
  
  if (!this.provider && !this.fallbackProvider) {
    console.log('- Initialize providers by calling createCollaborationProvider()');
  } else if (this.provider && !this.isProviderConnected(this.provider) && 
             (!this.fallbackProvider || !this.isProviderConnected(this.fallbackProvider))) {
    console.log('- Check server status (Railway deployment)');
    console.log('- Verify WebSocket server URL configuration');
    console.log('- Try with a new room name');
    console.log('- Check for firewalls or proxy issues');
  } else if (this.fallbackProvider && this.isProviderConnected(this.fallbackProvider) && 
             this.provider && !this.isProviderConnected(this.provider)) {
    console.log('- Primary WebSocket server may be down, but fallback is working');
    console.log('- Check Railway deployment status');
  }
  
  // Test ping
  console.log('Sending test ping...');
  this.pingConnection();
  
  console.groupEnd();
  
  return {
    status: this.currentStatus,
    activeProvider: this.activeProvider,
    primaryConnected: this.provider ? this.isProviderConnected(this.provider) : false,
    fallbackConnected: this.fallbackProvider ? this.isProviderConnected(this.fallbackProvider) : false,
    statistics: this.websocketStats,
    issues
  };
}

/**
 * Test HTTP health endpoint of WebSocket server
 * Returns a Promise that resolves with the health check result
 */
function testServerHealth(url) {
  // Extract base URL for health check
  let healthUrl = url;
  if (healthUrl.startsWith('ws')) {
    healthUrl = healthUrl.replace(/^ws/, 'http');
  }
  if (healthUrl.startsWith('wss')) {
    healthUrl = healthUrl.replace(/^wss/, 'https');
  }
  
  // Append health endpoint if not already present
  if (!healthUrl.endsWith('/health')) {
    healthUrl = healthUrl.replace(/\/$/, '') + '/health';
  }
  
  return fetch(healthUrl, { 
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    timeout: 5000
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Health check result:', data);
    return { success: true, data };
  })
  .catch(error => {
    console.error('Health check error:', error);
    return { success: false, error: error.message };
  });
}

// Export for use in EnhancedWebSocketService
export { runDiagnostics, testServerHealth };
