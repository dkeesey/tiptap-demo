import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Mark } from '@tiptap/core';

// AI Suggestion Imports
import { aiService } from './ai-suggestions/ai-service';
import { InlineAISuggestions } from './ai-suggestions/inline-ai-suggestions-extension';
import { AISuggestionContextMenu } from './ai-suggestions/AISuggestionContextMenu';
import './ai-suggestions/ai-suggestions.css';

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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        // Collaboration configuration
      }),
      CollaborationCursor.configure({
        // Cursor configuration
      }),
      InlineAISuggestions.configure({
        aiService,
        triggerCharacters: ['/', '@']
      }),
      InlineAISuggestionMark
    ],
    content: '', // Initial content
    onTransaction: ({ editor }) => {
      // Check for AI suggestion marks and prepare context menu
      const { selection } = editor.state;
      const suggestionsInSelection = editor.state.doc.nodesBetween(
        selection.from, 
        selection.to, 
        (node) => {
          const aiSuggestionMark = node.marks.find(
            mark => mark.type.name === 'inlineAISuggestion'
          );
          return aiSuggestionMark;
        }
      );

      if (suggestionsInSelection.length > 0) {
        const aiSuggestionMark = suggestionsInSelection[0].marks.find(
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

      {/* AI Suggestion Context Menu */}
      {contextMenuState.suggestionId && (
        <AISuggestionContextMenu
          suggestionId={contextMenuState.suggestionId}
          suggestionText={contextMenuState.suggestionText || ''}
          position={contextMenuState.position || { x: 0, y: 0 }}
          onClose={handleContextMenuClose}
        />
      )}
    </div>
  );
};