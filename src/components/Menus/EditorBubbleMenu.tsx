import { BubbleMenu, Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  Link, 
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight
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

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`editor-bubble-menu-button p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('underline') ? 'bg-gray-100 text-black' : 'text-gray-600'
        }`}
        title="Underline"
      >
        <Underline size={14} />
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

      <div className="w-px h-5 bg-gray-200 mx-0.5"></div>

      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`editor-bubble-menu-button p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-black' : 'text-gray-600'
        }`}
        title="Align Left"
      >
        <AlignLeft size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`editor-bubble-menu-button p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-black' : 'text-gray-600'
        }`}
        title="Align Center"
      >
        <AlignCenter size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`editor-bubble-menu-button p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 text-black' : 'text-gray-600'
        }`}
        title="Align Right"
      >
        <AlignRight size={14} />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-0.5"></div>

      <button
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href
          const url = window.prompt('Enter the URL:', previousUrl)
          
          // cancelled
          if (url === null) {
            return
          }
          
          // empty
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
          }
          
          // update link
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }}
        className={`editor-bubble-menu-button p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('link') ? 'bg-gray-100 text-black' : 'text-gray-600'
        }`}
        title="Link"
      >
        <Link size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`editor-bubble-menu-button p-1.5 rounded hover:bg-gray-100 ${
          editor.isActive('highlight') ? 'bg-gray-100 text-black' : 'text-gray-600'
        }`}
        title="Highlight"
      >
        <Highlighter size={14} />
      </button>
    </BubbleMenu>
  )
}

export default EditorBubbleMenu
