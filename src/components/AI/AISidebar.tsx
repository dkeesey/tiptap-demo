/**
 * AISidebar.tsx
 * Provides a collapsible sidebar with AI features for the editor.
 */

import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/core';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  MessageSquare, 
  Wand2, 
  FileText, 
  PenTool, 
  Settings, 
  Info, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check 
} from 'lucide-react';
import { useAI } from '../../context/AI/AIContext';

interface AISidebarProps {
  editor: Editor;
}

const AISidebar: React.FC<AISidebarProps> = ({ editor }) => {
  // Get AI context
  const { 
    aiService, 
    settings, 
    updateSettings, 
    history, 
    addToHistory, 
    rateInteraction, 
    isProcessing, 
    setIsProcessing 
  } = useAI();

  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem('aiSidebarOpen');
    return savedState ? JSON.parse(savedState) : false;
  });
  
  const [activeTab, setActiveTab] = useState<'chat' | 'actions' | 'settings'>('actions');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [responseRating, setResponseRating] = useState<'positive' | 'negative' | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Detect selected text in editor
  const [selectedText, setSelectedText] = useState('');
  
  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('aiSidebarOpen', JSON.stringify(isOpen));
  }, [isOpen]);
  
  // Update selected text when selection changes
  useEffect(() => {
    const updateSelection = () => {
      const selection = editor.state.selection;
      if (selection.empty) {
        setSelectedText('');
      } else {
        const text = editor.state.doc.textBetween(
          selection.from,
          selection.to,
          '\n'
        );
        setSelectedText(text);
      }
    };
    
    // Update on selection change
    editor.on('selectionUpdate', updateSelection);
    
    // Initial update
    updateSelection();
    
    // Cleanup
    return () => {
      editor.off('selectionUpdate', updateSelection);
    };
  }, [editor]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setResponse(null);
    setResponseRating(null);
    
    try {
      // Get context from editor - either selected text or surrounding paragraphs
      const context = selectedText || editor.state.doc.textBetween(0, editor.state.doc.content.size, '\n');
      
      const result = await aiService.generateCompletion(prompt, {
        context,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens
      });
      
      setResponse(result.content);
      addToHistory(prompt, result.content);
      
      // Clear prompt after successful generation
      setPrompt('');
    } catch (error) {
      console.error('Error generating content:', error);
      setResponse('Sorry, there was an error generating content. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const insertContentToEditor = () => {
    if (!response) return;
    
    if (selectedText) {
      // Replace selected text
      editor.chain().focus().deleteSelection().insertContent(response).run();
    } else {
      // Insert at cursor position
      editor.chain().focus().insertContent(response).run();
    }
    
    // Flash success message
    const successMessage = document.createElement('div');
    successMessage.className = 'ai-insert-success';
    successMessage.textContent = 'Content inserted!';
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 2000);
  };

  const handleRating = (id: string, rating: 'positive' | 'negative') => {
    setResponseRating(rating);
    rateInteraction(id, rating);
  };

  const handleCopy = () => {
    if (!response) return;
    
    navigator.clipboard.writeText(response)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy text: ', err));
  };

  const predefinedActions = [
    { 
      name: 'Summarize Selection', 
      icon: <FileText className="w-4 h-4" />,
      description: 'Create a concise summary of selected text',
      action: async () => {
        if (!selectedText) {
          alert('Please select some text first');
          return;
        }
        
        setActiveTab('chat');
        setPrompt('Summarize this text');
        
        // Auto-submit if text is selected
        setIsProcessing(true);
        setResponse(null);
        
        try {
          const result = await aiService.generateCompletion('Summarize this text', {
            context: selectedText,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens
          });
          
          setResponse(result.content);
          addToHistory('Summarize this text', result.content);
        } catch (error) {
          console.error('Error summarizing text:', error);
          setResponse('Sorry, there was an error summarizing the text. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      }
    },
    { 
      name: 'Expand Selection', 
      icon: <PenTool className="w-4 h-4" />,
      description: 'Add more detail to selected text',
      action: async () => {
        if (!selectedText) {
          alert('Please select some text first');
          return;
        }
        
        setActiveTab('chat');
        setPrompt('Expand this text with more details');
        
        // Auto-submit
        setIsProcessing(true);
        setResponse(null);
        
        try {
          const result = await aiService.generateCompletion('Expand this text with more details', {
            context: selectedText,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens
          });
          
          setResponse(result.content);
          addToHistory('Expand this text with more details', result.content);
        } catch (error) {
          console.error('Error expanding text:', error);
          setResponse('Sorry, there was an error expanding the text. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      }
    },
    { 
      name: 'Rewrite Selection', 
      icon: <RefreshCw className="w-4 h-4" />,
      description: 'Rephrase the selected text',
      action: async () => {
        if (!selectedText) {
          alert('Please select some text first');
          return;
        }
        
        setActiveTab('chat');
        setPrompt('Rewrite this text to improve clarity');
        
        // Auto-submit
        setIsProcessing(true);
        setResponse(null);
        
        try {
          const result = await aiService.generateEdit(selectedText, 'Improve clarity and flow');
          
          setResponse(result.content);
          addToHistory('Rewrite this text to improve clarity', result.content);
        } catch (error) {
          console.error('Error rewriting text:', error);
          setResponse('Sorry, there was an error rewriting the text. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      }
    },
    { 
      name: 'Generate Outline', 
      icon: <FileText className="w-4 h-4" />,
      description: 'Create an outline from your document',
      action: async () => {
        const documentText = editor.state.doc.textBetween(0, editor.state.doc.content.size, '\n');
        
        setActiveTab('chat');
        setPrompt('Generate an outline based on this document');
        
        // Auto-submit
        setIsProcessing(true);
        setResponse(null);
        
        try {
          const result = await aiService.generateCompletion('Generate an outline based on this document', {
            context: documentText,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens
          });
          
          setResponse(result.content);
          addToHistory('Generate an outline based on this document', result.content);
        } catch (error) {
          console.error('Error generating outline:', error);
          setResponse('Sorry, there was an error generating the outline. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      }
    },
    { 
      name: 'Brainstorm Ideas', 
      icon: <MessageSquare className="w-4 h-4" />,
      description: 'Generate ideas related to your content',
      action: () => {
        setActiveTab('chat');
        setPrompt('Brainstorm some ideas related to: ');
      }
    },
  ];

  // Render the sidebar content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Chat history */}
              {history.slice(-5).map((item, index) => (
                <div key={item.id} className="space-y-2">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <p className="text-sm font-medium">You:</p>
                    <p className="text-sm">{item.prompt}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <p className="text-sm font-medium">AI:</p>
                    <p className="text-sm">{item.response}</p>
                    
                    {/* Response actions */}
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRating(item.id, 'positive')}
                          className={`p-1 rounded ${item.rating === 'positive' ? 'bg-green-100' : 'hover:bg-gray-200'}`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRating(item.id, 'negative')}
                          className={`p-1 rounded ${item.rating === 'negative' ? 'bg-red-100' : 'hover:bg-gray-200'}`}
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Current response */}
              {response && (
                <div className="space-y-2">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <p className="text-sm font-medium">You:</p>
                    <p className="text-sm">{prompt || 'AI Action'}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <p className="text-sm font-medium">AI:</p>
                    <p className="text-sm whitespace-pre-wrap">{response}</p>
                    
                    {/* Response actions */}
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCopy}
                          className={`p-1 rounded hover:bg-gray-200`}
                          title={copied ? 'Copied!' : 'Copy to clipboard'}
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <button
                        onClick={insertContentToEditor}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Insert into Editor
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading indicator */}
              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handlePromptSubmit}>
                <div className="relative">
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 pr-10 text-sm resize-none"
                    rows={3}
                    placeholder="Ask AI to help with your writing..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !prompt.trim()}
                    className="absolute right-2 bottom-2 p-1 rounded text-white bg-blue-500 disabled:bg-gray-300"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
                {selectedText && (
                  <div className="mt-2 text-xs text-gray-500">
                    Using {selectedText.length} characters of selected text as context
                  </div>
                )}
              </form>
            </div>
          </div>
        );
        
      case 'actions':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-gray-700">AI Actions</h3>
            
            {selectedText ? (
              <div className="mb-4 text-xs text-gray-500">
                {selectedText.length} characters selected
              </div>
            ) : (
              <div className="mb-4 text-xs text-gray-500">
                No text selected. Some actions require selection.
              </div>
            )}
            
            <div className="space-y-2">
              {predefinedActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-start space-x-3"
                >
                  <div className="text-blue-500 mt-0.5">
                    {action.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{action.name}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="p-4 space-y-4">
            <h3 className="font-medium text-gray-700">AI Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Provider
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={settings.provider}
                  onChange={(e) => updateSettings({ provider: e.target.value as any })}
                >
                  <option value="mock">Demo (Simulated)</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="custom">Custom API</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={settings.model}
                  onChange={(e) => updateSettings({ model: e.target.value })}
                >
                  <option value="default">Default</option>
                  <option value="gpt4">GPT-4</option>
                  <option value="claude">Claude 3</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creativity (Temperature)
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.temperature * 100}
                  onChange={(e) => updateSettings({ temperature: Number(e.target.value) / 100 })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Length
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={settings.responseLength}
                  onChange={(e) => {
                    const responseLength = e.target.value as 'short' | 'medium' | 'long';
                    const maxTokens = 
                      responseLength === 'short' ? 100 :
                      responseLength === 'medium' ? 250 :
                      400;
                    updateSettings({ 
                      responseLength,
                      maxTokens
                    });
                  }}
                >
                  <option value="short">Concise</option>
                  <option value="medium">Balanced</option>
                  <option value="long">Detailed</option>
                </select>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`ai-sidebar transition-all duration-300 fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg flex z-10 ${isOpen ? 'translate-x-0 w-72' : 'translate-x-12 w-12'}`}>
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-white p-2 rounded-l-md border border-r-0 border-gray-200 shadow-md"
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      
      {/* When closed, show vertical text */}
      {!isOpen && (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="vertical-text text-gray-700 font-medium">
            AI Assistant
          </div>
        </div>
      )}
      
      {/* Main content when open */}
      {isOpen && (
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-gray-800">AI Assistant</h2>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'chat' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center justify-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'actions' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center justify-center space-x-1">
                <Wand2 className="w-4 h-4" />
                <span>Actions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'settings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center justify-center space-x-1">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </div>
          
          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {renderTabContent()}
          </div>
          
          {/* Footer */}
          <div className="p-2 border-t border-gray-200 flex justify-center">
            <a href="#" className="text-xs text-gray-500 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              <span>About AI Features</span>
            </a>
          </div>
        </div>
      )}
      
      {/* Add CSS for vertical text and success message */}
      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
        }
        
        .ai-insert-success {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #10B981;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          animation: fadeInOut 2s ease-in-out;
          z-index: 9999;
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AISidebar;