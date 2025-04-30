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
import AiPromptNode from './AiPromptNode'
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
}

// Debug logging for collaboration events
const debugLog = (message: string, data?: any) => {
  console.log(`[Collaboration Debug] ${message}`, data || '');
};

/**
 * Get a stored user ID or generate a new one if not available
 */
const getUserId = () => {
  let userId = localStorage.getItem('user-id');
  
  if (!userId) {
    // Generate a random ID if none exists
    userId = 'user-' + Math.floor(Math.random() * 1000000).toString();
    localStorage.setItem('user-id', userId);
  }
  
  return userId;
};

/**
 * Function that returns a complete set of TipTap extensions
 * including collaboration features
 */
export const getCollaborativeExtensions = ({
  ydoc,
  provider,
  user = {
    name: localStorage.getItem('user-name') || `User ${Math.floor(Math.random() * 100)}`,
    color: localStorage.getItem('user-color') || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    id: getUserId()
  }
}: CollaborativeExtensionsOptions) => {
  debugLog('Initializing collaborative extensions', { user });
  
  // Get the shared type for the document
  const sharedType = ydoc.get('document', Y.XmlFragment);
  debugLog('Shared type initialized', { isEmpty: sharedType.length === 0 });

  // Ensure we have valid user data
  const safeUser = {
    name: user.name || 'User',
    color: user.color || '#2563EB',
    id: user.id || getUserId()
  };
  
  // Initialize user awareness with our user data if not already set
  if (provider?.awareness && !provider.awareness.getLocalState()?.user) {
    debugLog('Setting initial user awareness', { user: safeUser });
    
    // Get current state or initialize empty object
    const currentState = provider.awareness.getLocalState() || {};
    
    // Set our user data in the awareness protocol
    provider.awareness.setLocalState({
      ...currentState,
      user: safeUser
    });
  }

  return [
    // Core TipTap extensions with built-in history disabled
  StarterKit.configure({ 
      history: false, // Disable built-in history as we're using Yjs
    blockquote: {
      HTMLAttributes: {
        class: 'border-l-4 border-gray-300 pl-4 italic',
      },
    }
  }),
  
    // Explicitly define the Collaboration extension first
  Collaboration.configure({ 
      document: ydoc,
      field: 'document',
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
  
  // Custom nodes
  AiPromptNode.configure({
    HTMLAttributes: {
      class: 'ai-prompt-node',
    },
  }),
  
  // Only include collaboration cursor when provider is available
  ...(provider ? [
    CollaborationCursor.configure({ 
      provider, 
        user: safeUser,
      render: (user) => {
          const isLocalUser = user.id === safeUser.id;
          debugLog('Rendering cursor for user', { 
            name: user.name, 
            color: user.color,
            id: user.id,
            isLocalUser
          });
          
        const cursor = document.createElement('span')
        cursor.classList.add('collaboration-cursor')
        cursor.setAttribute('style', `border-color: ${user.color}`)
          cursor.setAttribute('data-user-id', user.id)
        
        const label = document.createElement('div')
        label.classList.add('collaboration-cursor-label')
          label.setAttribute('style', `
            background-color: ${user.color};
            border-radius: 3px;
            padding: 2px 6px;
            color: white;
            font-size: 12px;
            font-weight: 500;
            pointer-events: none;
            white-space: nowrap;
          `)
          
          // Only show "You" for the current user's cursor
          label.textContent = isLocalUser ? 'You' : user.name
        
        cursor.appendChild(label)
        
        return cursor
        },
    })
  ] : []),
]
}

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
  AiPromptNode,
}
