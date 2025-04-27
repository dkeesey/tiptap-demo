import { useEditor, EditorContent } from '@tiptap/react'
import { getMinimalExtensions } from '../../extensions/tiptap-extensions-minimal'
import EditorToolbar from '../Toolbar/EditorToolbar'
import EditorBubbleMenu from '../Menus/EditorBubbleMenu'
import EditorFloatingMenu from '../Menus/EditorFloatingMenu'
import AISidebar from '../AI/AISidebar'
import AIActionsMenu from '../AI/AIActionsMenu'
import { useRef, useState, useEffect } from 'react'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  aiEnabled?: boolean
}

const TiptapEditor = ({ content, onChange, aiEnabled = true }: TiptapEditorProps) => {
  const editorRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  
  // Initialize editor with minimal extensions to avoid circular dependencies
  const editor = useEditor({
    extensions: getMinimalExtensions(),
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // Use a more explicit approach to avoid initialization issues
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
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

  if (!editor) {
    return <div className="p-4 text-center text-gray-500">Loading editor...</div>
  }

  return (
    <div className="tiptap-editor" ref={editorRef}>
      <EditorToolbar editor={editor} />
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

export default TiptapEditor