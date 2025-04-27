import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import AiPromptComponent from '../components/Nodes/AiPromptComponent'; // Adjust path if needed

export interface AiPromptOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiPrompt: {
      setAiPrompt: (options: { prompt?: string; title?: string; status?: string; result?: string }) => ReturnType;
    };
  }
}

export const AiPromptNode = Node.create<AiPromptOptions>({
  name: 'aiPrompt',
  group: 'block',
  atom: true, // Treat as a single unit, not directly editable inline
  defining: true, // Ensures content within is treated as belonging to this node

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      prompt: {
        default: '',
        parseHTML: element => element.getAttribute('data-prompt'),
        renderHTML: attributes => ({ 'data-prompt': attributes.prompt }),
      },
      title: {
        default: 'AI Prompt',
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => ({ 'data-title': attributes.title }),
      },
      status: {
        default: 'idle', // 'idle', 'loading', 'success', 'error'
        parseHTML: element => element.getAttribute('data-status'),
        renderHTML: attributes => ({ 'data-status': attributes.status }),
      },
      result: {
        default: null,
        parseHTML: element => element.getAttribute('data-result'),
        renderHTML: attributes => ({ 'data-result': attributes.result }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'ai-prompt', // Custom tag for serialization
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    // Merge node attributes with any passed options
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-prompt': node.attrs.prompt,
      'data-status': node.attrs.status,
      'data-result': node.attrs.result,
    });
    // Render as a div containing the custom tag for clarity, or just the custom tag
    return ['ai-prompt', attrs, 0]; // 0 means no content inside this tag in the ProseMirror model directly
  },

  addNodeView() {
    return ReactNodeViewRenderer(AiPromptComponent);
  },

  addCommands() {
    return {
      setAiPrompt: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});

export default AiPromptNode; 