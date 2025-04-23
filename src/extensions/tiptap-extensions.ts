// Import only the essential extensions needed for basic functionality
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Blockquote from '@tiptap/extension-blockquote'
import Placeholder from '@tiptap/extension-placeholder'
import History from '@tiptap/extension-history'

// Keep the function pattern for getting extensions
export const getTiptapExtensions = () => [
  // Core essentials first
  Document.configure({
    content: 'heading block*',
  }),
  
  Paragraph.configure({
    HTMLAttributes: {
      class: 'prose-p',
    },
  }),
  
  Text,
  
  // Basic formatting
  Bold,
  Italic,
  
  // Block elements
  Heading.configure({
    levels: [1, 2],
    HTMLAttributes: {
      class: 'prose-heading',
    },
  }),
  
  BulletList.configure({
    HTMLAttributes: {
      class: 'prose-ul',
    },
  }),
  
  OrderedList.configure({
    HTMLAttributes: {
      class: 'prose-ol',
    },
  }),
  
  ListItem.configure({
    HTMLAttributes: {
      class: 'prose-li',
    },
  }),
  
  Blockquote.configure({
    HTMLAttributes: {
      class: 'prose-blockquote',
    },
  }),
  
  // Utility extensions
  Placeholder.configure({
    placeholder: 'Start typing or use the toolbar to format your content...',
  }),
  
  History,
]
