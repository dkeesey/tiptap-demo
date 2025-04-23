/**
 * TipTap extensions with collaboration features
 */

import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import SlashCommandExtension from './SlashCommandExtension'
import * as Y from 'yjs'

// Types for configuring extensions
interface CollaborativeExtensionsOptions {
  ydoc: Y.Doc
  provider: any
  user?: {
    name: string
    color: string
    id: string
  }
  fragment?: Y.XmlFragment
}

/**
 * Function that returns a complete set of TipTap extensions
 * including collaboration features
 */
export const getCollaborativeExtensions = ({
  ydoc,
  provider,
  user = {
    name: `User ${Math.floor(Math.random() * 100)}`,
    color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    id: `user-${Math.floor(Math.random() * 100000)}`
  },
  fragment = ydoc.getXmlFragment('document')
}: CollaborativeExtensionsOptions) => [
  // Core extensions
  StarterKit.configure({
    history: false, // Disable built-in history as we'll use Yjs for history/undo
  }),
  
  // Formatting extensions
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Highlight,
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-500 underline',
    },
  }),
  Image.configure({
    inline: true,
    allowBase64: true,
  }),
  Placeholder.configure({
    placeholder: 'Start typing or use "/" for commands...',
  }),
  
  // Slash commands
  SlashCommandExtension,
  
  // Collaboration extensions
  Collaboration.configure({
    document: fragment,
  }),
  CollaborationCursor.configure({
    provider,
    user,
    render: (user) => {
      const cursor = document.createElement('span')
      cursor.classList.add('collaboration-cursor')
      cursor.setAttribute('style', `border-color: ${user.color}`)
      
      const label = document.createElement('div')
      label.classList.add('collaboration-cursor-label')
      label.setAttribute('style', `background-color: ${user.color}`)
      label.innerHTML = user.name
      
      cursor.appendChild(label)
      
      return { cursor, label }
    },
  }),
]

export {
  StarterKit,
  Placeholder,
  TextAlign,
  Image,
  Link,
  Highlight,
  Underline,
  Collaboration,
  CollaborationCursor,
  SlashCommandExtension,
}
