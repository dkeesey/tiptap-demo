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

// Import slash command transition styles
import '../styles/slash-command-transitions.css'

// Import slash commands list component
import SlashCommandsList from '../components/Menus/SlashCommandsList'

// Define the SlashCommand interface
export interface SlashCommand {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: Editor, range: Range) => void;
  group?: string;
  shortcut?: string;
}

// Define and export the SlashCommandExtension
export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query, editor }: { query: string, editor: Editor }) => {
          // Basic formatting commands
          const formattingCommands: SlashCommand[] = [
            {
              title: 'Text',
              description: 'Just start typing with plain text',
              icon: React.createElement(FileTextIcon, { className: "w-4 h-4" }),
              shortcut: null,
              command: (editor, range) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleNode('paragraph', 'paragraph')
                  .run();
              },
              group: 'basic',
            },
            {
              title: 'Heading 1',
              description: 'Large section heading',
              icon: React.createElement(Heading1, { className: "w-4 h-4" }),
              shortcut: null,
              command: (editor, range) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setNode('heading', { level: 1 })
                  .run();
              },
              group: 'basic',
            },
            {
              title: 'Heading 2',
              description: 'Medium section heading',
              icon: React.createElement(Heading2, { className: "w-4 h-4" }),
              shortcut: null,
              command: (editor, range) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setNode('heading', { level: 2 })
                  .run();
              },
              group: 'basic',
            },
            // Add more formatting commands as needed
          ];
          
          // Get AI commands
          const aiCommands = getAISlashCommands(editor);
          
          // Combine and filter all commands based on search query
          const allCommands = [...formattingCommands, ...aiCommands];
          const filteredCommands = query
            ? allCommands.filter(item => 
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.description?.toLowerCase().includes(query.toLowerCase()))
            : allCommands;
          
          return filteredCommands;
        },
        
        render: () => {
          let reactRenderer: ReactRenderer;
          let popup: any;

          return {
            onStart: (props) => {
              reactRenderer = new ReactRenderer(SlashCommandsList, {
                props,
                editor: props.editor,
              });

              // Store the popup reference globally for easier access
              popup = tippy(document.body, {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: reactRenderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                animation: 'shift-away',
                arrow: false,
                theme: 'slash-command',
                maxWidth: 'none',
              });
              
              // Keep track of the popup for cleanup purposes
              window.__lastSlashCommandPopup = popup[0];
            },
            
            onUpdate(props) {
              reactRenderer.updateProps(props);

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },
            
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }
              
              // TypeScript narrowing
              const ref = reactRenderer.ref as any;
              return ref?.onKeyDown?.(props);
            },
            
            onExit() {
              popup[0].destroy();
              reactRenderer.destroy();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

// Also export as default for compatibility
export default SlashCommandExtension;