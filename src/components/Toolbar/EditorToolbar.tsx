import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Highlighter, 
  Quote, 
  Undo, 
  Redo,
  Image,
  Link
} from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) {
    return null
  }

  return (
    <div className="editor-toolbar bg-editor-toolbar-background border-b border-editor-toolbar-border p-2 flex items-center gap-1 flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive('bold') ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive('italic') ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive('underline') ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Underline"
      >
        <Underline size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive('heading', { level: 1 }) ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive('heading', { level: 2 }) ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive('bulletList') ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive('orderedList') ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Align Left"
      >
        <AlignLeft size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Align Center"
      >
        <AlignCenter size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Align Right"
      >
        <AlignRight size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive('highlight') ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Highlight"
      >
        <Highlighter size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive('blockquote') ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Blockquote"
      >
        <Quote size={18} />
      </button>
      
      <button
        onClick={() => {
          const url = window.prompt('Enter the URL of the image:')
          if (url) {
            editor.chain().focus().setImage({ src: url }).run()
          }
        }}
        className="p-2 rounded hover:bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-icon"
        title="Insert Image"
      >
        <Image size={18} />
      </button>
      
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
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          editor.isActive('link') ? 'bg-editor-toolbar-button-backgroundHover text-editor-toolbar-button-iconActive' : 'text-editor-toolbar-button-icon'
        }`}
        title="Link"
      >
        <Link size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          !editor.can().undo() ? 'opacity-30' : ''
        } text-editor-toolbar-button-icon`}
        title="Undo"
      >
        <Undo size={18} />
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`p-2 rounded hover:bg-editor-toolbar-button-backgroundHover ${
          !editor.can().redo() ? 'opacity-30' : ''
        } text-editor-toolbar-button-icon`}
        title="Redo"
      >
        <Redo size={18} />
      </button>
    </div>
  )
}

export default EditorToolbar
