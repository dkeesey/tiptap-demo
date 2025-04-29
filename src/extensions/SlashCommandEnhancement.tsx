import React, { useState, useCallback } from 'react';
import { Editor } from '@tiptap/core';

// Enhanced command execution hook
export const useEnhancedSlashCommands = (editor: Editor) => {
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const executeCommand = useCallback((commandName: string, action: () => void) => {
    try {
      // Apply command
      action();
      
      // Track last executed command
      setLastCommand(commandName);
      
      // Optional: Add a temporary visual indicator
      const commandElement = document.createElement('div');
      commandElement.className = 'command-feedback';
      commandElement.textContent = `Applied: ${commandName}`;
      commandElement.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #3182ce;
        color: white;
        padding: 10px;
        border-radius: 5px;
        animation: commandFeedback 2s ease-out;
        z-index: 1000;
      `;
      
      document.body.appendChild(commandElement);
      
      // Remove feedback element after animation
      setTimeout(() => {
        document.body.removeChild(commandElement);
      }, 2000);

    } catch (error) {
      console.error(`Error executing ${commandName} command:`, error);
    }
  }, [editor]);

  return { executeCommand, lastCommand };
};

// Predefined command map for slash commands
export const createSlashCommandMap = (editor: Editor) => ({
  'Heading 1': () => editor.chain().focus().setNode('heading', { level: 1 }).run(),
  'Heading 2': () => editor.chain().focus().setNode('heading', { level: 2 }).run(),
  'Bullet List': () => editor.chain().focus().toggleBulletList().run(),
  'Numbered List': () => editor.chain().focus().toggleOrderedList().run(),
  'Blockquote': () => editor.chain().focus().toggleBlockquote().run(),
  'Code Block': () => editor.chain().focus().toggleCodeBlock().run(),
  'Horizontal Rule': () => editor.chain().focus().setHorizontalRule().run(),
});

// Enhanced Slash Command Context Provider
export const EnhancedSlashCommandProvider: React.FC<{
  editor: Editor;
  children: React.ReactNode;
}> = ({ editor, children }) => {
  const { executeCommand, lastCommand } = useEnhancedSlashCommands(editor);
  const commandMap = createSlashCommandMap(editor);

  return (
    <div className="enhanced-slash-command-context">
      {React.Children.map(children, child => 
        React.cloneElement(child as React.ReactElement, { 
          executeCommand,
          commandMap,
          lastCommand 
        })
      )}
      
      {/* Global styles for command feedback */}
      <style jsx global>{`
        @keyframes commandFeedback {
          0% { 
            opacity: 0; 
            transform: translateY(20px);
          }
          10% { 
            opacity: 1; 
            transform: translateY(0);
          }
          80% { 
            opacity: 1; 
            transform: translateY(0);
          }
          100% { 
            opacity: 0; 
            transform: translateY(20px);
          }
        }
      `}</style>
    </div>
  );
};