import React, { useState, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const AiPromptComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, editor }) => {
  const { prompt, status, result } = node.attrs;
  const [currentPrompt, setCurrentPrompt] = useState(prompt);
  const [isEditing, setIsEditing] = useState(!prompt); // Start editing if no prompt initially

  // Simulate AI processing
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => {
        // Simulate API call result
        const success = Math.random() > 0.2; // 80% success rate
        if (success) {
          updateAttributes({
            status: 'success',
            result: `This is the AI result for: "${currentPrompt}"`, // Placeholder result
          });
        } else {
          updateAttributes({
            status: 'error',
            result: 'Failed to get AI result.',
          });
        }
      }, 2000); // Simulate 2 second loading time
      return () => clearTimeout(timer);
    }
  }, [status, currentPrompt, updateAttributes]);

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
        <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">AI Prompt</span>
        {status !== 'idle' && !isEditing && (
          <div className="flex items-center space-x-1">
            {renderStatusIcon()}
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{status}</span>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            rows={3}
            value={currentPrompt}
            onChange={handlePromptChange}
            placeholder="Enter your AI prompt here..."
          />
          <button
            onClick={handlePromptSubmit}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            disabled={!currentPrompt.trim()}
          >
            Generate
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{prompt}</p>
          {status === 'success' && result && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{result}</p>
            </div>
          )}
          {status === 'error' && result && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-red-600 dark:text-red-400">Error: {result}</p>
            </div>
          )}
          {status !== 'loading' && (
            <button
              onClick={handleEditClick}
              className="mt-2 text-xs text-blue-500 hover:underline"
            >
              Edit Prompt
            </button>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default AiPromptComponent; 