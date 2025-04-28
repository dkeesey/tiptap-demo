import { Extension, Range } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Node as ProseMirrorNode } from '@tiptap/pm/model';

interface InlineSuggestion {
  id: string;
  text: string;
  range: Range;
  status: 'typing' | 'complete';
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineSuggestions: {
      /**
       * Show an inline suggestion
       */
      showInlineSuggestion: (suggestion: { text: string }) => ReturnType;
      /**
       * Accept the current inline suggestion
       */
      acceptInlineSuggestion: () => ReturnType;
      /**
       * Reject the current inline suggestion
       */
      rejectInlineSuggestion: () => ReturnType;
    }
  }
}

const InlineSuggestionsKey = new PluginKey('inline-suggestions');

export const InlineSuggestionsExtension = Extension.create({
  name: 'inlineSuggestions',

  addOptions() {
    return {
      typingDelay: 50, // Delay between characters when showing typing effect
      suggestionClass: 'inline-suggestion',
      loadingClass: 'inline-suggestion-loading',
    };
  },

  addCommands() {
    return {
      showInlineSuggestion:
        (suggestionData) =>
        ({ editor, tr, dispatch }) => {
          if (!dispatch) return false;

          const { selection } = tr;
          const suggestion: InlineSuggestion = {
            id: Math.random().toString(36).substring(2),
            text: suggestionData.text,
            range: {
              from: selection.from,
              to: selection.from,
            },
            status: 'typing',
          };

          const pluginState = InlineSuggestionsKey.getState(editor.state);
          const newState = {
            ...pluginState,
            suggestions: [...(pluginState?.suggestions || []), suggestion],
          };

          dispatch(tr.setMeta(InlineSuggestionsKey, newState));
          return true;
        },

      acceptInlineSuggestion:
        () =>
        ({ editor, tr, dispatch }) => {
          if (!dispatch) return false;

          const pluginState = InlineSuggestionsKey.getState(editor.state);
          const suggestion = pluginState?.suggestions?.[0];

          if (!suggestion) return false;

          // Insert the suggestion text
          tr.insertText(suggestion.text, suggestion.range.from);

          // Clear the suggestion
          dispatch(
            tr.setMeta(InlineSuggestionsKey, {
              suggestions: [],
            })
          );

          return true;
        },

      rejectInlineSuggestion:
        () =>
        ({ editor, tr, dispatch }) => {
          if (!dispatch) return false;

          // Simply clear the suggestions
          dispatch(
            tr.setMeta(InlineSuggestionsKey, {
              suggestions: [],
            })
          );

          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const { typingDelay, suggestionClass, loadingClass } = this.options;

    return [
      new Plugin({
        key: InlineSuggestionsKey,

        state: {
          init() {
            return {
              suggestions: [],
            };
          },
          apply(tr, state) {
            // Handle meta updates
            const meta = tr.getMeta(InlineSuggestionsKey);
            if (meta) {
              return meta;
            }

            // Map through any doc changes
            if (tr.docChanged && state.suggestions.length) {
              return {
                suggestions: state.suggestions.map((s: InlineSuggestion) => ({
                  ...s,
                  range: {
                    from: tr.mapping.map(s.range.from),
                    to: tr.mapping.map(s.range.to),
                  },
                })),
              };
            }

            return state;
          },
        },

        props: {
          decorations(state) {
            const pluginState = InlineSuggestionsKey.getState(state);
            if (!pluginState?.suggestions?.length) return DecorationSet.empty;

            const decorations = pluginState.suggestions.flatMap(
              (suggestion: InlineSuggestion) => {
                const { from, to } = suggestion.range;

                // For typing effect, only show the characters typed so far
                const visibleText =
                  suggestion.status === 'typing'
                    ? suggestion.text.slice(0, to - from)
                    : suggestion.text;

                return [
                  Decoration.inline(from, from + visibleText.length, {
                    class: `${suggestionClass} ${
                      suggestion.status === 'typing' ? loadingClass : ''
                    }`,
                  }),
                ];
              }
            );

            return DecorationSet.create(state.doc, decorations);
          },
        },

        view() {
          return {
            update: (view, prevState) => {
              const pluginState = InlineSuggestionsKey.getState(view.state);
              const prevPluginState = InlineSuggestionsKey.getState(prevState);

              // Handle typing effect
              if (
                pluginState?.suggestions?.length &&
                pluginState.suggestions[0].status === 'typing'
              ) {
                const suggestion = pluginState.suggestions[0];
                const { from } = suggestion.range;
                const currentLength = suggestion.range.to - from;

                if (currentLength < suggestion.text.length) {
                  setTimeout(() => {
                    const tr = view.state.tr.setMeta(InlineSuggestionsKey, {
                      suggestions: [
                        {
                          ...suggestion,
                          range: {
                            from,
                            to: from + currentLength + 1,
                          },
                        },
                      ],
                    });
                    view.dispatch(tr);
                  }, typingDelay);
                } else {
                  // Typing complete
                  const tr = view.state.tr.setMeta(InlineSuggestionsKey, {
                    suggestions: [
                      {
                        ...suggestion,
                        status: 'complete',
                      },
                    ],
                  });
                  view.dispatch(tr);
                }
              }
            },
          };
        },
      }),
    ];
  },
});

export default InlineSuggestionsExtension; 