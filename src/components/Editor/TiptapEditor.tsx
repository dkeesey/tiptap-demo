import { useEditor, EditorContent } from '@tiptap/react'
import { getTiptapExtensions } from '../../extensions/tiptap-extensions'
import EditorToolbar from '../Toolbar/EditorToolbar'
import EditorBubbleMenu from '../Menus/EditorBubbleMenu'
import EditorFloatingMenu from '../Menus/EditorFloatingMenu'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: getTiptapExtensions(),
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="tiptap-editor">
      {editor && <EditorToolbar editor={editor} />}
      
      {editor && (
        <EditorBubbleMenu editor={editor} />
      )}
      
      {editor && (
        <EditorFloatingMenu editor={editor} />
      )}
      
      <EditorContent 
        editor={editor} 
        className="editor-content border-t border-gray-200"
      />
    </div>
  )
}

export default TiptapEditor