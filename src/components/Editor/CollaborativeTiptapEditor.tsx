import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { getCollaborativeExtensions } from '../../extensions/tiptap-extensions-collaborative'
import EditorToolbar from '../Toolbar/EditorToolbar'
import EditorBubbleMenu from '../Menus/EditorBubbleMenu'
import EditorFloatingMenu from '../Menus/EditorFloatingMenu'
import AISidebar from '../AI/AISidebar'
import AIActionsMenu from '../AI/AIActionsMenu'
import { useCollaboration } from '../../context/CollaborationContext'
import { getYjsValue } from '@syncedstore/core'
import AiPromptNode from '../../extensions/AiPromptNode'

// CSS for collaboration cursors
import '../../styles/collaboration.css'

// Import extensions individually for fallback mode
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import SlashCommandExtension from '../../extensions/SlashCommandExtension'

interface CollaborativeTiptapEditorProps {
  onChange?: (content: string) => void
  aiEnabled?: boolean
}

const CollaborativeTiptapEditor = ({ onChange, aiEnabled = true }: CollaborativeTiptapEditorProps) => {
  console.log('[Editor Component] Rendering CollaborativeTiptapEditor...');
  const { ydoc, provider, currentUser, connectionStatus } = useCollaboration()
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [isReady, setIsReady] = useState(false)
  const editorRef = useRef(null)

  // Get XML fragment for the document
  const fragment = ydoc.getXmlFragment('document')

  // Determine if collaboration is active
  // Even when disconnected, we'll continue using the collaborative extensions
  // for better user experience (they'll sync when reconnection happens)
  const isCollaborationActive = provider !== null;

  // Silence all logging
  // console.log('[Editor Collaboration] Status:', connectionStatus, 'Active:', isCollaborationActive);
  // if (provider) {
  //   console.log('[Editor Collaboration] Provider connected to room:', provider.roomname);
  // }

  // Initialize editor with collaborative extensions
  const editor = useEditor({
    extensions: [
      // Only include collaborative extensions if provider is available
      ...(isCollaborationActive 
        ? getCollaborativeExtensions({
            ydoc,
            provider,
            user: currentUser,
          }) 
        : [
            // Fallback to basic extensions when collaboration is unavailable
            StarterKit.configure({ 
              blockquote: { 
                HTMLAttributes: {
                  class: 'border-l-4 border-gray-300 pl-4 italic',
                },
              } 
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight,
            Underline,
            Link.configure({ 
              openOnClick: false, 
              HTMLAttributes: { class: 'text-blue-500 underline' } 
            }),
            Image.configure({ inline: true, allowBase64: true }),
            Placeholder.configure({ 
              placeholder: 'Start typing or use "/" for commands...' 
            }),
            SlashCommandExtension,
          ]),
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
    onTransaction: () => {
      // Ensures the view exists
      if (editor?.view) {
        // The next tick is necessary for cursor positioning
        setTimeout(() => {
          editor.commands.focus()
        }, 0)
      }
    },
  })
  
  // Set editor as ready after a short delay to ensure all components are properly mounted
  useEffect(() => {
    if (editor) {
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [editor])

  // Debug logging - comment out to reduce console output
  // useEffect(() => {
  //   if (editor) {
  //     console.log('[Editor Debug] Editor initialized.');
  //     console.log('[Editor Debug] Can toggleBlockquote?:', editor.can().toggleBlockquote());
  //     console.log('[Editor Debug] Can toggleBold?:', editor.can().toggleBold()); // Compare with a working command
  //     console.log('[Editor Debug] Available extensions:', editor.extensionManager.extensions.map(ext => ext.name));
  //     console.log('[Editor Debug] Has blockquote extension?', 
  //       editor.extensionManager.extensions.some(ext => ext.name === 'blockquote'));
  //     // Log all available commands
  //     console.log('[Editor Debug] Available commands:', Object.keys(editor.commands));
  //   }
  // }, [editor]) // Run when editor instance changes

  // Update status message based on connection status
  useEffect(() => {
    switch (connectionStatus) {
      case 'connected':
        setStatusMessage('Connected')
        break
      case 'connecting':
        setStatusMessage('Connecting to collaboration server...')
        break
      case 'disconnected':
        // Use a more reliable message that won't flicker or change rapidly
        setStatusMessage('Offline - Your changes are saved and will sync when reconnected')
        break
    }
  }, [connectionStatus])

  if (!editor) {
    return <div className="p-4 text-center text-gray-500">Loading editor...</div>
  }

  return (
    <div className="tiptap-editor" ref={editorRef}>
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
      
      {/* AI components */}
      {aiEnabled && isReady && (
        <>
          <AISidebar editor={editor} />
          <AIActionsMenu editor={editor} />
        </>
      )}
    </div>
  )
}

export default CollaborativeTiptapEditor