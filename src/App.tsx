import React, { useState, useEffect, Suspense } from 'react'
import { saveContent, loadContent, getDefaultContent } from './utils/storage'
import { CollaborationProvider } from './context/CollaborationContext'
import { AIProvider } from './context/AI/AIContext'
import UserPresence from './components/Editor/UserPresence'
import { DebugToggle } from './components/Debug'

// Import styles
import './styles/collaboration.css'
import './styles/ai-features.css'

// Lazy load the TiptapEditor components
const TiptapEditor = React.lazy(() => import('./components/Editor/TiptapEditor'))
const CollaborativeTiptapEditor = React.lazy(() => import('./components/Editor/CollaborativeTiptapEditor'))

// Define the websocket URL for the collaboration provider
const websocketUrl = 'ws://localhost:1236' // Updated to match the new port in SimpleWebSocketServer.cjs

function App() {
  const [editorContent, setEditorContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  // Preserve collaboration state between reloads
  const [isCollaborationEnabled, setIsCollaborationEnabled] = useState(() => {
    const saved = localStorage.getItem('isCollaborationEnabled');
    return saved ? JSON.parse(saved) : false;
  })
  const [roomName, setRoomName] = useState(() => {
    return localStorage.getItem('roomName') || 'tiptap-demo-default-room';
  })
  // Track if AI features are enabled
  const [isAIEnabled, setIsAIEnabled] = useState(() => {
    const saved = localStorage.getItem('isAIEnabled');
    return saved ? JSON.parse(saved) : true; // Default to enabled
  })

  // Save states when they change
  useEffect(() => {
    localStorage.setItem('isCollaborationEnabled', JSON.stringify(isCollaborationEnabled));
  }, [isCollaborationEnabled]);

  useEffect(() => {
    localStorage.setItem('roomName', roomName);
  }, [roomName]);
  
  useEffect(() => {
    localStorage.setItem('isAIEnabled', JSON.stringify(isAIEnabled));
  }, [isAIEnabled]);

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
    <AIProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Debug Toggle - only shown in development */}
        <DebugToggle />
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
            {/* Feature toggles */}
            <div className="mb-4 p-4 bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                {/* Collaboration toggle */}
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-gray-900">Collaboration Mode</h2>
                  <p className="text-sm text-gray-500">
                    {isCollaborationEnabled 
                      ? `Currently in collaborative mode. Room: ${roomName}` 
                      : 'Enable to collaborate with others in real-time'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
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
                
                {/* AI Features toggle */}
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-gray-900">AI Features</h2>
                  <p className="text-sm text-gray-500">
                    {isAIEnabled 
                      ? 'AI features are currently enabled' 
                      : 'Enable AI-powered features for advanced editing'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <span className="mr-3 text-sm font-medium text-gray-900">
                        {isAIEnabled ? 'On' : 'Off'}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={isAIEnabled} 
                        onChange={(e) => setIsAIEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <Suspense fallback={
                <div className="p-8 flex items-center justify-center">
                  <div className="text-gray-500">Loading editor components...</div>
                </div>
              }>
                {isCollaborationEnabled ? (
                  <CollaborationProvider roomName={roomName} websocketUrl={websocketUrl}>
                    <UserPresence />
                    <CollaborativeTiptapEditor 
                      onChange={handleEditorChange}
                      aiEnabled={isAIEnabled}
                    />
                  </CollaborationProvider>
                ) : (
                  <TiptapEditor 
                    content={editorContent} 
                    onChange={handleEditorChange}
                    aiEnabled={isAIEnabled}
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
                  <h3 className="font-medium mb-1">Slash Commands</h3>
                  <p>Type "/" to access a wide range of commands, including text formatting and AI prompts.</p>
                </div>
                {isAIEnabled && (
                  <div>
                    <h3 className="font-medium mb-1">AI Features</h3>
                    <p>Use AI to enhance your writing:</p>
                    <ul className="ml-4 list-disc">
                      <li>Create AI prompt blocks with slash commands (type /AI)</li>
                      <li>Transform selected text with context menu actions</li>
                      <li>Access the AI sidebar for more AI capabilities</li>
                      <li>Get inline AI suggestions with /complete command</li>
                    </ul>
                  </div>
                )}
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
            
            {/* AI Features Info */}
            {isAIEnabled && (
              <div className="mt-6 p-4 bg-white shadow-sm rounded-lg border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-2">AI Features Information</h2>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <span className="font-medium">How to Use AI:</span> The editor provides several ways to leverage AI assistance:
                  </p>
                  <ol className="list-decimal ml-5 space-y-2">
                    <li>Use slash commands by typing "/" and selecting an AI option</li>
                    <li>Select text to see AI transformation options in the context menu</li>
                    <li>Use the AI sidebar for more comprehensive AI interactions</li>
                    <li>Try the "/complete" command to get inline AI suggestions</li>
                  </ol>
                  <p className="mt-2">
                    <span className="font-medium">Simulated AI:</span> This demo uses simulated AI responses for demonstration purposes.
                    In a production environment, it would connect to real AI services like OpenAI or Anthropic.
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
    </AIProvider>
  )
}

export default App