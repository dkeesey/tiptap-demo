/**
 * AiPromptComponent.tsx
 * React component for rendering AI prompts in the editor.
 */

import React, { useState, useEffect, useRef } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Loader2, AlertCircle, CheckCircle, Copy, Check, Trash, Edit3, Sparkles } from 'lucide-react';
import { useAI } from '../../context/AI/AIContext';

const AiPromptComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
  const { prompt, title, status, result } = node.attrs;
  const [currentPrompt, setCurrentPrompt] = useState(prompt);
  const [isEditing, setIsEditing] = useState(!prompt); // Start editing if no prompt initially
  const [copied, setCopied] = useState(false);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Get AI context
  const { aiService, settings, isProcessing, setIsProcessing } = useAI();
  
  // Focus the prompt input when entering edit mode
  useEffect(() => {
    if (isEditing && promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [isEditing]);

  // Process AI prompt when status is 'loading'
  useEffect(() => {
    if (status === 'loading') {
      setIsProcessing(true);
      
      const processPrompt = async () => {
        try {
          // Get context from surrounding content
          const { from, to } = node.pos ? editor.state.doc.resolve(node.pos).blockRange() || { from: 0, to: 0 } : { from: 0, to: 0 };
          const context = editor.state.doc.textBetween(Math.max(0, from - 500), from, '\n') + 
                          editor.state.doc.textBetween(to, Math.min(editor.state.doc.content.size, to + 500), '\n');
          
          // Generate response using AI service
          const response = await aiService.generateCompletion(currentPrompt, {
            context,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens
          });
          
          // Update node with response
          updateAttributes({
            status: 'success',
            result: response.content,
          });
        } catch (error) {
          console.error('Error processing AI prompt:', error);
          updateAttributes({
            status: 'error',
            result: 'Unable to process this request. Please try rephrasing your prompt or try again later.',
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      processPrompt();
    }
  }, [status, currentPrompt, updateAttributes, editor, aiService, settings]);

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentPrompt(event.target.value);
  };

  const handlePromptSubmit = () => {
    if (!currentPrompt.trim()) return;
    updateAttributes({ prompt: currentPrompt, status: 'loading', result: null });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    updateAttributes({ status: 'idle', result: null }); // Reset status on edit
  };
  
  // Handle copying result to clipboard
  const handleCopyClick = () => {
    if (result) {
      navigator.clipboard.writeText(result)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };
  
  // Handle deletion of the node
  const handleDeleteClick = () => {
    if (confirm('Are you sure you want to delete this AI prompt?')) {
      editor.chain().deleteNode('aiPrompt').run();
    }
  };
  
  // For handling keyboard shortcuts in the prompt textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePromptSubmit();
    }
    // Cancel on Escape
    else if (e.key === 'Escape') {
      e.preventDefault();
      if (!prompt) {
        // If there was no original prompt, delete the node on escape
        handleDeleteClick();
      } else {
        // Otherwise revert to the original prompt
        setCurrentPrompt(prompt);
        setIsEditing(false);
      }
    }
  };

  const renderStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <NodeViewWrapper className="ai-prompt-node block my-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 not-prose">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{title || 'AI Prompt'}</span>
        </div>
        <div className="flex items-center space-x-2">
          {status !== 'idle' && !isEditing && (
            <div className={`ai-prompt-status flex items-center text-xs ${
              status === 'loading' ? 'text-blue-500' :
              status === 'error' ? 'text-red-500' :
              'text-green-500'
            }`}>
              {renderStatusIcon()}
              <span className="ml-1 capitalize">{status}</span>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            ref={promptInputRef}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            rows={3}
            value={currentPrompt}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your AI prompt here..."
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Press <kbd className="px-1 bg-gray-200 rounded">Ctrl+Enter</kbd> to generate
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePromptSubmit}
                className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50 flex items-center space-x-1"
                disabled={!currentPrompt.trim()}
              >
                <Sparkles className="h-3 w-3" />
                <span>Generate</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">{prompt}</p>
          
          {status === 'loading' && (
            <div className="flex justify-center items-center py-6 ai-prompt-loading-animation">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Generating response...</span>
            </div>
          )}
          
          {status === 'success' && result && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Response</span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyClick}
                    className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                    title="Copy response"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="ai-prompt-response bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {result}
                </div>
              </div>
            </div>
          )}
          
          {status === 'error' && result && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800/30 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{result}</p>
              </div>
            </div>
          )}
          
          {status !== 'loading' && (
            <div className="ai-prompt-actions flex flex-wrap gap-2 mt-3">
              <button
                onClick={handleEditClick}
                className="flex items-center space-x-1 px-2 py-1 bg-white text-gray-700 border border-gray-300 rounded text-xs hover:bg-gray-50"
              >
                <Edit3 className="h-3 w-3" />
                <span>Edit Prompt</span>
              </button>
              
              <button
                onClick={handleDeleteClick}
                className="flex items-center space-x-1 px-2 py-1 bg-white text-red-600 border border-gray-300 rounded text-xs hover:bg-red-50"
              >
                <Trash className="h-3 w-3" />
                <span>Delete</span>
              </button>
              
              {status === 'success' && (
                <button
                  onClick={() => {
                    updateAttributes({ status: 'loading', result: null });
                  }}
                  className="flex items-center space-x-1 px-2 py-1 bg-white text-purple-600 border border-gray-300 rounded text-xs hover:bg-purple-50 ml-auto"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default AiPromptComponent;