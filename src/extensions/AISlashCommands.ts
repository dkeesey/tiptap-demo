import { Editor, Range } from '@tiptap/core';
import { 
  Sparkles, 
  MessageSquare, 
  Wand2, 
  Code2, 
  Brain, 
  Languages, 
  PenTool,
  Lightbulb,
  RefreshCw,
  FileText,
  Zap,
  LucideIcon,
  Type
} from 'lucide-react';
import { SlashCommand } from './SlashCommandExtension';
import React from 'react';

export interface AICommandOptions {
  title: string;
  prompt: string;
  status?: 'idle' | 'loading' | 'complete' | 'error';
  result?: string;
}

const createIcon = (Icon: LucideIcon) => React.createElement(Icon, { className: "w-4 h-4" });

export const getAISlashCommands = (editor: Editor): SlashCommand[] => [
  {
    title: 'AI Complete',
    description: 'Continue writing with AI assistance',
    category: 'ai',
    icon: createIcon(Sparkles),
    command: ({ editor, range }) => {
      // Get text before cursor for context
      const { from } = range;
      const text = editor.state.doc.textBetween(Math.max(0, from - 500), from, '\n');
      
      try {
        console.log('[AISlashCommands] Executing AI Complete command');
        editor.chain().focus().deleteRange(range).setAiPrompt({
          title: 'AI Completion',
          prompt: `Continue writing from here:\n\n${text}`,
          status: 'loading'
        }).run();
      } catch (err) {
        console.error('[AISlashCommands] Error executing AI Complete command:', err);
      }
    },
  },
  {
    title: 'AI Chat',
    description: 'Start a conversation with AI',
    category: 'ai',
    icon: createIcon(MessageSquare),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setAiPrompt({
        title: 'AI Chat',
        prompt: 'How can I help you today?',
        status: 'idle'
      }).run();
    },
  },
  {
    title: 'AI Improve',
    description: 'Enhance your writing with AI suggestions',
    category: 'ai',
    icon: createIcon(Wand2),
    command: ({ editor, range }) => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '\n');
      
      editor.chain().focus().deleteRange(range).setAiPrompt({
        title: 'AI Writing Improvement',
        prompt: `Improve this text for clarity and style:\n\n${selectedText || '[Insert text to improve]'}`,
        status: 'idle'
      }).run();
    },
  },
  {
    title: 'AI Code',
    description: 'Get help with coding tasks',
    category: 'ai',
    icon: createIcon(Code2),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setAiPrompt({
        title: 'AI Code Assistant',
        prompt: 'What coding help do you need?',
        status: 'idle'
      }).run();
    },
  },
  {
    title: 'AI Explain',
    description: 'Get an explanation of a concept',
    category: 'ai',
    icon: createIcon(Brain),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setAiPrompt({
        title: 'AI Explanation',
        prompt: 'What would you like me to explain?',
        status: 'idle'
      }).run();
    },
  },
  {
    title: 'AI Translate',
    description: 'Translate text to another language',
    category: 'ai',
    icon: createIcon(Languages),
    command: ({ editor, range }) => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '\n');
      
      editor.chain().focus().deleteRange(range).setAiPrompt({
        title: 'AI Translation',
        prompt: `Translate this text:\n\n${selectedText || '[Insert text to translate]'}\n\nTo language:`,
        status: 'idle'
      }).run();
    },
  },
  {
    title: 'AI Rephrase',
    description: 'Rewrite text in a different style',
    category: 'ai',
    icon: createIcon(PenTool),
    command: ({ editor, range }) => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '\n');
      
      editor.chain().focus().deleteRange(range).setAiPrompt({
        title: 'AI Rephrase',
        prompt: `Rephrase this text in a different style:\n\n${selectedText || '[Insert text to rephrase]'}`,
        status: 'idle'
      }).run();
    },
  },
  {
    title: 'AI Brainstorm',
    description: 'Generate ideas on a topic',
    category: 'ai',
    icon: createIcon(Lightbulb),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setAiPrompt({
        title: 'AI Brainstorming',
        prompt: 'What topic would you like to brainstorm about?',
        status: 'idle'
      }).run();
    },
  },
  {
    title: 'AI Summarize',
    description: 'Create a concise summary',
    category: 'ai',
    icon: createIcon(FileText),
    command: ({ editor, range }) => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '\n');
      
      editor.chain().focus().deleteRange(range).setAiPrompt({
        title: 'AI Summary',
        prompt: `Summarize this text:\n\n${selectedText || '[Insert text to summarize]'}`,
        status: 'idle'
      }).run();
    },
  },
  {
    title: 'AI Expand',
    description: 'Elaborate on a topic or text',
    category: 'ai',
    icon: createIcon(Zap),
    command: ({ editor, range }) => {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, '\n');
      
      editor.chain().focus().deleteRange(range).setAiPrompt({
        title: 'AI Expansion',
        prompt: `Expand on this text with more details and examples:\n\n${selectedText || '[Insert text to expand]'}`,
        status: 'idle'
      }).run();
    },
  },
  {
    title: 'AI Regenerate',
    description: 'Generate a new response',
    category: 'ai',
    icon: createIcon(RefreshCw),
    command: ({ editor, range }) => {
      // Find the nearest AI prompt node and regenerate its content
      const node = editor.state.doc.nodeAt(range.from);
      if (node?.type.name === 'aiPrompt') {
        const { prompt, title } = node.attrs;
        editor.chain().focus().deleteRange(range).setAiPrompt({
          title,
          prompt,
          status: 'loading'
        }).run();
      }
    },
  },
  {
    title: 'AI Inline Complete',
    description: 'Get inline completion suggestions as you type',
    category: 'ai',
    icon: createIcon(Type),
    command: ({ editor, range }) => {
      // Get text before cursor for context
      const { from } = range;
      const text = editor.state.doc.textBetween(Math.max(0, from - 500), from, '\n');
      
      // Mock AI response for demo - in production this would call the AI service
      const mockSuggestion = "This is a sample inline suggestion that demonstrates the typing effect.";
      
      editor.chain()
        .focus()
        .deleteRange(range)
        .showInlineSuggestion({ text: mockSuggestion })
        .run();
    },
  },
]; 