/**
 * AISidebar.tsx
 * A collapsible sidebar for AI interactions
 */

import React, { useState } from 'react';
import { useAI } from '../../context/AI/AIContext';
import { ChevronRight, ChevronLeft, MessageSquare, Settings, Zap, X, Sparkles } from 'lucide-react';

// Tab definitions
type TabType = 'chat' | 'actions' | 'settings';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: 'chat', label: 'Chat', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'actions', label: 'Actions', icon: <Zap className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

interface AISidebarProps {
  editor: any; // TipTap Editor instance
}

const AISidebar: React.FC<AISidebarProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const { settings, updateSettings, history, isGenerating, generateCompletion } = useAI();
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: 'Hello! I can help you with your document. What would you like to know or do?' }
  ]);
  
  // Predefined AI actions
  const aiActions = [
    { id: 'summarize', label: 'Summarize selection', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'explain', label: 'Explain selection', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'expand', label: 'Expand selection', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'rewrite', label: 'Rewrite selection', icon: <Sparkles className="h-4 w-4" /> },
  ];
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  // Send chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatInput.trim() || isGenerating) return;
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    try {
      // Get context from editor (current document content)
      const docContent = editor.getHTML();
      
      // Generate AI response
      const response = await generateCompletion(
        `Document context:\n${docContent}\n\nUser: ${chatInput}`,
        { maxTokens: 300 }
      );
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, { role: 'ai', content: response.content }]);
    } catch (error) {
      // Handle error
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error processing your request.' }]);
    }
  };
  
  // Execute AI action on selected text
  const executeAction = async (actionId: string) => {
    const { state } = editor;
    const { from, to } = state.selection;
    const selectedText = state.doc.textBetween(from, to, ' ');
    
    if (!selectedText) {
      alert('Please select text before using this action.');
      return;
    }
    
    let prompt = '';
    
    // Build prompt based on action
    switch (actionId) {
      case 'summarize':
        prompt = `Summarize the following text:\n\n${selectedText}`;
        break;
      case 'explain':
        prompt = `Explain the following text in simpler terms:\n\n${selectedText}`;
        break;
      case 'expand':
        prompt = `Expand on the following text with more details and examples:\n\n${selectedText}`;
        break;
      case 'rewrite':
        prompt = `Rewrite the following text to improve clarity and flow:\n\n${selectedText}`;
        break;
      default:
        return;
    }
    
    // Insert AI prompt node at cursor position
    editor.chain().focus().insertContent({
      type: 'aiPrompt',
      attrs: {
        prompt,
        title: actionId.charAt(0).toUpperCase() + actionId.slice(1),
        status: 'loading',
        result: null
      }
    }).run();
    
    // Close sidebar after action
    setIsOpen(false);
  };
  
  // Update AI settings
  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };
  
  return (
    <div className={`ai-sidebar fixed top-0 right-0 h-full transition-all duration-300 ease-in-out flex z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Toggle button */}
      <button 
        onClick={toggleSidebar}
        className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-l-md"
        aria-label={isOpen ? 'Close AI sidebar' : 'Open AI sidebar'}
      >
        {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
      
      {/* Main sidebar content */}
      <div className="bg-white dark:bg-gray-800 shadow-lg w-80 flex flex-col border-l border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold flex items-center">
            <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
            AI Assistant
          </h2>
          <button 
            onClick={toggleSidebar} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium flex-1 ${
                activeTab === tab.id 
                  ? 'text-purple-600 border-b-2 border-purple-500' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Chat tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg max-w-[90%] ${
                      message.role === 'user' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 ml-auto' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSendMessage} className="mt-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your document..."
                    className="w-full p-2 pr-10 border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                    disabled={isGenerating}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-600 disabled:opacity-50"
                    disabled={!chatInput.trim() || isGenerating}
                  >
                    <Zap className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Actions tab */}
          {activeTab === 'actions' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select text in your document and use these actions to transform it:
              </p>
              
              {aiActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => executeAction(action.id)}
                  className="flex items-center space-x-2 w-full p-3 text-left border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-purple-500">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Settings tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                    className="rounded text-purple-500 focus:ring-purple-500"
                  />
                  <span>Enable AI features</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Toggle all AI functionality on/off
                </p>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Temperature
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Precise</span>
                  <span>{settings.temperature}</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Response Length
                </label>
                <select
                  value={settings.maxTokens}
                  onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value={200}>Short</option>
                  <option value={500}>Medium</option>
                  <option value={1000}>Long</option>
                  <option value={2000}>Very Long</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={settings.autoSuggest}
                    onChange={(e) => handleSettingChange('autoSuggest', e.target.checked)}
                    className="rounded text-purple-500 focus:ring-purple-500"
                  />
                  <span>Enable auto-suggestions</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically suggest completions as you type
                </p>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Model
                </label>
                <select
                  value={settings.model}
                  onChange={(e) => handleSettingChange('model', e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="default">Default</option>
                  <option value="creative">Creative</option>
                  <option value="precise">Precise</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISidebar;
