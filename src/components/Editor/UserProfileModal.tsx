import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../../context/CollaborationContext';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const colorOptions = [
  '#2563EB', // Blue
  '#16A34A', // Green
  '#DC2626', // Red
  '#D97706', // Amber
  '#7C3AED', // Purple
  '#DB2777', // Pink
  '#4B5563', // Gray
  '#0E7490', // Cyan
];

// Generate a persistent unique ID for this browser instance
const getUserId = () => {
  let userId = localStorage.getItem('user-id');
  if (!userId) {
    userId = `user-${uuidv4().substring(0, 8)}`;
    localStorage.setItem('user-id', userId);
  }
  return userId;
};

// Default user state
const defaultUser = {
  id: getUserId(),
  name: 'User',
  color: colorOptions[Math.floor(Math.random() * colorOptions.length)]
};

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { provider } = useCollaboration();
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('user-name') || defaultUser.name;
  });
  
  const [userColor, setUserColor] = useState(() => {
    return localStorage.getItem('user-color') || defaultUser.color;
  });

  // Update local state when awareness state changes
  useEffect(() => {
    if (!provider?.awareness) return;
    
    const localState = provider.awareness.getLocalState();
    if (localState?.user) {
      setUserName(localState.user.name);
      setUserColor(localState.user.color);
    } else {
      // Initialize awareness with stored values
      updateAwareness();
    }
  }, [provider?.awareness]);

  const updateAwareness = () => {
    if (!provider?.awareness) return;

    // Get the persistent user ID
    const userId = getUserId();

    // Update awareness state
    const currentState = provider.awareness.getLocalState() || {};
    
    provider.awareness.setLocalState({
      ...currentState,
      user: {
        id: userId,
        name: userName,
        color: userColor,
      },
    });

    console.log('Updated user awareness:', {
      id: userId,
      name: userName,
      color: userColor,
      clientId: provider.awareness.clientID
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage for persistence
    localStorage.setItem('user-name', userName);
    localStorage.setItem('user-color', userColor);
    
    updateAwareness();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Your Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              maxLength={30}
            />
          </div>

          <div className="mb-6">
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Choose a color
            </p>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setUserColor(color)}
                  className={`w-8 h-8 rounded-full ${
                    userColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="mr-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: userColor }}
              >
                {userName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">Preview</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;
