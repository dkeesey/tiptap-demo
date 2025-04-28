import React, { useState, useMemo } from 'react'
import { UserIcon } from 'lucide-react'
import { useCollaboration } from '../../context/CollaborationContext'
import UserProfileModal from './UserProfileModal'

// Helper to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Default user for when not connected
const defaultUser = {
  id: 'local',
  name: 'You',
  color: '#6B7280'
}

const UserPresence: React.FC = () => {
  const { provider, isConnected } = useCollaboration()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  
  // Get connected users from awareness state
  const users = useMemo(() => {
    if (!provider?.awareness) return [];
    
    // Get all awareness states with their client IDs
    const states = Array.from(provider.awareness.getStates().entries());
    const localClientID = provider.awareness.clientID;
    
    console.log('All awareness states:', states.map(([id, state]) => ({
      clientID: id,
      userID: state.user?.id,
      name: state.user?.name
    })));
    
    console.log('Local client ID:', localClientID);
    
    // Filter by client ID (not user ID) to ensure all connections are shown
    const otherUsers = states
      .filter(([clientID, state]) => {
        // Only filter out the current client connection and entries without user data
        return clientID !== localClientID && Boolean(state.user);
      })
      .map(([_, state]) => state.user);
    
    console.log('Filtered users for display:', otherUsers);
    return otherUsers;
  }, [provider?.awareness]);

  // Get current user from awareness state
  const currentUser = useMemo(() => {
    if (!provider?.awareness) return defaultUser;
    const localState = provider.awareness.getLocalState();
    return localState?.user || defaultUser;
  }, [provider?.awareness]);
  
  return (
    <div className="connected-users">
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
        users.length > 0 ? (
          <>
            <div className="text-xs text-gray-500 flex items-center mr-2">
              {users.length} {users.length === 1 ? 'user' : 'users'} connected
            </div>
            <div className="flex -space-x-2 overflow-hidden">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="user-avatar"
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
          </>
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
