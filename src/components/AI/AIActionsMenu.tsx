// Add missing prop definitions for TipTap context
import { Editor } from '@tiptap/react';/**
 * AIActionsMenu.tsx
 * A floating menu for AI actions on selected text
 */

import React from 'react';
import { useAI } from '../../context/AI/AIContext';
import { Sparkles, Layers, ZoomIn, ZoomOut, Edit3, MessageSquare, ArrowRight } from 'lucide-react';

interface AIActionsMenuProps {
  editor: Editor; // Added specific Editor type
  selectedText: string;
  onClose: () => void;
  position?: { x: number; y: number }; // Make position optional
}

interface AIAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: (text: string) => string;
  title: string;
}

const AI_ACTIONS: AIAction[] = [
  {
    id: 'summarize',
    label: 'Summarize',
    icon: <ZoomOut className="h-4 w-4" />,
    prompt: (text) => `Summarize the following text concisely:\n\n${text}`,
    title: 'Summarize'
  },
  {
    id: 'expand',
    label: 'Expand',
    icon: <ZoomIn className="h-4 w-4" />,
    prompt: (text) => `Expand on the following text with more details and examples:\n\n${text}`,
    title: 'Expand'
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: <Layers className="h-4 w-4" />,
    prompt: (text) => `Explain the following text in simpler terms:\n\n${text}`,
    title: 'Explain'
  },
  {
    id: 'rewrite',
    label: 'Rewrite',
    icon: <Edit3 className="h-4 w-4" />,
    prompt: (text) => `Rewrite the following text to improve clarity and flow:\n\n${text}`,
    title: 'Rewrite'
  },
  {
    id: 'continue',
    label: 'Continue',
    icon: <ArrowRight className="h-4 w-4" />,
    prompt: (text) => `Continue the following text with a natural extension:\n\n${text}`,
    title: 'Continue'
  },
  {
    id: 'askAbout',
    label: 'Ask about',
    icon: <MessageSquare className="h-4 w-4" />,
    prompt: (text) => `The following text is selected in my document. Please analyze it and prepare to answer questions about it:\n\n${text}\n\nWhat questions do you have about this text?`,
    title: 'Ask About Selection'
  },
];

const AIActionsMenu: React.FC<AIActionsMenuProps> = ({ 
  editor, 
  selectedText, 
  onClose, 
  position = { x: 0, y: 0 } // Provide default value
}) => {
  const { isGenerating } = useAI();
  
  // Safety check - return null if editor is not defined
  if (!editor) {
    console.error('AIActionsMenu: editor is undefined');
    return null;
  }
  
  // Additional safety check for position
  if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    console.error('AIActionsMenu: Invalid position object', position);
    position = { x: 0, y: 0 };
  }
  
  // Execute an action on the selected text
  const executeAction = (action: AIAction) => {
    if (isGenerating) return;
    
    // Generate the prompt for this action
    const prompt = action.prompt(selectedText);
    
    // Replace the selection with an AI prompt node
    const { state } = editor;
    const { from, to } = state.selection;
    
    editor
      .chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent({
        type: 'aiPrompt',
        attrs: {
          prompt,
          title: action.title,
          status: 'loading',
          result: null
        }
      })
      .run();
    
    // Close the menu
    onClose();
  };
  
  // Additional validation check for selectedText
  if (!selectedText || selectedText.trim() === '') {
    console.warn('AIActionsMenu: No text selected');
    // Return minimal component when no text is selected
    return (
      <div className="ai-actions-menu-error p-2 text-center">
        <span className="text-sm text-red-500">No text selected</span>
        <button 
          onClick={onClose} 
          className="block mx-auto mt-1 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div 
      className="ai-actions-menu absolute z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: 'translateY(-100%)' 
      }}
    >
      <div className="flex items-center justify-center p-2 border-b border-gray-200 dark:border-gray-700">
        <Sparkles className="h-4 w-4 text-purple-500 mr-1" />
        <span className="text-sm font-medium">AI Actions</span>
      </div>
      
      <div className="grid grid-cols-2 gap-1 p-1">
        {AI_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => executeAction(action)}
            disabled={isGenerating}
            className="flex items-center space-x-1 p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
          >
            <span className="text-purple-500">
              {action.icon}
            </span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
      
      <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        Press <kbd className="px-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd> to close
      </div>
    </div>
  );
};

export default AIActionsMenu;
