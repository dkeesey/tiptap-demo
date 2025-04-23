import { FloatingMenu, Editor } from '@tiptap/react'
import { 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Image, 
  FileText, 
  Quote,
  Code
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
      tippyOptions={{ duration: 100 }}
      className="bg-white shadow-md border border-gray-200 rounded-md p-1 flex flex-col gap-1"
    >
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
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <Code size={16} />
        <span className="text-sm">Code Block</span>
      </button>

      <button
        onClick={() => {
          const url = window.prompt('Enter the URL of the image:')
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
          const url = window.prompt('Enter the URL:')
          if (url) {
            window.open(url)
          }
        }}
        className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 text-gray-700"
      >
        <FileText size={16} />
        <span className="text-sm">Embed</span>
      </button>
    </FloatingMenu>
  )
}

export default EditorFloatingMenu
