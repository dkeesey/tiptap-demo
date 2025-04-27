/**
 * AIService.ts
 * Defines the interface for AI service operations
 */

export interface AIServiceOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AIServiceResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface AICompletion {
  type: 'completion';
  prompt: string;
  options?: AIServiceOptions;
}

export interface AIEdit {
  type: 'edit';
  input: string;
  instruction: string;
  options?: AIServiceOptions;
}

export interface AIAnalysis {
  type: 'analysis';
  content: string;
  analysisType: 'sentiment' | 'entities' | 'summary' | 'keywords' | 'custom';
  options?: AIServiceOptions & {
    customInstructions?: string;
  };
}

export type AIRequest = AICompletion | AIEdit | AIAnalysis;

export interface AIService {
  /**
   * Generate text completion from a prompt
   */
  generateCompletion: (prompt: string, options?: AIServiceOptions) => Promise<AIServiceResponse>;
  
  /**
   * Generate an edited version of text based on an instruction
   */
  generateEdit: (input: string, instruction: string, options?: AIServiceOptions) => Promise<AIServiceResponse>;
  
  /**
   * Analyze text content and return structured information
   */
  analyzeText: (content: string, analysisType: string, options?: AIServiceOptions) => Promise<AIServiceResponse>;
  
  /**
   * Process any AI request and return a response
   */
  processRequest: (request: AIRequest) => Promise<AIServiceResponse>;
  
  /**
   * Cancel any pending requests
   */
  cancelRequests: () => void;
  
  /**
   * Check if the service is available
   */
  isAvailable: () => Promise<boolean>;
  
  /**
   * Get service capabilities
   */
  getCapabilities: () => {
    supportsStreaming: boolean;
    supportedModels: string[];
    maxTokens: number;
    supportedAnalysisTypes: string[];
  };
}

/**
 * Base AI service implementation with shared functionality
 */
export abstract class BaseAIService implements AIService {
  protected options: AIServiceOptions;
  protected pendingRequests: AbortController[] = [];
  
  constructor(options?: AIServiceOptions) {
    this.options = {
      model: 'default',
      temperature: 0.7,
      maxTokens: 500,
      ...options
    };
  }
  
  abstract generateCompletion(prompt: string, options?: AIServiceOptions): Promise<AIServiceResponse>;
  abstract generateEdit(input: string, instruction: string, options?: AIServiceOptions): Promise<AIServiceResponse>;
  abstract analyzeText(content: string, analysisType: string, options?: AIServiceOptions): Promise<AIServiceResponse>;
  
  async processRequest(request: AIRequest): Promise<AIServiceResponse> {
    switch (request.type) {
      case 'completion':
        return this.generateCompletion(request.prompt, request.options);
      case 'edit':
        return this.generateEdit(request.input, request.instruction, request.options);
      case 'analysis':
        return this.analyzeText(
          request.content, 
          request.analysisType,
          request.options
        );
      default:
        throw new Error(`Unsupported request type: ${(request as any).type}`);
    }
  }
  
  cancelRequests(): void {
    this.pendingRequests.forEach(controller => {
      try {
        controller.abort();
      } catch (e) {
        console.error('Error aborting request:', e);
      }
    });
    this.pendingRequests = [];
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      await this.generateCompletion('test', { maxTokens: 5 });
      return true;
    } catch (e) {
      return false;
    }
  }
  
  getCapabilities() {
    return {
      supportsStreaming: false,
      supportedModels: ['default'],
      maxTokens: 2048,
      supportedAnalysisTypes: ['sentiment', 'summary']
    };
  }
  
  protected createAbortController(): AbortController {
    const controller = new AbortController();
    this.pendingRequests.push(controller);
    return controller;
  }
  
  protected removeAbortController(controller: AbortController): void {
    this.pendingRequests = this.pendingRequests.filter(c => c !== controller);
  }
}
