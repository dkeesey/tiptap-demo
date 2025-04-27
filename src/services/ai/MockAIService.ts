/**
 * MockAIService.ts
 * Simulated AI service for development and demonstration purposes.
 */

import { AIService, AIServiceOptions, AIServiceResponse, AIAnalysisResponse } from './AIService';
import { v4 as uuidv4 } from 'uuid';

export class MockAIService implements AIService {
  private getRandomDelay(min: number = 1000, max: number = 3000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  private getReadabilityLevel(score: number): string {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  async generateCompletion(prompt: string, options?: AIServiceOptions): Promise<AIServiceResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.getRandomDelay()));
    
    // Determine response based on prompt type and context
    let content = '';
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('summarize')) {
      content = 'This is a concise summary that captures the essential points while removing unnecessary details. The key ideas have been preserved and presented in a clear, logical flow.';
    } 
    else if (lowerPrompt.includes('expand')) {
      content = 'Here\'s an expanded version with additional context and details:\n\nThe original content has been enriched with supporting information, relevant examples, and deeper explanations. This expansion helps clarify the concepts and provides a more comprehensive understanding of the topic.';
    } 
    else if (lowerPrompt.includes('rewrite')) {
      content = 'Here\'s a rewritten version with improved clarity and flow:\n\nThe content has been restructured to enhance readability while maintaining the original meaning. Sentence structures have been varied, and vocabulary has been refined for better expression.';
    }
    else if (lowerPrompt.includes('explain')) {
      content = 'Let me explain this concept in simpler terms:\n\nThis concept involves several interconnected ideas that build upon each other. At its core, it represents a fundamental approach to solving problems by breaking them down into manageable components.\n\nThe key benefit of this approach is that it makes complex systems more understandable and maintainable.';
    }
    else if (lowerPrompt.includes('code') || lowerPrompt.includes('function')) {
      content = '```javascript\n// Here\'s a sample implementation\nfunction processData(input) {\n  // Initialize results array\n  const results = [];\n  \n  // Process each item in the input\n  for (let i = 0; i < input.length; i++) {\n    // Apply transformation\n    const transformed = transform(input[i]);\n    results.push(transformed);\n  }\n  \n  return results;\n}\n\n// Helper function for transformation\nfunction transform(item) {\n  return {\n    id: item.id,\n    value: item.value * 2,\n    processed: true\n  };\n}\n```';
    }
    else if (lowerPrompt.includes('brainstorm')) {
      content = 'Here are some ideas to consider:\n\n1. Implement a feature that automatically suggests formatting based on content type\n2. Add a document analytics dashboard to track writing metrics\n3. Create a template system for common document types\n4. Integrate with citation management tools for academic writing\n5. Develop a focus mode that hides UI elements during deep writing sessions';
    }
    else {
      content = 'Based on your prompt, here\'s a response that aims to be helpful and relevant. This simulated AI response demonstrates how the system would process natural language queries and generate appropriate content.';
    }
    
    // Add length variation based on responseLength setting
    const length = options?.maxTokens || 150;
    if (length < 100) {
      content = content.split('\n')[0]; // Just first paragraph for short responses
    } else if (length > 200) {
      content += '\n\nFurthermore, this approach can be extended to various domains and applications. When considering implementation details, it\'s important to account for edge cases and optimize for the specific context in which this will be used.';
    }
    
    // Return mock response
    return {
      content,
      usage: {
        promptTokens: Math.floor(prompt.length / 4),
        completionTokens: Math.floor(content.length / 4),
        totalTokens: Math.floor((prompt.length + content.length) / 4)
      }
    };
  }
  
  async generateEdit(input: string, instruction: string, options?: AIServiceOptions): Promise<AIServiceResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.getRandomDelay()));
    
    // Generate edit based on instruction type
    let content = input;
    const lowerInstruction = instruction.toLowerCase();
    
    if (lowerInstruction.includes('simplify') || lowerInstruction.includes('simple')) {
      content = 'This is a simplified version that makes the content easier to understand. Complex ideas have been broken down, and technical jargon has been replaced with more accessible language.';
    }
    else if (lowerInstruction.includes('formal') || lowerInstruction.includes('professional')) {
      content = 'This revision adopts a more formal tone appropriate for professional contexts. The language has been refined to convey authority and precision while maintaining clarity and coherence.';
    }
    else if (lowerInstruction.includes('creative') || lowerInstruction.includes('engaging')) {
      content = 'This creative rewrite brings the content to life with vivid language and engaging phrasing. The message remains intact but is now expressed in a more captivating and memorable way.';
    }
    else if (lowerInstruction.includes('concise') || lowerInstruction.includes('shorter')) {
      content = 'The content has been condensed while preserving essential information. Redundancies and unnecessary elaboration have been removed to create a more direct and efficient message.';
    }
    else {
      content = 'This edited version improves upon the original while following your instructions. The changes enhance the quality of the content while maintaining its core purpose and message.';
    }
    
    // Return mock response
    return {
      content,
      usage: {
        promptTokens: Math.floor((input.length + instruction.length) / 4),
        completionTokens: Math.floor(content.length / 4),
        totalTokens: Math.floor((input.length + instruction.length + content.length) / 4)
      }
    };
  }
  
  async analyzeText(text: string, options?: AIServiceOptions): Promise<AIAnalysisResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.getRandomDelay(1500, 3500)));
    
    // Generate random readability score
    const readabilityScore = Math.floor(Math.random() * 100);
    
    // Generate mock analysis
    return {
      analysis: {
        tone: Math.random() > 0.5 ? 'formal' : 'conversational',
        readability: {
          score: readabilityScore,
          level: this.getReadabilityLevel(readabilityScore)
        },
        suggestions: [
          {
            type: 'clarity',
            text: 'Consider restructuring this sentence for clarity',
            explanation: 'Complex sentence structures can be difficult to follow',
            replacement: 'Try breaking this into two simpler sentences'
          },
          {
            type: 'conciseness',
            text: 'This paragraph could be more concise',
            explanation: 'Some information is repeated or unnecessary',
            replacement: 'Focus on the key points and remove redundancies'
          },
          {
            type: 'word choice',
            text: 'Consider using more precise terminology',
            explanation: 'More specific wording would strengthen your argument',
            replacement: 'Replace general terms with field-specific vocabulary'
          }
        ]
      }
    };
  }
}

// Export a singleton instance
export const mockAIService = new MockAIService();
