# AI Features PRD for TipTap Demo

## Overview

This document outlines the AI features to be implemented in the TipTap editor demo for the Wordware interview. These features will demonstrate how AI can be integrated into a rich text editor to enhance the writing and editing experience.

## Background

The TipTap demo is a showcase of a Notion-like editor built with TipTap, a headless rich text editor framework based on ProseMirror. The demo already includes basic text formatting, slash commands, and collaborative editing using Y.js. Adding AI features will enhance the demo and demonstrate understanding of modern AI-enhanced editing experiences.

## Goals

- Implement AI capabilities that feel native to the editing experience
- Showcase practical AI use cases that enhance content creation
- Maintain the clean, intuitive UI of the existing demo
- Complete implementation by April 26, 2025, for presentation on April 28, 2025

## Non-Goals

- Building production-ready AI infrastructure with API key management
- Implementing complex AI models or training custom models
- Creating a commercial-grade AI writing assistant

## User Experience

### AI Prompt Blocks

Users will be able to:

1. Create AI prompt blocks using slash commands (e.g., `/AI Explain`, `/AI Summarize`)
2. Edit prompts and regenerate responses
3. Insert AI-generated content into the document
4. Rate responses as helpful or not helpful

### Inline AI Suggestions

Users will be able to:

1. Trigger inline AI completion with a slash command `/complete`
2. See AI suggestions with subtle styling to differentiate from user content
3. Accept, reject, or modify suggestions
4. Continue generating text from the current cursor position

### Selection-Based AI Actions

Users will be able to:

1. Select text and use slash commands or a context menu to transform it
2. Apply transformations like summarize, expand, rewrite, or explain
3. Preview transformations before applying them
4. Undo transformations if desired

### AI Sidebar

Users will be able to:

1. Open a persistent AI sidebar for more complex interactions
2. Chat with AI about the document content
3. Access predefined AI actions
4. Configure AI settings

## Technical Architecture

### 1. AI Service Layer

```typescript
// src/services/ai/AIService.ts
export interface AIServiceOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIServiceResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIService {
  generateCompletion(prompt: string, options?: AIServiceOptions): Promise<AIServiceResponse>;
  generateEdit(input: string, instruction: string, options?: AIServiceOptions): Promise<AIServiceResponse>;
  analyzeText(text: string): Promise<any>;
}
```

Implementation will include:
- `MockAIService.ts` - For development and demo purposes
- Placeholder for future integration with real AI services

### 2. AI Context Provider

```typescript
// src/context/AI/AIContext.tsx
export const AIContext = createContext<{
  aiService: AIService;
  settings: AISettings;
  updateSettings: (settings: Partial<AISettings>) => void;
  history: AIInteraction[];
}>(null);
```

### 3. TipTap Extensions

Enhancing existing extensions:
- `AiPromptNode.ts` - For block-level AI prompts
- `SlashCommandExtension.ts` - For AI-related slash commands
- New extension for inline suggestions

### 4. React Components

New components:
- `AISidebar.tsx` - Persistent AI sidebar
- `AIActionsMenu.tsx` - Context menu for AI actions
- `InlineAISuggestion.tsx` - For inline AI completions

## Features in Detail

### 1. Enhanced AI Prompt Blocks

Building on existing implementation:
- Add more specialized prompt types
- Improve visual design
- Implement success/error states
- Add ability to save favorite prompts

### 2. Inline AI Suggestions

- Implement `/complete` command
- Create visual styling for AI-suggested text
- Add keyboard shortcuts for accepting/rejecting
- Implement streaming-like typing effect

### 3. Selection-Based AI Actions

- Create context menu for selected text
- Implement common transformations
- Add preview capability
- Support for complex operations like translation

### 4. AI Sidebar

- Implement collapsible sidebar
- Create tabbed interface (Chat, Actions, Settings)
- Build chat-like interface for longer interactions
- Add configuration options

## Implementation Plan

### Phase 1: AI Framework (Due: April 25, 2025)
- [ ] Create AI service abstraction
- [ ] Implement mock AI service
- [ ] Create AI context provider
- [ ] Update AI prompt node

### Phase 2: UI Components (Due: April 25, 2025)
- [ ] Build AI sidebar component
- [ ] Create AI actions menu
- [ ] Implement inline suggestion component

### Phase 3: Feature Integration (Due: April 26, 2025)
- [ ] Enhance slash commands with AI actions
- [ ] Implement selection-based transformations
- [ ] Add keyboard shortcuts
- [ ] Integrate with editor state

### Phase 4: Polish and Documentation (Due: April 27, 2025)
- [ ] Refine UI/UX across all AI features
- [ ] Add loading states and error handling
- [ ] Create documentation and examples
- [ ] Prepare demo script

## Success Metrics

- All features functioning correctly in the demo
- Seamless integration with existing editor capabilities
- Intuitive user experience with clear feedback
- Completed implementation by April 26, 2025, for final testing

## Appendix

### User Flows

1. Creating an AI prompt:
   - User types `/AI`
   - User selects an AI prompt type
   - User enters their prompt and submits
   - AI response is displayed with options to use or regenerate

2. Using inline completion:
   - User types `/complete`
   - AI suggests text inline
   - User presses Tab to accept or Escape to reject

3. Transforming selected text:
   - User selects text
   - User right-clicks or uses the slash command
   - User selects transformation type
   - AI transforms the text
   - User confirms or cancels

### References

- TipTap Documentation: [https://tiptap.dev/docs](https://tiptap.dev/docs)
- ProseMirror Guide: [https://prosemirror.net/docs/guide/](https://prosemirror.net/docs/guide/)
- Notion AI Features: [https://www.notion.so/product/ai](https://www.notion.so/product/ai)
