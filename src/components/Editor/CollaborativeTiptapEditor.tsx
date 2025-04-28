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
import { ConnectionDebugger } from '../Debug'

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
  const { ydoc, provider, isConnected, error } = useCollaboration()
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [isReady, setIsReady] = useState(false)
  const editorRef = useRef(null)
  
  // State for AI menu handling
  const [selectedText, setSelectedText] = useState<string>('')
  const [showAiMenu, setShowAiMenu] = useState<boolean>(false)
  const [menuPosition, setMenuPosition] = useState<{x: number, y: number}>({x: 0, y: 0})

  // Get XML fragment for the document
  const fragment = ydoc.getXmlFragment('document')

  // Determine if collaboration is active
  // Even when disconnected, we'll continue using the collaborative extensions
  // for better user experience (they'll sync when reconnection happens)
  const isCollaborationActive = provider !== null;

  // Silence all logging
  // console.log('[Editor Collaboration] Status:', isConnected ? 'connected' : 'disconnected', 'Active:', isCollaborationActive);
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
            user: provider?.awareness?.getLocalState()?.user || { 
              id: 'local',
              name: 'You',
              color: '#6B7280'
            },
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

  // Monitor selected text for AI menu
  useEffect(() => {
    if (editor) {
      const handleSelectionUpdate = () => {
        const { state } = editor;
        const { selection } = state;
        const { empty } = selection;
        
        if (!empty) {
          const text = editor.state.doc.textBetween(
            selection.from,
            selection.to,
            ' '
          );
          
          setSelectedText(text);
          setShowAiMenu(true);
          
          // Get the position for the menu based on selection
          const { view } = editor;
          const { from } = selection;
          const start = view.coordsAtPos(from);
          
          setMenuPosition({
            x: start.left,
            y: start.top
          });
        } else {
          setShowAiMenu(false);
          setSelectedText('');
        }
      };
      
      // Update on selection change
      editor.on('selectionUpdate', handleSelectionUpdate);
      
      return () => {
        editor.off('selectionUpdate', handleSelectionUpdate);
      };
    }
  }, [editor]);

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
    if (isConnected) {
      setStatusMessage('Connected')
    } else if (error) {
      setStatusMessage('Offline - Your changes are saved and will sync when reconnected')
    } else {
      setStatusMessage('Connecting to collaboration server...')
    }
  }, [isConnected, error])

  if (!editor) {
    return <div className="p-4 text-center text-gray-500">Loading editor...</div>
  }

  return (
    <div className="tiptap-editor" ref={editorRef}>
      <EditorToolbar editor={editor} />
      
      {/* Connection status indicator */}
      <div className={`connection-status px-4 py-1 text-xs ${
        isConnected ? 'bg-green-50 text-green-700' :
        error ? 'bg-red-50 text-red-700' :
        'bg-yellow-50 text-yellow-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' :
              error ? 'bg-red-500' :
              'bg-yellow-500'
            }`}></div>
            {statusMessage}
          </div>
          
          {/* Show user count */}
          {isConnected && provider?.awareness && (
            <div className="text-xs">
              {provider.awareness.getStates().size || 1} user{(provider.awareness.getStates().size || 1) !== 1 ? 's' : ''} connected
            </div>
          )}
        </div>
      </div>
      
      <EditorBubbleMenu editor={editor} />
      <EditorFloatingMenu editor={editor} />
      
      <EditorContent 
        editor={editor} 
        className="editor-content border-t border-gray-200 p-4"
      />
      
      {/* Info tip for slash commands */}
      <div className="text-xs text-gray-500 px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center">
        <svg className="w-4 h-4 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
        <span>Type <kbd className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-300 font-mono">/</kbd> to use slash commands for formatting</span>
      </div>
      
      {/* Connection debugger (only shown in development mode) */}
      {process.env.NODE_ENV === 'development' && <ConnectionDebugger />}
      
      {/* AI components */}
      {aiEnabled && isReady && (
        <>
          <AISidebar editor={editor} />
          {showAiMenu && selectedText && (
            <AIActionsMenu 
              editor={editor}
              selectedText={selectedText}
              onClose={() => setShowAiMenu(false)}
              position={menuPosition}
            />
          )}
        </>
      )}
    </div>
  )
}

export default CollaborativeTiptapEditor