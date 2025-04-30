// Script to test collaborative features in tiptap-demo
// Run this in the browser console to help diagnose collaboration issues

(function testCollaborativeSync() {
  // Execute this function in multiple browser windows to verify collaboration
  
  console.log('📝 Testing Collaborative Sync');
  console.log('============================');
  
  // 1. Check if RailwayCollaborationContext is active
  const ctxInfo = window.__railwayCollabDebug__ || {};
  const ctx = document.querySelector('[data-railway-collab]')?.__railwayCollab__;
  
  if (!ctx) {
    console.error('❌ RailwayCollaborationContext not found. Make sure you switched to the Railway context provider.');
    return;
  }
  
  // 2. Get awareness information from the provider
  const provider = ctx.provider;
  const ydoc = ctx.ydoc;
  const clientId = provider?.awareness?.clientID;
  const currentUser = provider?.awareness?.getLocalState()?.user;
  
  console.log('🔌 WebSocket Connection Info:', {
    url: ctx.connectionDetails?.url,
    room: ctx.connectionDetails?.room,
    status: ctx.connectionStatus,
    clientId,
    currentUser
  });
  
  // 3. List all connected users from awareness
  const awarenessStates = provider?.awareness?.getStates();
  
  if (awarenessStates) {
    console.log('👥 Connected Users (from Awareness):');
    
    Array.from(awarenessStates.entries()).forEach(([clientId, state]) => {
      const user = state.user;
      const isCurrentUser = clientId === provider.awareness.clientID;
      
      console.log(`${isCurrentUser ? '👤 (You)' : '👤'} Client ID: ${clientId}`, {
        userId: user?.id,
        name: user?.name,
        color: user?.color
      });
    });
  } else {
    console.error('❌ No awareness states available');
  }
  
  // 4. Check Y.js document status
  console.log('📄 Y.js Document Status:', {
    isEmpty: ydoc.isEmpty,
    xml: ydoc.getXmlFragment('document').length > 0 
      ? 'Has content' 
      : 'Empty',
    clientID: ydoc.clientID
  });
  
  // 5. Create a global window object for debugging
  window.__railwayCollabDebug__ = {
    provider,
    ydoc,
    clientId,
    currentUser,
    connectionDetails: ctx.connectionDetails,
    status: ctx.connectionStatus,
    awarenessStates: awarenessStates ? Array.from(awarenessStates.entries()) : [],
    manualSync: () => {
      if (provider?.awareness) {
        // Force a sync of awareness
        console.log('🔄 Manually forcing sync...');
        
        // Update our local state to trigger sync
        const currentState = provider.awareness.getLocalState() || {};
        provider.awareness.setLocalState({
          ...currentState,
          timestamp: Date.now() // add timestamp to force update
        });
        
        ctx.forceSync();
        
        console.log('✅ Sync requested, check network tab for activity');
        return true;
      }
      return false;
    }
  };
  
  console.log('🔧 Debug object created. Access it via window.__railwayCollabDebug__');
  console.log('🔄 To force a sync manually, run: window.__railwayCollabDebug__.manualSync()');
  
  return window.__railwayCollabDebug__;
})(); 