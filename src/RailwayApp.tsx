import { useState } from 'react'
import { RailwayCollaborationProvider } from './context/RailwayCollaborationContext'
import RailwayCollaborativeTiptapEditor from './components/RailwayCollaborativeTiptapEditor'

// Generate a room ID for the current session if none is provided
const generateRoomId = () => {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 8);
  return `tiptap-${timestamp}-${randomString}`;
};

// Get room ID from URL or use default
const getRoomFromUrl = () => {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.get('room') || 'default-room';
  } catch (e) {
    return 'default-room';
  }
};

function RailwayApp() {
  const [roomName, setRoomName] = useState<string>(getRoomFromUrl());
  const [editorContent, setEditorContent] = useState<string>('');
  const [showCreateRoom, setShowCreateRoom] = useState<boolean>(false);
  const [newRoomName, setNewRoomName] = useState<string>('');

  // Function to handle room changes
  const handleRoomChange = (room: string) => {
    // Update URL to include room parameter
    const url = new URL(window.location.href);
    url.searchParams.set('room', room);
    window.history.pushState({}, '', url.toString());
    
    // Update state
    setRoomName(room);
  };

  // Function to create a new room
  const createNewRoom = () => {
    if (newRoomName.trim()) {
      // Custom room name provided
      handleRoomChange(newRoomName.trim());
    } else {
      // Generate random room ID
      const randomRoom = generateRoomId();
      handleRoomChange(randomRoom);
    }
    
    // Reset state
    setNewRoomName('');
    setShowCreateRoom(false);
  };

  // Function to join an existing room
  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      handleRoomChange(newRoomName.trim());
      setNewRoomName('');
      setShowCreateRoom(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">TipTap Collaborative Editor</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Room: <span className="font-medium">{roomName}</span>
            </div>
            <button
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showCreateRoom ? 'Cancel' : 'Change Room'}
            </button>
          </div>
        </div>
      </header>

      {/* Room creation/join UI */}
      {showCreateRoom && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-white shadow-md rounded-md mt-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:space-x-4">
            <div className="mb-4 sm:mb-0 flex-1">
              <h2 className="text-lg font-medium mb-2">Join Existing Room</h2>
              <form onSubmit={joinRoom} className="flex">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  type="submit"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Join
                </button>
              </form>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium mb-2">Create New Room</h2>
              <div className="flex">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name (optional)"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  onClick={createNewRoom}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6">
          <RailwayCollaborationProvider room={roomName}>
            <RailwayCollaborativeTiptapEditor 
              onChange={setEditorContent}
              aiEnabled
              room={roomName}
            />
          </RailwayCollaborationProvider>
        </div>

        {/* Show content length */}
        <div className="mt-4 text-sm text-gray-500 text-right">
          Content length: {editorContent.length} characters
        </div>
        
        {/* Share link */}
        <div className="mt-4 p-4 bg-blue-50 rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Share this link to collaborate:</h3>
          <div className="flex">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}${window.location.pathname}?room=${roomName}`}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?room=${roomName}`);
                alert('Link copied to clipboard!');
              }}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Copy Link
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            TipTap Collaborative Editor deployed on Railway
          </p>
        </div>
      </footer>
    </div>
  )
}

export default RailwayApp
