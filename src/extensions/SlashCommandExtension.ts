/**
 * SlashCommandExtension.ts
 * Provides slash command functionality for the editor.
 */

import { Extension, Range } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { Editor } from '@tiptap/core'

// We'll define this component later
import SlashCommandsList from '../components/Menus/SlashCommandsList'

// Define the slash commands we want to support
export interface SlashCommand {
  title: string;
  description: string;
  category?: 'basic' | 'formatting' | 'ai' | 'advanced';
  icon?: React.ReactNode;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
          console.log('[SlashCommand] Triggered command:', props.item.title);
          props.command({ editor, range });
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          console.log(`[SlashCommand] Query: "${query}"`);
          const commands: SlashCommand[] = [
            // Basic formatting
            {
              title: 'Text',
              description: 'Just start typing with plain text.',
              category: 'basic',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
              },
            },
            {
              title: 'Heading 1',
              description: 'Large section heading.',
              category: 'formatting',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setNode('heading', { level: 1 })
                  .run()
              },
            },
            {
              title: 'Heading 2',
              description: 'Medium section heading.',
              category: 'formatting',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setNode('heading', { level: 2 })
                  .run()
              },
            },
            {
              title: 'Bullet List',
              description: 'Create a simple bullet list.',
              category: 'formatting',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
              },
            },
            {
              title: 'Numbered List',
              description: 'Create a numbered list.',
              category: 'formatting',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
              },
            },
            {
              title: 'Blockquote',
              description: 'Capture a quote or excerpt.',
              category: 'formatting',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run()
              },
            },
            {
              title: 'Code Block',
              description: 'Display code with syntax highlighting.',
              category: 'formatting',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
              },
            },
            {
              title: 'Horizontal Rule',
              description: 'Add a horizontal divider.',
              category: 'formatting',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run()
              },
            },
            
            // AI prompt specific commands
            {
              title: 'AI Prompt',
              description: 'Add an AI prompt block for general use.',
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setAiPrompt({}).run();
              },
            },
            {
              title: 'AI Explain',
              description: 'Ask AI to explain a concept.',
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setAiPrompt({
                  title: 'AI Explain',
                  prompt: 'Explain this concept in simple terms:',
                  status: 'idle'
                }).run();
              },
            },
            {
              title: 'AI Summarize',
              description: 'Ask AI to summarize text.',
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setAiPrompt({
                  title: 'AI Summarize', 
                  prompt: 'Please summarize the following text:',
                  status: 'idle'
                }).run();
              },
            },
            {
              title: 'AI Improve',
              description: 'Ask AI to improve your writing.',
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setAiPrompt({
                  title: 'AI Writing Improvement',
                  prompt: 'Please improve this text for clarity and style:',
                  status: 'idle'
                }).run();
              },
            },
            {
              title: 'AI Code',
              description: 'Get help with coding problems.',
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setAiPrompt({
                  title: 'AI Code Assistant',
                  prompt: 'Help me with this coding task:',
                  status: 'idle'
                }).run();
              },
            },
            {
              title: 'AI Brainstorm',
              description: 'Generate ideas on a topic.',
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setAiPrompt({
                  title: 'AI Brainstorming',
                  prompt: 'Brainstorm ideas about:',
                  status: 'idle'
                }).run();
              },
            },
            {
              title: 'AI Translate',
              description: 'Translate text to another language.',
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setAiPrompt({
                  title: 'AI Translation',
                  prompt: 'Translate this text to:',
                  status: 'idle'
                }).run();
              },
            },
            {
              title: 'AI Complete',
              description: 'Continue writing with AI assistance.',
              category: 'ai',
              command: ({ editor, range }) => {
                // Get text before cursor to use as context
                const { from } = range;
                const text = editor.state.doc.textBetween(Math.max(0, from - 500), from, '\n');
                
                editor.chain().focus().deleteRange(range).setAiPrompt({
                  title: 'AI Completion',
                  prompt: `Continue writing from here:\n\n${text}`,
                  status: 'loading' // Immediately start processing
                }).run();
              },
            },
            {
              title: 'AI Transform Selection',
              description: 'Transform selected text with AI.',
              category: 'ai',
              command: ({ editor, range }) => {
                // Get selected text
                const { from, to } = editor.state.selection;
                const selectedText = editor.state.doc.textBetween(from, to, '\n');
                
                if (!selectedText) {
                  // If no text is selected, just insert an empty prompt
                  editor.chain().focus().deleteRange(range).setAiPrompt({
                    title: 'AI Transform',
                    prompt: 'Transform this text by:',
                    status: 'idle'
                  }).run();
                } else {
                  // If text is selected, prefill the prompt with the selection
                  editor.chain().focus().deleteRange(range).setAiPrompt({
                    title: 'AI Transform',
                    prompt: `Transform this text by improving its clarity and style:\n\n${selectedText}`,
                    status: 'loading' // Immediately start processing
                  }).run();
                }
              },
            },
          ];

          if (!query) {
            console.log('[SlashCommand] No query, returning all commands:', commands.map(c => c.title));
            return commands;
          }

          // Filter commands by title and category
          const lowerQuery = query.toLowerCase();
          
          // Check if query starts with 'ai' to prioritize AI commands
          if (lowerQuery.startsWith('ai')) {
            const aiCommands = commands
              .filter(item => item.category === 'ai')
              .filter(item => item.title.toLowerCase().includes(lowerQuery));
              
            // If there are AI commands matching, return those first
            if (aiCommands.length > 0) {
              return aiCommands;
            }
          }
          
          // Otherwise filter all commands
          const filteredCommands = commands.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) || 
            item.description.toLowerCase().includes(lowerQuery)
          );
          
          console.log(`[SlashCommand] Filtered commands for "${query}":`, filteredCommands.map(c => c.title));
          return filteredCommands;
        },
        render: () => {
          let reactRenderer: ReactRenderer;
          let popup: any;

          return {
            onStart: props => {
              reactRenderer = new ReactRenderer(SlashCommandsList, {
                props,
                editor: this.editor,
              });

              // Ensure clientRect is a function and returns a DOMRect
              const getReferenceClientRect = (): DOMRect | ClientRect => {
                const rect = typeof props.clientRect === 'function' ? props.clientRect() : props.clientRect;
                // Return a default rect if null or undefined, otherwise return the rect
                return rect || new DOMRect(0, 0, 0, 0); 
              };

              popup = tippy('body', {
                getReferenceClientRect,
                appendTo: () => document.body,
                content: reactRenderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate(props) {
              reactRenderer.updateProps(props);

              // Ensure clientRect is updated correctly
              const getReferenceClientRect = (): DOMRect | ClientRect => {
                const rect = typeof props.clientRect === 'function' ? props.clientRect() : props.clientRect;
                return rect || new DOMRect(0, 0, 0, 0);
              };

              popup[0].setProps({
                getReferenceClientRect,
              });
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }
              
              // Type assertion to inform TypeScript about the expected ref structure
              const commandListRef = reactRenderer.ref as { onKeyDown: (props: { event: KeyboardEvent }) => boolean } | null;
              return commandListRef?.onKeyDown(props) || false;
            },
            onExit() {
              popup[0].destroy();
              reactRenderer.destroy();
            },
          };
        },
      }),
    ];
  },
});

export default SlashCommandExtension;