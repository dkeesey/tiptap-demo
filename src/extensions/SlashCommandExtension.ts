/**
 * SlashCommandExtension.ts
 * Provides slash command functionality for the editor.
 */

import { Extension, Range } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { Editor } from '@tiptap/core'
import { getAISlashCommands } from './AISlashCommands'
import { FileTextIcon, Heading1, Heading2, ListIcon, ListOrderedIcon, QuoteIcon, CodeIcon, SeparatorHorizontalIcon } from 'lucide-react'
import React from 'react'

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

const createIcon = (Icon: any) => React.createElement(Icon, { className: "w-4 h-4" });

declare global {
  interface Window {
    __lastSlashCommandPopup?: any;
    __debugSlashCommand?: boolean;
  }
}

// Enable debugging
window.__debugSlashCommand = true;

// Direct command execution function to bypass complex chain
const executeCommand = (fn: Function) => {
  try {
    fn();
    console.log('Direct command execution success');
    return true;
  } catch (error) {
    console.error('Direct command execution failed:', error);
    return false;
  }
};

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
          console.log('[SlashCommand] Triggered command:', props.item.title);
          
          // Capture command details for direct execution
          const commandTitle = props.item.title;
          const commandFn = props.item.command;
          
          // Hide popup immediately
          if (window.__lastSlashCommandPopup) {
            window.__lastSlashCommandPopup.hide();
          }
          
          // Remove the slash character first
          editor.chain().focus().deleteRange(range).run();
          console.log('[SlashCommand] Deleted range (slash character)');
          
          // Now directly execute the command logic based on the command type
          setTimeout(() => {
            try {
              switch(commandTitle) {
                case 'Heading 1':
                  editor.chain().focus().setNode('heading', { level: 1 }).run();
                  console.log('[SlashCommand] Applied Heading 1');
                  break;
                case 'Heading 2':
                  editor.chain().focus().setNode('heading', { level: 2 }).run();
                  console.log('[SlashCommand] Applied Heading 2');
                  break;
                case 'Bullet List':
                  editor.chain().focus().toggleBulletList().run();
                  console.log('[SlashCommand] Applied Bullet List');
                  break;
                case 'Numbered List':
                  editor.chain().focus().toggleOrderedList().run();
                  console.log('[SlashCommand] Applied Numbered List');
                  break;
                case 'Blockquote':
                  editor.chain().focus().toggleBlockquote().run();
                  console.log('[SlashCommand] Applied Blockquote');
                  break;
                case 'Code Block':
                  editor.chain().focus().toggleCodeBlock().run();
                  console.log('[SlashCommand] Applied Code Block');
                  break;
                case 'Horizontal Rule':
                  editor.chain().focus().setHorizontalRule().run();
                  console.log('[SlashCommand] Applied Horizontal Rule');
                  break;
                case 'AI Complete':
                case 'AI Chat':
                case 'AI Improve':
                case 'AI Code':
                case 'AI Explain':
                case 'AI Translate':
                case 'AI Rephrase':
                case 'AI Brainstorm':
                case 'AI Summarize':
                case 'AI Expand':
                case 'AI Regenerate':
                case 'AI Inline Complete':
                  // For AI commands, get text for context
                  const { from } = editor.state.selection;
                  const text = editor.state.doc.textBetween(Math.max(0, from - 500), from, '\n');
                  
                  // Create an AI prompt with appropriate title
                  editor.chain().focus().setAiPrompt({
                    title: commandTitle,
                    prompt: `${commandTitle} prompt with context: ${text}`,
                    status: 'idle'
                  }).run();
                  console.log('[SlashCommand] Applied AI command:', commandTitle);
                  break;
                default:
                  // For other commands, try to execute the original command function
                  try {
                    commandFn({ editor, range });
                    console.log('[SlashCommand] Applied custom command:', commandTitle);
                  } catch (cmdErr) {
                    console.error('[SlashCommand] Error executing custom command:', cmdErr);
                  }
                  break;
              }
            } catch (err) {
              console.error('[SlashCommand] Error executing command:', err);
            }
          }, 10);
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
          
          // Basic formatting commands
          const basicCommands: SlashCommand[] = [
            {
              title: 'Text',
              description: 'Just start typing with plain text.',
              category: 'basic',
              icon: createIcon(FileTextIcon),
              command: ({ editor, range }) => {
                // This is now handled by the main command processing
                // which removes the slash for all commands
                console.log('Text command executed - no action needed as slash is already removed');
              },
            },
            {
              title: 'Heading 1',
              description: 'Large section heading.',
              category: 'formatting',
              icon: createIcon(Heading1),
              command: ({ editor, range }) => {
                // This is now handled directly in the command handler
                console.log('[Command definition] Heading 1 command');
              },
            },
            {
              title: 'Heading 2',
              description: 'Medium section heading.',
              category: 'formatting',
              icon: createIcon(Heading2),
              command: ({ editor, range }) => {
                // Now handled directly in the command handler
                console.log('[Command definition] Heading 2 command');
              },
            },
            {
              title: 'Bullet List',
              description: 'Create a simple bullet list.',
              category: 'formatting',
              icon: createIcon(ListIcon),
              command: ({ editor, range }) => {
                // Now handled directly in the command handler
                console.log('[Command definition] Bullet List command');
              },
            },
            {
              title: 'Numbered List',
              description: 'Create a numbered list.',
              category: 'formatting',
              icon: createIcon(ListOrderedIcon),
              command: ({ editor, range }) => {
                // Now handled directly in the command handler
                console.log('[Command definition] Numbered List command');
              },
            },
            {
              title: 'Blockquote',
              description: 'Capture a quote or excerpt.',
              category: 'formatting',
              icon: createIcon(QuoteIcon),
              command: ({ editor, range }) => {
                // Now handled directly in the command handler
                console.log('[Command definition] Blockquote command');
              },
            },
            {
              title: 'Code Block',
              description: 'Display code with syntax highlighting.',
              category: 'formatting',
              icon: createIcon(CodeIcon),
              command: ({ editor, range }) => {
                // Now handled directly in the command handler
                console.log('[Command definition] Code Block command');
              },
            },
            {
              title: 'Horizontal Rule',
              description: 'Add a horizontal divider.',
              category: 'formatting',
              icon: createIcon(SeparatorHorizontalIcon),
              command: ({ editor, range }) => {
                // Now handled directly in the command handler
                console.log('[Command definition] Horizontal Rule command');
              },
            },
          ];

          // Get AI commands
          const aiCommands = getAISlashCommands(this.editor);

          // Combine all commands
          const allCommands = [...basicCommands, ...aiCommands];

          if (!query) {
            console.log('[SlashCommand] No query, returning all commands:', allCommands.map(c => c.title));
            return allCommands;
          }

          const lowerQuery = query.toLowerCase();
          
          // Check if query starts with 'ai' to prioritize AI commands
          if (lowerQuery.startsWith('ai')) {
            const filteredAICommands = aiCommands.filter(item => 
              item.title.toLowerCase().includes(lowerQuery) || 
              item.description.toLowerCase().includes(lowerQuery)
            );
              
            // If there are AI commands matching, return those first
            if (filteredAICommands.length > 0) {
              return filteredAICommands;
            }
          }
          
          // Filter by category if specified
          if (lowerQuery.startsWith('format')) {
            return allCommands.filter(item => item.category === 'formatting');
          }
          
          if (lowerQuery.startsWith('basic')) {
            return allCommands.filter(item => item.category === 'basic');
          }
          
          // Otherwise filter all commands by title and description
          return allCommands.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) || 
            item.description.toLowerCase().includes(lowerQuery)
          );
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
                hideOnClick: true,
                onHide: () => {
                  console.log('[SlashCommand] Popup hiding');
                },
                onHidden: () => {
                  console.log('[SlashCommand] Popup hidden');
                }
              });
              
              // Store a reference to the popup
              // @ts-ignore - adding a property to window
              window.__lastSlashCommandPopup = popup[0];
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
            }
          };
        },
      }),
    ];
  }
});

export default SlashCommandExtension;