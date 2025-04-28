import React, { useEffect } from 'react'
import { BubbleMenu, Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Code, 
  Highlighter, 
  AlignLeft, 
  AlignCenter, 
  AlignRight
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
      className="bg-white shadow-lg border border-gray-200 rounded-md p-1 flex flex-col z-50"
      shouldShow={({ editor, state }) => {
        const { selection } = state;
        const { from, to } = selection;

        // Only log in debug mode to reduce console noise
        debugLog(DebugChannels.BUBBLE_MENU, 'Bubble Menu Visibility Check:', {
          from,
          to,
          selectionLength: to - from,
          hasSelection: from !== to,
          selectedText: from === to 
            ? 'N/A' 
            : editor.state.doc.textBetween(from, to, ' ').trim()
        });

        // Simple, clear conditions for showing bubble menu
        // 1. Must have a text selection (not just a cursor)
        const hasTextSelection = from !== to;
        
        // 2. Selection must not be empty
        const hasNonEmptySelection = editor.state.doc.textBetween(from, to, ' ').trim().length > 0;
        
        // 3. Ensure we're in an editable text node
        const isInEditableNode = true; // Always assume editable for simplicity
        
        // Combine conditions
        const shouldShowMenu = hasTextSelection && hasNonEmptySelection && isInEditableNode;

        debugLog(DebugChannels.BUBBLE_MENU, 'Bubble Menu Decision:', {
          hasTextSelection,
          hasNonEmptySelection,
          isInEditableNode,
          finalDecision: shouldShowMenu
        });

        return shouldShowMenu;
      }}
    >
      <div className="px-2 py-1 text-xs font-medium text-gray-500 border-b border-gray-200 mb-1">
        Text Formatting
      </div>
      <div className="flex items-center gap-1 p-1">
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

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive('underline') 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Underline"
      >
        <Underline size={14} />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-0.5"></div>

      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive('highlight') 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Highlight"
      >
        <Highlighter size={14} />
      </button>

      <button
        onClick={() => {
          const url = window.prompt('Enter link URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive('link') 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Link"
      >
        <Link size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive('code') 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Inline Code"
      >
        <Code size={14} />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-0.5"></div>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive({ textAlign: 'left' }) 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Align Left"
      >
        <AlignLeft size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive({ textAlign: 'center' }) 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Align Center"
      >
        <AlignCenter size={14} />
      </button>

      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={cn(
          'editor-bubble-menu-button p-1.5 rounded',
          microInteractions.button,
          editor.isActive({ textAlign: 'right' }) 
            ? 'bg-gray-100 text-black' 
            : 'text-gray-600 hover:bg-gray-50'
        )}
        title="Align Right"
      >
        <AlignRight size={14} />
      </button>
      </div>
    </BubbleMenu>
  );
};

export default EditorBubbleMenu;