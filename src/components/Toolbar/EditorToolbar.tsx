import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Undo, 
  Redo,
  Quote
} from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) {
    return null
  }

  return (
    <div className="editor-toolbar bg-gray-50 border-b border-gray-200 p-2 flex items-center gap-1 flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('bold') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
        }`}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('italic') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
        }`}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
        }`}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
        }`}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('bulletList') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
        }`}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('orderedList') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
        }`}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('blockquote') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
        }`}
        title="Blockquote"
      >
        <Quote size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`p-2 rounded hover:bg-gray-100 ${
          !editor.can().undo() ? 'opacity-30' : ''
        } text-gray-600`}
        title="Undo"
      >
        <Undo size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`p-2 rounded hover:bg-gray-100 ${
          !editor.can().redo() ? 'opacity-30' : ''
        } text-gray-600`}
        title="Redo"
      >
        <Redo size={18} />
      </button>
    </div>
  )
}

export default EditorToolbar
