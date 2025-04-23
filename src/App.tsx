import React, { useState, useEffect, Suspense } from 'react'
import { saveContent, loadContent, getDefaultContent } from './utils/storage'
import { CollaborationProvider } from './context/CollaborationContext'
import UserPresence from './components/Editor/UserPresence'

// Import styles for collaboration
import './styles/collaboration.css'

// Lazy load the TiptapEditor components
const TiptapEditor = React.lazy(() => import('./components/Editor/TiptapEditor'))
const CollaborativeTiptapEditor = React.lazy(() => import('./components/Editor/CollaborativeTiptapEditor'))

function App() {
  const [editorContent, setEditorContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCollaborationEnabled, setIsCollaborationEnabled] = useState(false)
  const [roomName, setRoomName] = useState('tiptap-demo-default-room')

  // Load content from localStorage on initial render
  useEffect(() => {
    const savedContent = loadContent()
    setEditorContent(savedContent || getDefaultContent())
    setIsLoading(false)
  }, [])

  // Save content to localStorage whenever it changes
  const handleEditorChange = (content: string) => {
    setEditorContent(content)
    saveContent(content)
  }

  // Generate a new room name for collaboration
  const generateNewRoom = () => {
    const newRoom = `tiptap-demo-room-${Math.floor(Math.random() * 1000)}`
    setRoomName(newRoom)
    return newRoom
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">TipTap Editor Demo</h1>
            <p className="text-sm text-gray-500">A demonstration of TipTap's capabilities for Wordware</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                if (confirm('Reset editor content to default?')) {
                  const defaultContent = getDefaultContent()
                  setEditorContent(defaultContent)
                  saveContent(defaultContent)
                }
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Reset Content
            </button>
            <a 
              href="https://github.com/deankeesey/tiptap-demo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Collaboration toggle */}
          <div className="mb-4 p-4 bg-white shadow-sm rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Collaboration Mode</h2>
              <p className="text-sm text-gray-500">
                {isCollaborationEnabled 
                  ? `Currently in collaborative mode. Share room name: ${roomName}` 
                  : 'Enable to collaborate with others in real-time'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isCollaborationEnabled && (
                <button 
                  onClick={() => {
                    const newRoom = generateNewRoom()
                    alert(`Created new room: ${newRoom}\nShare this room name with others to collaborate.`)
                  }}
                  className="px-3 py-1 text-sm bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  New Room
                </button>
              )}
              <label className="inline-flex items-center cursor-pointer">
                <span className="mr-3 text-sm font-medium text-gray-900">
                  {isCollaborationEnabled ? 'On' : 'Off'}
                </span>
                <input 
                  type="checkbox" 
                  checked={isCollaborationEnabled} 
                  onChange={(e) => setIsCollaborationEnabled(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <Suspense fallback={
              <div className="p-8 flex items-center justify-center">
                <div className="text-gray-500">Loading editor components...</div>
              </div>
            }>
              {isCollaborationEnabled ? (
                <CollaborationProvider roomName={roomName}>
                  <UserPresence />
                  <CollaborativeTiptapEditor onChange={handleEditorChange} />
                </CollaborationProvider>
              ) : (
                <TiptapEditor 
                  content={editorContent} 
                  onChange={handleEditorChange}
                />
              )}
            </Suspense>
          </div>
          
          {/* Feature Documentation */}
          <div className="mt-6 p-4 bg-white shadow-sm rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Features</h2>
            <div className="text-sm text-gray-700 space-y-4">
              <div>
                <h3 className="font-medium mb-1">Text Editing</h3>
                <p>Format text with bold, italic, headings, lists, and quotes.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Context Menus</h3>
                <p>Access formatting options via contextual bubble and floating menus.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Markdown Import/Export</h3>
                <p>Import and export content in Markdown format using the toolbar buttons.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Persistence</h3>
                <p>Content is automatically saved to localStorage as you type.</p>
              </div>
              {isCollaborationEnabled && (
                <div>
                  <h3 className="font-medium mb-1">Real-time Collaboration</h3>
                  <p>See other users' cursors and edits in real-time. Changes sync automatically when online.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* HTML Output Panel */}
          <div className="mt-6 p-4 bg-white shadow-sm rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-2">HTML Output</h2>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-40 border border-gray-200">
              {editorContent}
            </pre>
          </div>
          
          {/* Collaboration Info */}
          {isCollaborationEnabled && (
            <div className="mt-6 p-4 bg-white shadow-sm rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Collaboration Information</h2>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <span className="font-medium">Current Room:</span> {roomName}
                </p>
                <p>
                  <span className="font-medium">How to Collaborate:</span> Share this room name with others and have them enable collaboration mode with the same room name.
                </p>
                <p>
                  <span className="font-medium">Technology:</span> This collaborative editor uses Y.js for conflict-free real-time editing and WebSockets for communication.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Built with TipTap - The headless editor framework for web artisans
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
