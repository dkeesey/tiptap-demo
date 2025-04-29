import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Mark } from '@tiptap/core';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { useCollaboration } from '../context/CollaborationContext';
import '../styles/collaborative-cursor.css';

// AI Suggestion Imports
import { aiService } from './ai-suggestions/ai-service';
import { InlineAISuggestions } from './ai-suggestions/inline-ai-suggestions-extension';
import { AISuggestionContextMenu } from './ai-suggestions/AISuggestionContextMenu';
import { InlineSuggestionsExtension } from '../extensions/InlineSuggestionsExtension';
import { InlineSuggestions } from './InlineSuggestions';
import { CollaborativeIndicators } from './Collaboration/CollaborativeIndicators';
import './ai-suggestions/ai-suggestions.css';
import '../styles/inline-suggestions.css';

// Custom mark for rendering AI suggestions
const InlineAISuggestionMark = Mark.create({
  name: 'inlineAISuggestion',
  
  addAttributes() {
    return {
      id: {
        default: null,
        renderHTML: attributes => ({
          'data-suggestion-id': attributes.id
        })
      },
      suggestion: {
        default: '',
        renderHTML: attributes => ({
          'data-suggestion-text': attributes.suggestion
        })
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-suggestion-id]',
        getAttrs: node => ({
          id: node.getAttribute('data-suggestion-id'),
          suggestion: node.getAttribute('data-suggestion-text')
        })
      }
    ];
  },

  renderHTML({ mark, HTMLAttributes }) {
    return [
      'span', 
      {
        ...HTMLAttributes,
        class: 'inline-ai-suggestion', 
        title: 'AI Suggestion'
      }, 
      0
    ];
  }
});

export const TipTapEditor: React.FC = () => {
  const [aiSuggestionsEnabled, setAISuggestionsEnabled] = useState(true);
  const [contextMenuState, setContextMenuState] = useState<{
    suggestionId?: string;
    suggestionText?: string;
    position?: { x: number; y: number };
  }>({});
  
  // Get collaboration context
  const { provider, ydoc, connectionStatus, currentUser } = useCollaboration();

  // Create editor with collaboration
  const editor = useEditor({
    extensions: [
      StarterKit,
      // Set up collaboration with Y.js document
      Collaboration.configure({
        document: ydoc,
      }),
      // Set up collaborative cursors with our provider
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: currentUser.name,
          color: currentUser.color,
          id: currentUser.id
        }
      }),
      InlineAISuggestions.configure({
        aiService,
        triggerCharacters: ['/', '@']
      }),
      InlineAISuggestionMark,
      InlineSuggestionsExtension.configure({
        typingDelay: 50,
      })
    ],
    content: '', // Initial content
    onTransaction: ({ editor }) => {
      // Check for AI suggestion marks and prepare context menu
      const { selection } = editor.state;
      const suggestionsFound: ProseMirrorNode[] = [];
      
      editor.state.doc.nodesBetween(
        selection.from, 
        selection.to, 
        (node) => {
          const aiSuggestionMark = node.marks.find(
            mark => mark.type.name === 'inlineAISuggestion'
          );
          if (aiSuggestionMark) {
            suggestionsFound.push(node);
          }
          return true; // Continue traversing
        }
      );

      if (suggestionsFound.length > 0) {
        const node = suggestionsFound[0];
        const aiSuggestionMark = node.marks.find(
          mark => mark.type.name === 'inlineAISuggestion'
        );
        
        if (aiSuggestionMark) {
          const domNode = document.querySelector(
            `[data-suggestion-id="${aiSuggestionMark.attrs.id}"]`
          );
          
          if (domNode) {
            const rect = domNode.getBoundingClientRect();
            setContextMenuState({
              suggestionId: aiSuggestionMark.attrs.id,
              suggestionText: aiSuggestionMark.attrs.suggestion,
              position: { 
                x: rect.left, 
                y: rect.bottom 
              }
            });
          }
        }
      } else {
        // Reset context menu if no suggestions are selected
        setContextMenuState({});
      }
    }
  });

  useEffect(() => {
    if (editor) {
      // Set up AI service with current editor
      aiService.setActiveEditor(editor);
      
      // Toggle inline suggestions
      aiService.toggleInlineSuggestions(aiSuggestionsEnabled);
    }
  }, [editor, aiSuggestionsEnabled]);

  useEffect(() => {
    if (editor && provider) {
      // Update the editor when our provider changes
      const collaborationExtension = editor.extensionManager.extensions.find(
        extension => extension.name === 'collaboration'
      );
      
      if (collaborationExtension) {
        // @ts-ignore - Update provider
        collaborationExtension.options.document = ydoc;
      }
      
      const cursorExtension = editor.extensionManager.extensions.find(
        extension => extension.name === 'collaborationCursor'
      );
      
      if (cursorExtension) {
        // @ts-ignore - Update provider and user
        cursorExtension.options.provider = provider;
        // @ts-ignore - Update user
        cursorExtension.options.user = {
          name: currentUser.name,
          color: currentUser.color,
          id: currentUser.id
        };
      }
    }
  }, [editor, provider, ydoc, currentUser]);

  const handleInlineSuggestion = () => {
    if (editor) {
      aiService.triggerInlineSuggestion();
    }
  };

  const toggleAISuggestions = () => {
    setAISuggestionsEnabled(!aiSuggestionsEnabled);
  };

  const handleContextMenuClose = () => {
    setContextMenuState({});
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor-container">
      {/* Connection status indicator */}
      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === 'connected' ? (
          <span className="status-indicator online">Connected</span>
        ) : connectionStatus === 'connecting' ? (
          <span className="status-indicator connecting">Connecting...</span>
        ) : connectionStatus === 'reconnecting' ? (
          <span className="status-indicator reconnecting">Reconnecting...</span>
        ) : (
          <span className="status-indicator offline">Disconnected</span>
        )}
      </div>

      {/* AI Suggestions Controls */}
      <div className="ai-suggestions-controls">
        <button 
          onClick={toggleAISuggestions}
          className={`ai-toggle ${aiSuggestionsEnabled ? 'enabled' : 'disabled'}`}
        >
          {aiSuggestionsEnabled ? 'Disable' : 'Enable'} AI Suggestions
        </button>
        
        <button 
          onClick={handleInlineSuggestion}
          disabled={!aiSuggestionsEnabled}
        >
          Generate AI Suggestion
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Inline Suggestions Handler */}
      <InlineSuggestions editor={editor} />

      {/* AI Suggestion Context Menu */}
      {contextMenuState.suggestionId && (
        <AISuggestionContextMenu
          suggestionId={contextMenuState.suggestionId}
          suggestionText={contextMenuState.suggestionText || ''}
          position={contextMenuState.position || { x: 0, y: 0 }}
          onClose={handleContextMenuClose}
        />
      )}

      {/* Collaborative Indicators */}
      <CollaborativeIndicators />
    </div>
  );
};