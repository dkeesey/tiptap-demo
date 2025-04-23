import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Use absolute paths for deployment
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Optimize TipTap dependencies to prevent circular reference issues
  optimizeDeps: {
    include: [
      '@tiptap/core',
      '@tiptap/pm/model',
      '@tiptap/pm/view',
      '@tiptap/pm/state',
      '@tiptap/pm/transform',
      '@tiptap/extension-document',
      '@tiptap/extension-paragraph',
      '@tiptap/extension-text',
    ],
    // Force some dependencies to be pre-bundled to avoid initialization issues
    force: true,
  },
  build: {
    // Improve chunking to avoid circular dependencies
    rollupOptions: {
      output: {
        // Put core TipTap modules in their own chunks
        manualChunks: {
          'tiptap-core': ['@tiptap/core', '@tiptap/react'],
          'tiptap-pm': ['@tiptap/pm/model', '@tiptap/pm/view', '@tiptap/pm/state', '@tiptap/pm/transform'],
          'tiptap-base-extensions': [
            '@tiptap/extension-document',
            '@tiptap/extension-paragraph',
            '@tiptap/extension-text',
          ],
          'tiptap-formatting-extensions': [
            '@tiptap/extension-bold',
            '@tiptap/extension-italic',
            '@tiptap/extension-heading',
          ],
          'tiptap-list-extensions': [
            '@tiptap/extension-bullet-list',
            '@tiptap/extension-ordered-list',
            '@tiptap/extension-list-item',
          ],
        },
      },
    },
    // Increase chunk size limit to prevent splitting core libraries
    chunkSizeWarningLimit: 1000,
  },
})
