import React, { useState, useEffect, Suspense } from 'react'
import { saveContent, loadContent, getDefaultContent } from './utils/storage'

// Lazy load the TiptapEditor component
const TiptapEditor = React.lazy(() => import('./components/Editor/TiptapEditor'))

function App() {
  const [editorContent, setEditorContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

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
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <Suspense fallback={
              <div className="p-8 flex items-center justify-center">
                <div className="text-gray-500">Loading editor components...</div>
              </div>
            }>
              <TiptapEditor 
                content={editorContent} 
                onChange={handleEditorChange}
              />
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
            </div>
          </div>
          
          {/* HTML Output Panel */}
          <div className="mt-6 p-4 bg-white shadow-sm rounded-lg border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-2">HTML Output</h2>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-40 border border-gray-200">
              {editorContent}
            </pre>
          </div>
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
