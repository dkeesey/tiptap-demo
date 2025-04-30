import React, { useState, useMemo, useEffect } from 'react'
import { UserIcon } from 'lucide-react'
import { useRailwayCollaboration } from '../../context/RailwayCollaborationContext'
import UserProfileModal from './UserProfileModal'

// Helper to get initials from name
const getInitials = (name: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Get persistent user ID
const getUserId = () => {
  return localStorage.getItem('user-id') || 'local';
};

// Default user for when not connected
const defaultUser = {
  id: getUserId(),
  name: localStorage.getItem('user-name') || 'User',
  color: localStorage.getItem('user-color') || '#6B7280'
}

const UserPresence: React.FC = () => {
  const { provider, connectionStatus } = useRailwayCollaboration()
  const isConnected = connectionStatus === 'connected'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [otherUsers, setOtherUsers] = useState<any[]>([])
  
  // Get current user from awareness state
  const currentUser = useMemo(() => {
    if (!provider?.awareness) return defaultUser;
    const localState = provider.awareness.getLocalState();
    return localState?.user || defaultUser;
  }, [provider?.awareness]);
  
  // Update connected users when awareness changes
  useEffect(() => {
    if (!provider?.awareness) return;
    
    // Function to update the other users state
    const updateUsers = () => {
      try {
        // Get all awareness states with their client IDs
        const states = Array.from(provider.awareness.getStates().entries());
        const localClientID = provider.awareness.clientID;
        const currentUserId = getUserId();
        
        console.log('User Presence - All awareness states:', states.map(([id, state]) => ({
          clientID: id,
          userID: state.user?.id,
          name: state.user?.name,
          isCurrent: id === localClientID
        })));
        
        console.log('User Presence - Local client ID:', localClientID);
        console.log('User Presence - Current user ID:', currentUserId);
        
        // Filter out the current user by client ID, not user ID
        // This ensures we show all distinct connections
        const updatedUsers = states
          .filter(([clientID, _state]) => {
            // Only exclude the current client connection
            return clientID !== localClientID;
          })
          .map(([clientID, state]) => ({
            ...(state.user || { name: 'Unknown', color: '#ccc' }),
            clientID,
            uniqueKey: `${clientID}`
          }));
        
        console.log('User Presence - Filtered users for display:', updatedUsers);
        setOtherUsers(updatedUsers);
      } catch (error) {
        console.error('Error updating user list:', error);
      }
    };
    
    // Initial update
    updateUsers();
    
    // Add awareness update event listener
    provider.awareness.on('update', updateUsers);
    
    // Cleanup
    return () => {
      provider.awareness.off('update', updateUsers);
    };
  }, [provider?.awareness]);
  
  // Ensure user data is set in awareness
  useEffect(() => {
    if (!provider?.awareness) return;
    
    const updateAwareness = () => {
      const currentState = provider.awareness.getLocalState() || {};
      const userId = getUserId();
      
      // Always ensure our user data is up to date
      provider.awareness.setLocalState({
        ...currentState,
        user: {
          id: userId,
          name: localStorage.getItem('user-name') || 'User',
          color: localStorage.getItem('user-color') || '#6B7280'
        }
      });
      
      console.log('Initial user awareness updated:', {
        id: userId,
        name: localStorage.getItem('user-name'),
        color: localStorage.getItem('user-color')
      });
    };
    
    updateAwareness();
    
    // Also set up an interval to keep awareness fresh
    const intervalId = setInterval(updateAwareness, 5000);
    
    return () => clearInterval(intervalId);
  }, [provider?.awareness]);
  
  return (
    <div className="connected-users flex items-center">
      {/* Current user profile button */}
      <button
        onClick={() => setIsProfileModalOpen(true)}
        className="flex items-center text-xs text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 mr-3"
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2"
          style={{ backgroundColor: currentUser.color }}
        >
          {getInitials(currentUser.name)}
        </div>
        <span className="mr-1">You</span>
        <UserIcon className="w-3 h-3" />
      </button>
      
      {/* Connected users */}
      {isConnected ? (
        otherUsers.length > 0 ? (
          <div className="flex items-center">
            <div className="text-xs text-gray-500 mr-2">
              {otherUsers.length} {otherUsers.length === 1 ? 'user' : 'users'} connected
          </div>
          <div className="flex -space-x-2 overflow-hidden">
              {otherUsers.map((user) => (
              <div
                  key={user.uniqueKey}
                  className="user-avatar w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                ) : (
                  getInitials(user.name)
                )}
              </div>
            ))}
          </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">No other users connected</div>
        )
      ) : (
        <div className="text-xs text-gray-500">Disconnected</div>
      )}
      
      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  )
}

export default UserPresence
