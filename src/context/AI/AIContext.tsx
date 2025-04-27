/**
 * AIContext.tsx
 * React context provider for AI functionality
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { AIService, AIServiceOptions, AIServiceResponse, AIRequest } from '../../services/ai/AIService';
import { MockAIService } from '../../services/ai/MockAIService';

export interface AISettings {
  enabled: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  autoSuggest: boolean;
  suggestThreshold: number; // 0-1, how confident the AI needs to be to suggest
  showGenerationDetails: boolean;
}

export interface AIInteraction {
  id: string;
  type: 'completion' | 'edit' | 'analysis';
  input: string;
  output: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AIContextValue {
  // AI Service
  aiService: AIService;
  
  // Settings
  settings: AISettings;
  updateSettings: (settings: Partial<AISettings>) => void;
  
  // Interaction history
  history: AIInteraction[];
  clearHistory: () => void;
  
  // AI state
  isGenerating: boolean;
  lastError: Error | null;
  
  // Convenience methods
  generateCompletion: (prompt: string, options?: AIServiceOptions) => Promise<AIServiceResponse>;
  generateEdit: (input: string, instruction: string, options?: AIServiceOptions) => Promise<AIServiceResponse>;
  analyzeText: (content: string, analysisType: string, options?: AIServiceOptions) => Promise<AIServiceResponse>;
  processRequest: (request: AIRequest) => Promise<AIServiceResponse>;
  cancelGeneration: () => void;
}

// Default settings
const DEFAULT_SETTINGS: AISettings = {
  enabled: true,
  model: 'default',
  temperature: 0.7,
  maxTokens: 500,
  autoSuggest: true,
  suggestThreshold: 0.8,
  showGenerationDetails: false
};

// Create the context
export const AIContext = createContext<AIContextValue | null>(null);

// Hook for using the AI context
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
  initialSettings?: Partial<AISettings>;
  customAIService?: AIService;
}

export const AIProvider: React.FC<AIProviderProps> = ({ 
  children, 
  initialSettings,
  customAIService
}) => {
  // Initialize with merged settings
  const [settings, setSettings] = useState<AISettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings
  });
  
  // Initialize AI service
  const [aiService] = useState<AIService>(() => customAIService || new MockAIService({
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens
  }));
  
  // State for AI processing
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  // History of AI interactions
  const [history, setHistory] = useState<AIInteraction[]>([]);
  
  // Update settings
  const updateSettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);
  
  // Generate completion with error handling and history tracking
  const generateCompletion = useCallback(async (
    prompt: string, 
    options?: AIServiceOptions
  ): Promise<AIServiceResponse> => {
    if (!settings.enabled) {
      throw new Error('AI features are disabled');
    }
    
    setIsGenerating(true);
    setLastError(null);
    
    try {
      const mergedOptions = {
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        model: settings.model,
        ...options
      };
      
      const response = await aiService.generateCompletion(prompt, mergedOptions);
      
      // Add to history
      const interaction: AIInteraction = {
        id: Date.now().toString(),
        type: 'completion',
        input: prompt,
        output: response.content,
        timestamp: Date.now(),
        metadata: {
          ...response.metadata,
          options: mergedOptions,
          usage: response.usage
        }
      };
      
      setHistory(prev => [interaction, ...prev]);
      
      return response;
    } catch (error) {
      setLastError(error as Error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [aiService, settings]);
  
  // Generate edit with error handling and history tracking
  const generateEdit = useCallback(async (
    input: string,
    instruction: string,
    options?: AIServiceOptions
  ): Promise<AIServiceResponse> => {
    if (!settings.enabled) {
      throw new Error('AI features are disabled');
    }
    
    setIsGenerating(true);
    setLastError(null);
    
    try {
      const mergedOptions = {
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        model: settings.model,
        ...options
      };
      
      const response = await aiService.generateEdit(input, instruction, mergedOptions);
      
      // Add to history
      const interaction: AIInteraction = {
        id: Date.now().toString(),
        type: 'edit',
        input: `${input} [Instruction: ${instruction}]`,
        output: response.content,
        timestamp: Date.now(),
        metadata: {
          ...response.metadata,
          instruction,
          options: mergedOptions,
          usage: response.usage
        }
      };
      
      setHistory(prev => [interaction, ...prev]);
      
      return response;
    } catch (error) {
      setLastError(error as Error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [aiService, settings]);
  
  // Analyze text with error handling and history tracking
  const analyzeText = useCallback(async (
    content: string,
    analysisType: string,
    options?: AIServiceOptions
  ): Promise<AIServiceResponse> => {
    if (!settings.enabled) {
      throw new Error('AI features are disabled');
    }
    
    setIsGenerating(true);
    setLastError(null);
    
    try {
      const mergedOptions = {
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        model: settings.model,
        ...options
      };
      
      const response = await aiService.analyzeText(content, analysisType, mergedOptions);
      
      // Add to history
      const interaction: AIInteraction = {
        id: Date.now().toString(),
        type: 'analysis',
        input: `[${analysisType}] ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
        output: response.content,
        timestamp: Date.now(),
        metadata: {
          ...response.metadata,
          analysisType,
          options: mergedOptions,
          usage: response.usage
        }
      };
      
      setHistory(prev => [interaction, ...prev]);
      
      return response;
    } catch (error) {
      setLastError(error as Error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [aiService, settings]);
  
  // Process any AI request
  const processRequest = useCallback(async (request: AIRequest): Promise<AIServiceResponse> => {
    if (!settings.enabled) {
      throw new Error('AI features are disabled');
    }
    
    setIsGenerating(true);
    setLastError(null);
    
    try {
      const response = await aiService.processRequest(request);
      
      // Add to history
      const interaction: AIInteraction = {
        id: Date.now().toString(),
        type: request.type,
        input: request.type === 'completion' 
          ? request.prompt 
          : request.type === 'edit'
            ? `${request.input} [${request.instruction}]`
            : request.content,
        output: response.content,
        timestamp: Date.now(),
        metadata: {
          ...response.metadata,
          requestType: request.type,
          usage: response.usage
        }
      };
      
      setHistory(prev => [interaction, ...prev]);
      
      return response;
    } catch (error) {
      setLastError(error as Error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [aiService, settings]);
  
  // Cancel ongoing generation
  const cancelGeneration = useCallback(() => {
    aiService.cancelRequests();
    setIsGenerating(false);
  }, [aiService]);
  
  // Update service options when settings change
  useEffect(() => {
    // This only works directly for MockAIService; 
    // a real service would need proper reconfiguration
    if (aiService instanceof MockAIService) {
      (aiService as any).options = {
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens
      };
    }
  }, [aiService, settings.model, settings.temperature, settings.maxTokens]);
  
  // Memoize the context value to prevent unnecessary rerenders
  const contextValue = useMemo<AIContextValue>(() => ({
    aiService,
    settings,
    updateSettings,
    history,
    clearHistory,
    isGenerating,
    lastError,
    generateCompletion,
    generateEdit,
    analyzeText,
    processRequest,
    cancelGeneration
  }), [
    aiService,
    settings,
    updateSettings,
    history,
    clearHistory,
    isGenerating,
    lastError,
    generateCompletion,
    generateEdit,
    analyzeText,
    processRequest,
    cancelGeneration
  ]);
  
  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};
