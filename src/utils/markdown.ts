/**
 * Markdown utilities for converting between HTML and Markdown
 */

// We're using html-to-markdown and markdown-it libraries for conversions
import MarkdownIt from 'markdown-it';
import { Editor } from '@tiptap/core';

// Initialize Markdown parser with default options
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
});

/**
 * Convert editor HTML content to Markdown
 */
export const editorToMarkdown = (editor: Editor): string => {
  if (!editor) {
    return '';
  }
  
  // If we're using TurndownService directly
  const html = editor.getHTML();
  
  // We'll use a placeholder implementation here
  // In a real app, you'd use a library like turndown
  let markdown = html
    // Replace h1 tags with markdown equivalent
    .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
    // Replace h2 tags with markdown equivalent
    .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
    // Replace p tags with just their content and newlines
    .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
    // Replace strong/b tags with markdown equivalent
    .replace(/<(strong|b)>(.*?)<\/(strong|b)>/g, '**$2**')
    // Replace em/i tags with markdown equivalent
    .replace(/<(em|i)>(.*?)<\/(em|i)>/g, '*$2*')
    // Replace blockquote
    .replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n\n')
    // Replace ul start
    .replace(/<ul>/g, '')
    // Replace ul end
    .replace(/<\/ul>/g, '\n')
    // Replace ol start
    .replace(/<ol>/g, '')
    // Replace ol end
    .replace(/<\/ol>/g, '\n')
    // Replace li
    .replace(/<li>(.*?)<\/li>/g, '- $1\n')
    // Remove any remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Fix double spaces
    .replace(/\s\s+/g, ' ')
    // Fix multiple newlines
    .replace(/\n\n\n+/g, '\n\n');
    
  return markdown.trim();
};

/**
 * Convert Markdown to HTML for the editor
 */
export const markdownToHtml = (markdown: string): string => {
  if (!markdown) {
    return '';
  }
  
  // Use markdown-it to convert markdown to HTML
  const html = md.render(markdown);
  return html;
};

/**
 * Import Markdown content into the editor
 */
export const importMarkdown = (editor: Editor, markdown: string): void => {
  if (!editor || !markdown) {
    return;
  }
  
  const html = markdownToHtml(markdown);
  editor.commands.setContent(html);
};

/**
 * Export editor content as Markdown
 */
export const exportMarkdown = (editor: Editor): string => {
  if (!editor) {
    return '';
  }
  
  return editorToMarkdown(editor);
};

/**
 * Save Markdown to a file for download
 */
export const downloadMarkdown = (editor: Editor, filename = 'document.md'): void => {
  if (!editor) {
    return;
  }
  
  const markdown = editorToMarkdown(editor);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Read a Markdown file and import its contents
 */
export const readMarkdownFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        resolve(content);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };
    
    reader.readAsText(file);
  });
};