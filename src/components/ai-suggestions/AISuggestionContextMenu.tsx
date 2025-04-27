import React, { useState, useRef, useEffect } from 'react';
import { aiService } from './ai-service';

interface AISuggestionContextMenuProps {
  suggestionId: string;
  suggestionText: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export const AISuggestionContextMenu: React.FC<AISuggestionContextMenuProps> = ({
  suggestionId,
  suggestionText,
  position,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleAcceptSuggestion = () => {
    aiService.acceptInlineSuggestion(suggestionId);
    onClose();
  };

  const handleRejectSuggestion = () => {
    aiService.rejectInlineSuggestion(suggestionId);
    onClose();
  };

  const handleGenerateAlternative = () => {
    // Regenerate suggestion with same context
    aiService.triggerInlineSuggestion();
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="inline-ai-suggestion-actions"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div 
        className="inline-ai-suggestion-action"
        onClick={handleAcceptSuggestion}
      >
        Accept Suggestion
      </div>
      <div 
        className="inline-ai-suggestion-action"
        onClick={handleRejectSuggestion}
      >
        Reject Suggestion
      </div>
      <div 
        className="inline-ai-suggestion-action"
        onClick={handleGenerateAlternative}
      >
        Generate Alternative
      </div>
      <div 
        className="inline-ai-suggestion-action text-xs text-gray-500"
        title={suggestionText}
      >
        Show Full Suggestion
      </div>
    </div>
  );
};