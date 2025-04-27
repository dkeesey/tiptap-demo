/**
 * AIActionsMenu.tsx
 * Provides a floating menu for AI actions on selected text.
 */

import React, { useState } from 'react';
import { Editor, posToDOMRect } from '@tiptap/core';
import tippy, { Instance } from 'tippy.js';
import { 
  Sparkles, 
  MessageSquare, 
  FileText, 
  RefreshCw, 
  PenTool,
  Lightbulb,
  Languages
} from 'lucide-react';
import { useAI } from '../../context/AI/AIContext';

interface AIActionsMenuProps {
  editor: Editor;
}

const AIActionsMenu: React.FC<AIActionsMenuProps> = ({ editor }) => {
  const [menuInstance, setMenuInstance] = useState<Instance | null>(null);
  const { aiService, settings } = useAI();

  // Create the menu instance
  React.useEffect(() => {
    // Early exit if editor is not defined
    if (!editor) return;
    
    // Function to create and show the menu
    const showMenu = () => {
      const selection = editor.state.selection;
      
      // Don't show if nothing is selected
      if (selection.empty) return;
      
      // Get the DOM rect for the selection
      const { from, to } = selection;
      const domRect = posToDOMRect(editor.view, from, to);
      
      // Create the menu element
      const element = document.createElement('div');
      element.className = 'ai-actions-menu';
      document.body.appendChild(element);
      
      // Render the menu content
      const instance = tippy(element, {
        getReferenceClientRect: () => domRect,
        appendTo: document.body,
        content: renderMenuContent(),
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'top',
        arrow: true,
        onHide: () => {
          element.remove();
        },
      })[0];
      
      setMenuInstance(instance);
    };
    
    // Register the selection change event
    const handleSelectionChange = () => {
      // Hide any existing menu
      if (menuInstance) {
        menuInstance.hide();
        setMenuInstance(null);
      }
      
      const { empty } = editor.state.selection;
      
      // If something is selected, show the menu after a short delay
      if (!empty) {
        setTimeout(showMenu, 200); // Short delay to prevent flickering
      }
    };
    
    editor.on('selectionUpdate', handleSelectionChange);
    
    return () => {
      editor.off('selectionUpdate', handleSelectionChange);
      
      if (menuInstance) {
        menuInstance.destroy();
      }
    };
  }, [editor, menuInstance]);

  // Function to handle an AI action
  const handleAction = async (action: string) => {
    // Hide the menu
    if (menuInstance) {
      menuInstance.hide();
    }
    
    // Get the selected text
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, '\n');
    
    if (!selectedText) return;
    
    // Insert an AI prompt node based on the action
    switch (action) {
      case 'summarize':
        editor.chain().focus().deleteSelection().setAiPrompt({
          title: 'AI Summarize',
          prompt: `Summarize this text:\n\n${selectedText}`,
          status: 'loading'
        }).run();
        break;
        
      case 'expand':
        editor.chain().focus().deleteSelection().setAiPrompt({
          title: 'AI Expand',
          prompt: `Expand this text with more details:\n\n${selectedText}`,
          status: 'loading'
        }).run();
        break;
        
      case 'rewrite':
        editor.chain().focus().deleteSelection().setAiPrompt({
          title: 'AI Rewrite',
          prompt: `Rewrite this text to improve clarity and style:\n\n${selectedText}`,
          status: 'loading'
        }).run();
        break;
        
      case 'explain':
        editor.chain().focus().deleteSelection().setAiPrompt({
          title: 'AI Explain',
          prompt: `Explain this concept in detail:\n\n${selectedText}`,
          status: 'loading'
        }).run();
        break;
        
      case 'translate':
        editor.chain().focus().deleteSelection().setAiPrompt({
          title: 'AI Translate',
          prompt: `Translate this text to English:\n\n${selectedText}`,
          status: 'loading'
        }).run();
        break;
        
      case 'brainstorm':
        editor.chain().focus().deleteSelection().setAiPrompt({
          title: 'AI Brainstorm',
          prompt: `Brainstorm ideas related to this topic:\n\n${selectedText}`,
          status: 'loading'
        }).run();
        break;
    }
  };

  // Function to render the menu content
  const renderMenuContent = () => {
    const content = document.createElement('div');
    content.className = 'ai-actions-menu-content bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200';
    
    const title = document.createElement('div');
    title.className = 'p-2 bg-purple-50 border-b border-gray-200 flex items-center';
    title.innerHTML = `
      <span class="text-purple-500 mr-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.2 16.9c0.7-0.7 0.7-1.9 0-2.7L16.5 9.5c-0.7-0.7-1.9-0.7-2.7 0L9.9 14.4c-0.7 0.7-0.7 1.9 0 2.7L14.4 21c0.7 0.7 1.9 0.7 2.7 0z"></path>
          <path d="M4.5 4.5 8 8" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M3 12H8" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M4.5 19.5L8 16" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </span>
      <span class="text-sm font-medium text-gray-700">AI Actions</span>
    `;
    
    content.appendChild(title);
    
    // Actions list
    const actions = [
      { id: 'summarize', label: 'Summarize', icon: 'FileText', description: 'Create a concise summary' },
      { id: 'expand', label: 'Expand', icon: 'PenTool', description: 'Add more details and depth' },
      { id: 'rewrite', label: 'Rewrite', icon: 'RefreshCw', description: 'Improve clarity and style' },
      { id: 'explain', label: 'Explain', icon: 'MessageSquare', description: 'Explain this concept' },
      { id: 'translate', label: 'Translate', icon: 'Languages', description: 'Translate to another language' },
      { id: 'brainstorm', label: 'Brainstorm', icon: 'Lightbulb', description: 'Generate related ideas' }
    ];
    
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'p-1';
    
    actions.forEach(action => {
      const button = document.createElement('button');
      button.className = 'w-full text-left p-2 hover:bg-gray-100 rounded flex items-start space-x-2 text-sm';
      
      let iconSvg = '';
      switch (action.icon) {
        case 'FileText':
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>`;
          break;
        case 'PenTool':
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"></path><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="m2 2 7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>`;
          break;
        case 'RefreshCw':
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>`;
          break;
        case 'MessageSquare':
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
          break;
        case 'Languages':
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"></path><path d="m4 14 6-6 2-3"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="m22 22-5-10-5 10"></path><path d="M14 18h6"></path></svg>`;
          break;
        case 'Lightbulb':
          iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>`;
          break;
      }
      
      button.innerHTML = `
        <div class="text-blue-500 mt-0.5">${iconSvg}</div>
        <div>
          <div class="font-medium">${action.label}</div>
          <div class="text-xs text-gray-500">${action.description}</div>
        </div>
      `;
      
      button.addEventListener('click', () => handleAction(action.id));
      
      actionsContainer.appendChild(button);
    });
    
    content.appendChild(actionsContainer);
    
    return content;
  };

  // The component doesn't render anything itself; it just sets up the menu
  return null;
};

export default AIActionsMenu;