import { Extension, Range } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { Editor } from '@tiptap/core'

// We'll define this component later
import SlashCommandsList from '../components/Menus/SlashCommandsList'

// Define the slash commands we want to support
export interface SlashCommand {
  title: string
  description: string
  icon?: React.ReactNode
  command: ({ editor, range }: { editor: Editor; range: Range }) => void
}

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: any; range: any; props: any }) => {
          props.command({ editor, range })
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
          const commands: SlashCommand[] = [
            {
              title: 'Text',
              description: 'Just start typing with plain text.',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
              },
            },
            {
              title: 'Heading 1',
              description: 'Large section heading.',
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
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
              },
            },
            {
              title: 'Numbered List',
              description: 'Create a numbered list.',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
              },
            },
            {
              title: 'Blockquote',
              description: 'Capture a quote or excerpt.',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run()
              },
            },
            {
              title: 'Code Block',
              description: 'Display code with syntax highlighting.',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
              },
            },
            {
              title: 'Horizontal Rule',
              description: 'Add a horizontal divider.',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run()
              },
            },
            // Add AI prompt specific commands here later
            {
              title: 'AI Prompt',
              description: 'Add an AI prompt block.',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setAiPrompt({}).run();
                // We'll implement custom AI prompt nodes later
                // alert('AI Prompt blocks will be implemented in a future update!')
              },
            },
          ]

          if (!query) {
            return commands
          }

          return commands.filter(item => {
            return item.title.toLowerCase().includes(query.toLowerCase())
          })
        },
        render: () => {
          let reactRenderer: ReactRenderer
          let popup: any

          return {
            onStart: props => {
              reactRenderer = new ReactRenderer(SlashCommandsList, {
                props,
                editor: this.editor,
              })

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
              })
            },
            onUpdate(props) {
              reactRenderer.updateProps(props)

              // Ensure clientRect is updated correctly
              const getReferenceClientRect = (): DOMRect | ClientRect => {
                const rect = typeof props.clientRect === 'function' ? props.clientRect() : props.clientRect;
                return rect || new DOMRect(0, 0, 0, 0);
              };

              popup[0].setProps({
                getReferenceClientRect,
              })
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide()
                return true
              }
              
              // Type assertion to inform TypeScript about the expected ref structure
              const commandListRef = reactRenderer.ref as { onKeyDown: (props: { event: KeyboardEvent }) => boolean } | null;
              return commandListRef?.onKeyDown(props) || false
            },
            onExit() {
              popup[0].destroy()
              reactRenderer.destroy()
            },
          }
        },
      }),
    ]
  },
})

export default SlashCommandExtension
