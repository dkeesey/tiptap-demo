/**
 * Minimal TipTap extensions configuration to avoid circular dependencies
 * This approach uses the absolute minimum extensions needed to make TipTap work
 * without initialization order issues
 */

// Import the bare minimum core modules first
import { Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

// Then import formatting extensions
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Placeholder from '@tiptap/extension-placeholder'
import History from '@tiptap/extension-history'

// Create a placeholder extension with minimal dependencies
const MinimalPlaceholder = Extension.create({
  name: 'placeholder',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          placeholder: {
            default: 'Start typing or use the toolbar to format your content...',
            parseHTML: element => element.getAttribute('data-placeholder'),
            renderHTML: attributes => {
              if (!attributes.placeholder) {
                return {}
              }

              return {
                'data-placeholder': attributes.placeholder,
              }
            },
          },
        },
      },
    ]
  },
})

/**
 * Function that returns the minimal set of extensions
 * in an order that avoids initialization issues
 */
export const getMinimalExtensions = () => [
  // Core schema extensions first
  Document.configure({
    content: 'heading block*',
  }),
  Paragraph,
  Text,
  
  // Basic formatting extensions 
  Bold,
  Italic,
  
  // Block-level extensions
  Heading.configure({
    levels: [1, 2],
  }),
  
  BulletList,
  OrderedList,
  ListItem,
  
  // Utility extensions
  MinimalPlaceholder,
  History,
]

// Export the core extensions individually for direct use
export {
  Document,
  Paragraph, 
  Text,
  Bold,
  Italic,
  Heading,
  BulletList,
  OrderedList,
  ListItem,
  History,
}
