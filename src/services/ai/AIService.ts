/**
 * AIService.ts
 * Defines the interface for AI service providers and common types.
 */

export interface AIServiceOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  context?: string;
}

export interface AIServiceResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIAnalysisResponse {
  analysis: {
    tone?: string;
    readability?: {
      score: number;
      level: string;
    };
    suggestions?: Array<{
      type: string;
      text: string;
      explanation: string;
      replacement?: string;
    }>;
  };
}

export interface AIInteraction {
  id: string;
  prompt: string;
  response: string;
  timestamp: number;
  rating?: 'positive' | 'negative';
}

export interface AISettings {
  provider: 'mock' | 'openai' | 'anthropic' | 'custom';
  model: string;
  temperature: number;
  maxTokens: number;
  responseLength: 'short' | 'medium' | 'long';
}

export interface AIService {
  /**
   * Generate text based on a prompt
   */
  generateCompletion(prompt: string, options?: AIServiceOptions): Promise<AIServiceResponse>;
  
  /**
   * Edit or transform existing text based on instructions
   */
  generateEdit(input: string, instruction: string, options?: AIServiceOptions): Promise<AIServiceResponse>;
  
  /**
   * Analyze text for insights, suggestions, and metrics
   */
  analyzeText(text: string, options?: AIServiceOptions): Promise<AIAnalysisResponse>;
}
