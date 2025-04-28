/**
 * Helper utilities for TipTap menu functionality
 */

// Helper to check if extension is available in the editor
export const isExtensionAvailable = (editor: any, extensionName: string): boolean => {
  if (!editor || !editor.extensionManager) return false;
  
  return editor.extensionManager.extensions.some(
    (extension: any) => extension.name === extensionName
  );
};

// Format check helpers for bubble menu
export const getInlineFormattingOptions = (editor: any) => {
  return {
    hasBold: isExtensionAvailable(editor, 'bold'),
    hasItalic: isExtensionAvailable(editor, 'italic'),
    hasUnderline: isExtensionAvailable(editor, 'underline'),
    hasHighlight: isExtensionAvailable(editor, 'highlight'),
    hasCode: isExtensionAvailable(editor, 'code'),
    hasLink: isExtensionAvailable(editor, 'link'),
    hasTextAlign: isExtensionAvailable(editor, 'textAlign'),
  };
};

// Format check helpers for floating menu
export const getBlockFormattingOptions = (editor: any) => {
  return {
    hasHeading: isExtensionAvailable(editor, 'heading'),
    hasBulletList: isExtensionAvailable(editor, 'bulletList'),
    hasOrderedList: isExtensionAvailable(editor, 'orderedList'),
    hasBlockquote: isExtensionAvailable(editor, 'blockquote'),
    hasCodeBlock: isExtensionAvailable(editor, 'codeBlock'),
    hasHorizontalRule: isExtensionAvailable(editor, 'horizontalRule'),
    hasTable: isExtensionAvailable(editor, 'table'),
    hasImage: isExtensionAvailable(editor, 'image'),
  };
};

// Helper to conditionally organize buttons into multiple rows for UI clarity
export const organizeButtonsIntoRows = (options: any, rowLength: number = 5) => {
  const availableOptions = Object.entries(options)
    .filter(([_, available]) => available)
    .map(([name]) => name);
  
  const rows = [];
  for (let i = 0; i < availableOptions.length; i += rowLength) {
    rows.push(availableOptions.slice(i, i + rowLength));
  }
  
  return rows;
};
