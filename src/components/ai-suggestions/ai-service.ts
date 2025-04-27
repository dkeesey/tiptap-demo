import { v4 as uuidv4 } from 'uuid';

export interface AIServiceOptions {
  apiKey?: string;
  model?: string;
}

export class AIService {
  private apiKey: string;
  private model: string;
  private activeEditor: any; // Reference to TipTap editor instance
  private suggestionsEnabled: boolean = true;

  constructor(options: AIServiceOptions = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = options.model || 'gpt-3.5-turbo';
  }

  // Set the active editor for context-aware suggestions
  setActiveEditor(editor: any) {
    this.activeEditor = editor;
  }

  // Toggle inline suggestions on/off
  toggleInlineSuggestions(enabled: boolean = true) {
    this.suggestionsEnabled = enabled;
  }

  // Trigger inline suggestion generation
  async triggerInlineSuggestion(options: {
    context?: string;
    suggestionType?: 'continue' | 'rephrase' | 'elaborate';
  } = {}) {
    if (!this.suggestionsEnabled || !this.activeEditor) return null;

    const { 
      context = this.getEditorContext(),
      suggestionType = 'continue' 
    } = options;

    try {
      const suggestion = await this.generateInlineSuggestion(context, suggestionType);
      
      if (suggestion) {
        const suggestionId = uuidv4();
        
        // Use the editor's commands to add the inline AI suggestion
        this.activeEditor.commands.addInlineAISuggestion({
          id: suggestionId,
          text: suggestion,
          type: suggestionType
        });

        return suggestionId;
      }
    } catch (error) {
      console.error('Inline AI Suggestion Error:', error);
    }

    return null;
  }

  // Get context around current selection
  private getEditorContext(charRadius: number = 500): string {
    if (!this.activeEditor) return '';

    const { from, to } = this.activeEditor.state.selection;
    const doc = this.activeEditor.state.doc;

    // Extract context around current selection
    const start = Math.max(0, from - charRadius);
    const end = Math.min(doc.content.size, to + charRadius);

    return doc.textBetween(start, end, ' ');
  }

  // Generate inline suggestion using AI
  private async generateInlineSuggestion(
    context: string, 
    suggestionType: string
  ): Promise<string | null> {
    // Mock implementation - replace with actual AI service call
    const aiPrompts = {
      'continue': `Continue this text naturally: ${context}`,
      'rephrase': `Rephrase this text more eloquently: ${context}`,
      'elaborate': `Provide more details and elaborate on: ${context}`
    };

    // In a real implementation, this would call OpenAI/Claude API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`AI Suggestion: ${aiPrompts[suggestionType]}`);
      }, 500);
    });
  }

  // Accept or reject an inline suggestion
  acceptInlineSuggestion(suggestionId: string) {
    if (!this.activeEditor) return false;

    // Replace the suggestion with its text
    this.activeEditor.commands.removeInlineAISuggestion(suggestionId);
    
    return true;
  }

  rejectInlineSuggestion(suggestionId: string) {
    if (!this.activeEditor) return false;

    // Simply remove the suggestion
    this.activeEditor.commands.removeInlineAISuggestion(suggestionId);
    
    return true;
  }
}

// Export a singleton instance
export const aiService = new AIService();