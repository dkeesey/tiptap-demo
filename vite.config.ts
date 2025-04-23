import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          react: ['react', 'react-dom'],
          
          // TipTap core libraries
          tiptapCore: ['@tiptap/core', '@tiptap/react'],
          
          // TipTap extensions
          tiptapExtensions: [
            '@tiptap/starter-kit',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-underline',
            '@tiptap/extension-text-align',
            '@tiptap/extension-link',
            '@tiptap/extension-image',
            '@tiptap/extension-highlight',
            '@tiptap/extension-bubble-menu',
            '@tiptap/extension-floating-menu',
            '@tiptap/extension-document',
            '@tiptap/extension-paragraph',
            '@tiptap/extension-text'
          ],
          
          // UI components and icons
          lucideIcons: ['lucide-react']
        }
      }
    }
  },
})
