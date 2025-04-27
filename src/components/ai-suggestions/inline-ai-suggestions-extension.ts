import { Extension } from '@tiptap/core';
import { Node, Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { v4 as uuidv4 } from 'uuid';

// Import the AI service you've already created
import { AIService } from './ai-service';

interface InlineAISuggestionsOptions {
  aiService?: AIService;
  triggerCharacters?: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineAISuggestions: {
      addInlineAISuggestion: (suggestion: string) => ReturnType;
      removeInlineAISuggestion: (suggestionId: string) => ReturnType;
    }
  }
}

export const InlineAISuggestions = Extension.create<InlineAISuggestionsOptions>({
  name: 'inlineAISuggestions',

  addOptions() {
    return {
      aiService: undefined,
      triggerCharacters: ['/', '@'],
    };
  },

  addProseMirrorPlugins() {
    const { aiService, triggerCharacters } = this.options;
    
    return [
      new Plugin({
        key: new PluginKey('inlineAISuggestions'),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply: (tr, decorationSet) => {
            // Logic to manage and update inline suggestions
            return decorationSet;
          }
        },
        props: {
          decorations(state) {
            // Render AI suggestions as inline decorations
            return this.getState(state);
          }
        }
      })
    ];
  },

  addCommands() {
    return {
      addInlineAISuggestion: (suggestion: string) => ({ tr, dispatch }) => {
        const { selection } = tr;
        const suggestionId = uuidv4();

        // Create a custom node or mark for the AI suggestion
        const suggestionMark = this.type.schema.marks.inlineAISuggestion.create({ 
          id: suggestionId, 
          suggestion 
        });

        tr.addMark(selection.from, selection.to, suggestionMark);

        if (dispatch) {
          dispatch(tr);
        }

        return true;
      },

      removeInlineAISuggestion: (suggestionId: string) => ({ tr, dispatch }) => {
        // Remove specific AI suggestion by ID
        const suggestionMarks = tr.doc.descendants((node, pos) => {
          const hasSuggestionMark = node.marks.some(
            mark => mark.type.name === 'inlineAISuggestion' && 
                    mark.attrs.id === suggestionId
          );
          return hasSuggestionMark;
        });

        if (suggestionMarks.length) {
          // Remove the marks
          tr.removeMark(
            suggestionMarks[0].pos, 
            suggestionMarks[0].pos + suggestionMarks[0].node.nodeSize, 
            this.type.schema.marks.inlineAISuggestion
          );

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        }

        return false;
      }
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-/': () => {
        // Trigger AI suggestion mode
        const { aiService } = this.options;
        if (aiService) {
          aiService.triggerInlineSuggestion();
          return true;
        }
        return false;
      }
    };
  }
});