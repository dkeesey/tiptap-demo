/**
 * AIContext.tsx
 * Provides AI service and state management for the application.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AIService, AISettings, AIInteraction } from '../../services/ai/AIService';
import { mockAIService } from '../../services/ai/MockAIService';

// Define the context type
interface AIContextType {
  aiService: AIService;
  settings: AISettings;
  updateSettings: (settings: Partial<AISettings>) => void;
  history: AIInteraction[];
  addToHistory: (prompt: string, response: string) => void;
  rateInteraction: (id: string, rating: 'positive' | 'negative') => void;
  clearHistory: () => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

// Create the context with default values
export const AIContext = createContext<AIContextType>({
  aiService: mockAIService,
  settings: {
    provider: 'mock',
    model: 'default',
    temperature: 0.7,
    maxTokens: 150,
    responseLength: 'medium'
  },
  updateSettings: () => {},
  history: [],
  addToHistory: () => {},
  rateInteraction: () => {},
  clearHistory: () => {},
  isProcessing: false,
  setIsProcessing: () => {}
});

// Custom hook for using the AI context
export const useAI = () => useContext(AIContext);

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  // Initialize settings from localStorage or defaults
  const [settings, setSettings] = useState<AISettings>(() => {
    const savedSettings = localStorage.getItem('aiSettings');
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          provider: 'mock',
          model: 'default',
          temperature: 0.7,
          maxTokens: 150,
          responseLength: 'medium'
        };
  });

  // Initialize history from localStorage or empty array
  const [history, setHistory] = useState<AIInteraction[]>(() => {
    const savedHistory = localStorage.getItem('aiHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Track processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('aiSettings', JSON.stringify(settings));
  }, [settings]);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('aiHistory', JSON.stringify(history));
  }, [history]);

  // Update settings
  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  // Add an interaction to history
  const addToHistory = (prompt: string, response: string) => {
    const newInteraction: AIInteraction = {
      id: uuidv4(),
      prompt,
      response,
      timestamp: Date.now()
    };

    setHistory(prevHistory => [...prevHistory, newInteraction]);
  };

  // Rate an interaction
  const rateInteraction = (id: string, rating: 'positive' | 'negative') => {
    setHistory(prevHistory =>
      prevHistory.map(interaction =>
        interaction.id === id
          ? { ...interaction, rating }
          : interaction
      )
    );
  };

  // Clear history
  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your AI interaction history?')) {
      setHistory([]);
    }
  };

  // Determine which AI service to use based on settings
  const getAIService = (): AIService => {
    // For now, always return the mock service
    // In a production app, this would switch between different implementations
    return mockAIService;
  };

  const contextValue: AIContextType = {
    aiService: getAIService(),
    settings,
    updateSettings,
    history,
    addToHistory,
    rateInteraction,
    clearHistory,
    isProcessing,
    setIsProcessing
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};
