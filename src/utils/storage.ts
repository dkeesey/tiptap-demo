/**
 * Helper functions for document storage
 */

// Key used for storing the editor content in localStorage
const STORAGE_KEY = 'tiptap-demo-content';

/**
 * Save content to localStorage
 */
export const saveContent = (content: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, content);
  } catch (error) {
    console.error('Error saving content to localStorage:', error);
  }
};

/**
 * Load content from localStorage
 */
export const loadContent = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error loading content from localStorage:', error);
    return null;
  }
};

/**
 * Clear stored content from localStorage
 */
export const clearContent = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing content from localStorage:', error);
  }
};

/**
 * Default editor content if nothing is stored
 */
export const getDefaultContent = (): string => {
  return `
    <h1>Welcome to the TipTap Editor Demo!</h1>
    <p>This is a demonstration of the TipTap editor, a headless rich text editor framework. Here are some of its features:</p>
    <ul>
      <li>Supports a wide range of formatting options</li>
      <li>Extensible architecture with many available extensions</li>
      <li>Framework-agnostic - works with React, Vue, or vanilla JavaScript</li>
      <li>Customizable UI - you control the look and feel</li>
    </ul>
    <blockquote>Try selecting some text to see the bubble menu, or place your cursor on an empty line to see the floating menu!</blockquote>
    <p>Feel free to edit this content and try out the various formatting options. Your changes will be saved to localStorage.</p>
  `.trim();
};
