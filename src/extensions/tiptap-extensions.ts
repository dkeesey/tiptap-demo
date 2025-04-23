// Import individual extensions instead of using StarterKit
import Blockquote from '@tiptap/extension-blockquote'
import BulletList from '@tiptap/extension-bullet-list'
import Bold from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import Document from '@tiptap/extension-document'
import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import History from '@tiptap/extension-history'
import Italic from '@tiptap/extension-italic'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import Text from '@tiptap/extension-text'

// Import additional extensions
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'

// Export a function to get all extensions
export const getTiptapExtensions = () => {
  return [
    // Core extensions
    Document,
    Paragraph,
    Text,
    
    // Basic formatting
    Bold,
    Italic,
    Strike,
    Underline,
    
    // Block-level formatting
    Blockquote,
    BulletList,
    Code,
    Heading.configure({
      levels: [1, 2, 3],
    }),
    ListItem,
    OrderedList,
    
    // Utility extensions
    Dropcursor,
    Gapcursor,
    HardBreak,
    History,
    
    // Additional extensions
    Placeholder.configure({
      placeholder: 'Start typing or use the toolbar to format your content...',
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
    }),
    Image,
    Highlight,
  ]
}
