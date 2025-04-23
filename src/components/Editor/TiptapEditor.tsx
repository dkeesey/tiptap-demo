import { useEditor, EditorContent } from '@tiptap/react'
import { getMinimalExtensions } from '../../extensions/tiptap-extensions-minimal'
import EditorToolbar from '../Toolbar/EditorToolbar'
import EditorBubbleMenu from '../Menus/EditorBubbleMenu'
import EditorFloatingMenu from '../Menus/EditorFloatingMenu'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  // Initialize editor with minimal extensions to avoid circular dependencies
  const editor = useEditor({
    extensions: getMinimalExtensions(),
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    // Use a more explicit approach to avoid initialization issues
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  })

  if (!editor) {
    return <div className="p-4 text-center text-gray-500">Loading editor...</div>
  }

  return (
    <div className="tiptap-editor">
      <EditorToolbar editor={editor} />
      <EditorBubbleMenu editor={editor} />
      <EditorFloatingMenu editor={editor} />
      
      <EditorContent 
        editor={editor} 
        className="editor-content border-t border-gray-200 p-4"
      />
    </div>
  )
}

export default TiptapEditor
