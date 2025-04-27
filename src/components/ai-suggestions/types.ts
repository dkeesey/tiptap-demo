/**
 * Types for AI-powered Inline Suggestions in TipTap Editor
 * 
 * @module AISuggestions
 * @description Provides type definitions for AI suggestion system
 */

import { Editor } from '@tiptap/react';

/**
 * Possible types of AI suggestions
 */
export type SuggestionType = 
  | 'continue'    // Continue the existing text
  | 'rephrase'    // Rephrase the current text
  | 'elaborate'   // Add more details to the current text
  | 'summarize'   // Create a concise summary
  | 'translate';  // Translate the text (optional)

/**
 * Configuration options for AI suggestion generation
 */
export interface AISuggestionOptions {
  /**
   * Context to generate suggestion from
   */
  context?: string;

  /**
   * Type of suggestion to generate
   * @default 'continue'
   */
  suggestionType?: SuggestionType;

  /**
   * Optional language for translation suggestions
   */
  language?: string;
}

/**
 * Inline AI Suggestion data structure
 */
export interface InlineAISuggestion {
  /**
   * Unique identifier for the suggestion
   */
  id: string;

  /**
   * Actual text of the suggestion
   */
  text: string;

  /**
   * Type of suggestion generated
   */
  type: SuggestionType;

  /**
   * Timestamp of suggestion generation
   */
  createdAt: number;

  /**
   * Optional metadata about the suggestion
   */
  metadata?: {
    confidence?: number;
    sourceContext?: string;
  };
}

/**
 * AI Service interface for suggestion generation
 */
export interface AIServiceInterface {
  /**
   * Set the active editor for context-aware suggestions
   * @param editor Current TipTap editor instance
   */
  setActiveEditor(editor: Editor): void;

  /**
   * Toggle inline suggestions on/off
   * @param enabled Whether suggestions are enabled
   */
  toggleInlineSuggestions(enabled: boolean): void;

  /**
   * Generate an inline suggestion
   * @param options Configuration for suggestion generation
   * @returns Promise resolving to suggestion ID or null
   */
  triggerInlineSuggestion(options?: AISuggestionOptions): Promise<string | null>;

  /**
   * Accept a specific inline suggestion
   * @param suggestionId Unique identifier of the suggestion
   * @returns Boolean indicating success
   */
  acceptInlineSuggestion(suggestionId: string): boolean;

  /**
   * Reject a specific inline suggestion
   * @param suggestionId Unique identifier of the suggestion
   * @returns Boolean indicating success
   */
  rejectInlineSuggestion(suggestionId: string): boolean;
}