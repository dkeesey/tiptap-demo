import React, { useState, useEffect } from 'react'
import { User } from '@syncedstore/core'
import { useCollaboration } from '../../context/CollaborationContext'

// Utility to generate consistent avatar colors based on user ID
const generateUserColor = (userId: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 
    'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'
  ]
  const hash = userId.split('').reduce((acc, char) => 
    char.charCodeAt(0) + ((acc << 5) - acc), 0)
  return colors[Math.abs(hash) % colors.length]
}

// Small user avatar component
const UserAvatar: React.FC<{ user: User, size?: 'small' | 'medium' }> = ({ 
  user, 
  size = 'small' 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6 text-xs',
    medium: 'w-8 h-8 text-sm'
  }

  return (
    <div 
      className={`
        ${generateUserColor(user.id)} 
        ${sizeClasses[size]} 
        text-white rounded-full flex items-center justify-center 
        font-bold uppercase tracking-wider shadow-sm
      `}
    >
      {user.name ? user.name.charAt(0) : '?'}
    </div>
  )
}

// Collaborative User List Component
const CollaboratorsList: React.FC = () => {
  const { currentUser, connectedUsers } = useCollaboration()
  const [collaborators, setCollaborators] = useState<User[]>([])
  
  // Extract connected users from the Map
  useEffect(() => {
    const users = Array.from(connectedUsers.values())
    // Filter out the current user (showing them separately)
    const otherUsers = users.filter(user => user.id !== currentUser.id)
    setCollaborators(otherUsers)
  }, [connectedUsers, currentUser])

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 z-50">
      <h3 className="text-sm font-semibold mb-2">Connected Collaborators</h3>
      <div className="flex flex-wrap gap-3">
        {currentUser && (
          <div className="flex flex-col items-center">
            <UserAvatar user={currentUser} size="medium" />
            <span className="text-xs mt-1">You</span>
          </div>
        )}
        {collaborators.map((user) => (
          <div key={user.id} className="flex flex-col items-center">
            <UserAvatar user={user} size="medium" />
            <span className="text-xs mt-1">{user.name}</span>
          </div>
        ))}
      </div>
      {collaborators.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">No other users connected</p>
      )}
    </div>
  )
}

// Cursor Indicator for Multiple Users
const CursorIndicator: React.FC<{ user: User }> = ({ user }) => {
  const color = generateUserColor(user.id)
  
  return (
    <div 
      className={`
        absolute pointer-events-none z-50 
        ${color} 
        bg-opacity-20 rounded-full 
        w-2 h-2 animate-pulse
      `}
      title={user.name || 'Anonymous User'}
    />
  )
}

// Enhanced Collaborative Indicators for TipTap Editor
const CollaborativeIndicators: React.FC = () => {
  const { connectedUsers, connectionStatus, currentUser } = useCollaboration()
  const [showCollaborators, setShowCollaborators] = useState(false)
  
  // Always show the component when connected, even if only one user is present
  // This gives better user feedback about connection status
  useEffect(() => {
    if (connectionStatus === 'connected') {
      setShowCollaborators(true)
    } else {
      // Hide after a delay to prevent flickering during reconnection attempts
      const timer = setTimeout(() => {
        setShowCollaborators(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [connectionStatus])

  if (!showCollaborators) {
    return null
  }

  return (
    <>
      <CollaboratorsList />
      {/* Note: Actual cursor positioning is handled by TipTap's CollaborationCursor extension */}
    </>
  )
}

export { 
  UserAvatar, 
  CollaboratorsList, 
  CursorIndicator, 
  CollaborativeIndicators,
  generateUserColor 
}