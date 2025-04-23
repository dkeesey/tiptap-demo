import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'

// Note: We're no longer importing these directly as they're included in StarterKit
// import Document from '@tiptap/extension-document'
// import Paragraph from '@tiptap/extension-paragraph'
// import Text from '@tiptap/extension-text'

import EditorToolbar from '../Toolbar/EditorToolbar'
import EditorBubbleMenu from '../Menus/EditorBubbleMenu'
import EditorFloatingMenu from '../Menus/EditorFloatingMenu'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      // Use StarterKit with default configuration
      StarterKit.configure({
        // We're now using the default Document, Paragraph, and Text from StarterKit
        // No need to disable them
      }),
      Placeholder.configure({
        placeholder: 'Start typing or use the toolbar to format your content...',
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Highlight,
    ],
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