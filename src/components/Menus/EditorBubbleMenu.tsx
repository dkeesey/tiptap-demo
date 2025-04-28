import React, { useEffect } from 'react'
import { BubbleMenu, Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2
} from 'lucide-react'
import { cn } from '../../utils/classnames'
import { microInteractions } from '../../utils/micro-interactions'
import { debugLog, DebugChannels } from '../../utils/debug-logger'

interface EditorBubbleMenuProps {
  editor: Editor
}

const EditorBubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
  useEffect(() => {
    // Add event listeners to track selection changes
    const handleSelectionChange = () => {
      const { selection } = editor.state;
      
      // Use debug logger utility for cleaner logging
      debugLog(DebugChannels.BUBBLE_MENU, 'Selection change:', {
        from: selection.from,
        to: selection.to,
        empty: selection.empty,
        selectedText: selection.empty 
          ? 'N/A' 
          : editor.state.doc.textBetween(selection.from, selection.to, ' ').trim()
      });
    };

    // Add listeners to track selection events
    editor.on('selectionUpdate', handleSelectionChange);

    return () => {
      // Clean up listener
      editor.off('selectionUpdate', handleSelectionChange);
    };
  }, [editor]);

  if (!editor) {
    return null
  }

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ 
        duration: 100,
        placement: 'top',
        offset: [0, 10],
      }}
      className="bg-white shadow-lg border border-gray-200 rounded-md p-1 flex items-center gap-1 z-50"
      shouldShow={({ editor, state }) => {
        const { selection } = state;
        const { from, to } = selection;

        // Use the debug logger utility
        debugLog(DebugChannels.BUBBLE_MENU, 'Bubble Menu Visibility Check:', {
          from,
          to,
          empty: from === to,
          selectedText: from === to 
            ? 'N/A' 
            : editor.state.doc.textBetween(from, to, ' ').trim(),
          isActive: editor.isActive('paragraph') || editor.isActive('heading')
        });

        // Comprehensive check for showing the bubble menu
        // Multiple conditions must be met:
        
        // 1. Must have actual text selection (not just cursor placement)
        const hasSelection = from !== to;
        
        // 2. Selected text must not be empty after trimming
        const selectedText = hasSelection ? editor.state.doc.textBetween(from, to, ' ').trim() : '';
        const hasNonEmptySelection = selectedText.length > 0;
        
        // 3. Selection must be within paragraph or heading nodes
        const isInSupportedNode = editor.isActive('paragraph') || editor.isActive('heading');
        
        // 4. Prevent showing when selecting across node boundaries or complex selections
        const isSingleLineSelection = !selectedText.includes('\n');
        
        // Return true only if all conditions are met
        return hasSelection && 
               hasNonEmptySelection && 
               isInSupportedNode && 
               isSingleLineSelection;
      }}
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive('bold') 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Bold"
      >
        <Bold size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive('italic') 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Italic"
      >
        <Italic size={14} />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-0.5"></div>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive('heading', { level: 1 }) 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Heading 1"
      >
        <Heading1 size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive('heading', { level: 2 }) 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </button>
    </BubbleMenu>
  );
};

export default EditorBubbleMenu;