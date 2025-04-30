import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: '0.0.0.0', // Listen on all network interfaces
  },
  build: {
    sourcemap: false, // Disable sourcemaps for production
    minify: true,     // Enable minification
    rollupOptions: {
      input: {
        main: './src/main-railway.tsx', // Use Railway-specific entry point
      },
      output: {
        manualChunks: {
          'tiptap-core': [
            '@tiptap/core',
            '@tiptap/react',
            '@tiptap/starter-kit',
          ],
          'tiptap-extensions': [
            '@tiptap/extension-collaboration',
            '@tiptap/extension-collaboration-cursor',
            '@tiptap/extension-highlight',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-text-align',
            '@tiptap/extension-underline',
          ],
          'yjs': [
            'yjs',
            'y-websocket',
            'y-webrtc',
          ],
          'vendor': [
            'react',
            'react-dom',
          ],
        }
      }
    },
  },
  define: {
    // Environment variables to make available at build time
    'process.env.VITE_RAILWAY_DEPLOYMENT': JSON.stringify('true'),
  },
  optimizeDeps: {
    include: [
      '@tiptap/core',
      '@tiptap/react',
      'yjs',
      'y-websocket',
    ],
    esbuildOptions: {
      target: 'es2020', // Ensure compatibility
    },
  },
})
