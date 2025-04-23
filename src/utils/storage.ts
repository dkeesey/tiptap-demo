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
    <p>This is a demonstration of the TipTap editor, a headless rich text editor framework built for modern content creation experiences. Here are some key features implemented in this demo:</p>
    <ul>
      <li><strong>Rich Formatting</strong> - Bold, italic, headings, lists, and blockquotes</li>
      <li><strong>Context Menus</strong> - Bubble menu on selection and floating menu for empty paragraphs</li>
      <li><strong>Markdown Support</strong> - Import and export content in Markdown format</li>
      <li><strong>Automatic Saving</strong> - Content is preserved in localStorage between sessions</li>
    </ul>
    <h2>Try These Features:</h2>
    <p>1. <strong>Select text</strong> to see the bubble menu appear with formatting options</p>
    <p>2. <strong>Click on an empty paragraph</strong> to see the floating menu with block-level options</p>
    <p>3. <strong>Use the toolbar</strong> at the top to format your content with various styles</p>
    <p>4. <strong>Export to Markdown</strong> using the icon in the toolbar to see the markdown version</p>
    <blockquote>This editor was built with TipTap, ProseMirror, React, and Tailwind CSS - demonstrating a modern, component-based approach to content editing.</blockquote>
    <p>Feel free to edit this content and try out the various formatting options. Your changes will be saved automatically.</p>
  `.trim();
};
