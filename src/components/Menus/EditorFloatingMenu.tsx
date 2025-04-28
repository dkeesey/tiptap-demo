import { FloatingMenu, Editor } from '@tiptap/react'
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code2, 
  Table, 
  Image,
  FileText,
  Slash
} from 'lucide-react'

interface EditorFloatingMenuProps {
  editor: Editor
}

const EditorFloatingMenu = ({ editor }: EditorFloatingMenuProps) => {
  if (!editor) {
    return null
  }

  return (
    <FloatingMenu
      editor={editor}
      tippyOptions={{ 
        duration: 100,
        delay: [500, 0], // Add a 500ms delay before showing the menu
      }}
      className="bg-white shadow-md border border-gray-200 rounded-md p-1 flex flex-col gap-1 min-w-[180px]"
      shouldShow={({ editor, view, state, oldState }) => {
        // Never show the floating menu automatically
        // Instead, we'll let the slash commands handle block formatting
        return false;
      }}
    >
      <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-200 mb-1">
        Block Formatting
      </div>
      <div className="px-2 py-1 text-xs text-gray-400 mb-1">
        Select a block format to begin
      </div>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <Heading1 size={16} />
        <span className="text-sm">Heading 1</span>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <Heading2 size={16} />
        <span className="text-sm">Heading 2</span>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <List size={16} />
        <span className="text-sm">Bullet List</span>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <ListOrdered size={16} />
        <span className="text-sm">Ordered List</span>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <Quote size={16} />
        <span className="text-sm">Quote</span>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <Heading3 size={16} />
        <span className="text-sm">Heading 3</span>
      </button>

      <button
        onClick={() => {
          editor.chain().focus().setNode('codeBlock').run()
        }}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <Code2 size={16} />
        <span className="text-sm">Code Block</span>
      </button>

      <button
        onClick={() => {
          const url = window.prompt('Enter image URL');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run()
          }
        }}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <Image size={16} />
        <span className="text-sm">Image</span>
      </button>

      <button
        onClick={() => {
          editor.chain().focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <Table size={16} />
        <span className="text-sm">Table</span>
      </button>

      <button
        onClick={() => {
          editor.chain().focus().setHorizontalRule().run()
        }}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <FileText size={16} />
        <span className="text-sm">Horizontal Rule</span>
      </button>
    </FloatingMenu>
  )
}

export default EditorFloatingMenu
