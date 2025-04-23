import { BubbleMenu, Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2
} from 'lucide-react'

interface EditorBubbleMenuProps {
  editor: Editor
}

const EditorBubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
  if (!editor) {
    return null
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="bg-white shadow-md border border-gray-200 rounded-md p-1 flex items-center gap-1"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`editor-bubble-menu-button p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('bold') ? 'bg-gray-100 text-black' : 'text-gray-600'
        }`}
        title="Bold"
      >
        <Bold size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`editor-bubble-menu-button p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('italic') ? 'bg-gray-100 text-black' : 'text-gray-600'
        }`}
        title="Italic"
      >
        <Italic size={14} />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-0.5"></div>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`editor-bubble-menu-button p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 text-black' : 'text-gray-600'
        }`}
        title="Heading 1"
      >
        <Heading1 size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`editor-bubble-menu-button p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-black' : 'text-gray-600'
        }`}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </button>
    </BubbleMenu>
  )
}

export default EditorBubbleMenu
