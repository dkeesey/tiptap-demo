import React, { useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/core';
import '../styles/inline-suggestions.css';

interface InlineSuggestionsProps {
  editor: Editor;
}

export const InlineSuggestions: React.FC<InlineSuggestionsProps> = ({ editor }) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check for cmd/ctrl + enter to accept suggestion
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === 'Enter' &&
        editor.can().acceptInlineSuggestion()
      ) {
        event.preventDefault();
        editor.commands.acceptInlineSuggestion();
      }

      // Check for escape to reject suggestion
      if (event.key === 'Escape' && editor.can().rejectInlineSuggestion()) {
        event.preventDefault();
        editor.commands.rejectInlineSuggestion();
      }
    },
    [editor]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // This component doesn't render anything visible
  // It just handles keyboard events
  return null;
};

export default InlineSuggestions; 