import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', 
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      '@tiptap/core',
      '@tiptap/react',
      '@tiptap/starter-kit',
      'yjs',
      'y-websocket'
    ],
    // Reduce pre-bundling force
    force: false,
  },
  build: {
    // Simplify chunk generation
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            '@tiptap/core', 
            '@tiptap/react', 
            '@tiptap/starter-kit'
          ],
          'collaboration': [
            'yjs', 
            'y-websocket'
          ]
        },
      },
    },
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 500,
  }
})