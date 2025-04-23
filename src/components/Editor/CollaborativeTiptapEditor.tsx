import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { getCollaborativeExtensions } from '../../extensions/tiptap-extensions-collaborative'
import EditorToolbar from '../Toolbar/EditorToolbar'
import EditorBubbleMenu from '../Menus/EditorBubbleMenu'
import EditorFloatingMenu from '../Menus/EditorFloatingMenu'
import { useCollaboration } from '../../context/CollaborationContext'
import { getYjsValue } from '@syncedstore/core'
import AiPromptNode from '../../extensions/AiPromptNode'

// CSS for collaboration cursors
import '../../styles/collaboration.css'

interface CollaborativeTiptapEditorProps {
  onChange?: (content: string) => void
}

const CollaborativeTiptapEditor = ({ onChange }: CollaborativeTiptapEditorProps) => {
  const { ydoc, provider, currentUser, connectionStatus } = useCollaboration()
  const [statusMessage, setStatusMessage] = useState<string>('')

  // Get XML fragment for the document
  const fragment = ydoc.getXmlFragment('document')

  // Initialize editor with collaborative extensions
  const editor = useEditor({
    extensions: [
      ...getCollaborativeExtensions({ 
        ydoc, 
        provider, 
        user: currentUser,
        fragment
      }),
      AiPromptNode,
    ],
    // Use a more explicit approach to avoid initialization issues
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      // Call onChange callback if provided
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
  })

  // Update status message based on connection status
  useEffect(() => {
    switch (connectionStatus) {
      case 'connected':
        setStatusMessage('Connected')
        break
      case 'connecting':
        setStatusMessage('Connecting...')
        break
      case 'disconnected':
        setStatusMessage('Offline - Changes will sync when reconnected')
        break
    }
  }, [connectionStatus])

  if (!editor) {
    return <div className="p-4 text-center text-gray-500">Loading editor...</div>
  }

  return (
    <div className="tiptap-editor">
      <EditorToolbar editor={editor} />
      
      {/* Connection status indicator */}
      <div className={`connection-status px-4 py-1 text-xs ${
        connectionStatus === 'connected' ? 'bg-green-50 text-green-700' :
        connectionStatus === 'connecting' ? 'bg-yellow-50 text-yellow-700' :
        'bg-red-50 text-red-700'
      }`}>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></div>
          {statusMessage}
        </div>
      </div>
      
      <EditorBubbleMenu editor={editor} />
      <EditorFloatingMenu editor={editor} />
      
      <EditorContent 
        editor={editor} 
        className="editor-content border-t border-gray-200 p-4"
      />
    </div>
  )
}

export default CollaborativeTiptapEditor
