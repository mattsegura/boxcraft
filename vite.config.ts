import { defineConfig } from 'vite'
import { resolve } from 'path'
import { DEFAULTS } from './shared/defaults'

const clientPort = parseInt(process.env.BOXCRAFT_CLIENT_PORT ?? String(DEFAULTS.CLIENT_PORT), 10)
const serverPort = parseInt(process.env.BOXCRAFT_PORT ?? String(DEFAULTS.SERVER_PORT), 10)

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'shared'),
    },
  },
  define: {
    // Inject default port into frontend at build time
    __BOXCRAFT_DEFAULT_PORT__: serverPort,
  },
  server: {
    port: clientPort,
    proxy: {
      '/ws': {
        target: `ws://localhost:${serverPort}`,
        ws: true,
      },
      '/api': {
        target: `http://localhost:${serverPort}`,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    // Enable minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    cssMinify: true,
    cssCodeSplit: true, // Split CSS per chunk for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js into its own chunk (largest dependency)
          'three': ['three'],
          // Split Tone.js audio library
          'tone': ['tone'],
          // Group UI components together
          'ui': [
            './src/ui/FeedManager',
            './src/ui/VoiceControl',
            './src/ui/Toast',
            './src/ui/TimelineManager',
            './src/ui/KeyboardShortcuts',
            './src/ui/KeybindSettings',
          ],
          // Group modals (lazy loaded)
          'modals': [
            './src/ui/QuestionModal',
            './src/ui/PermissionModal',
            './src/ui/ZoneInfoModal',
            './src/ui/ZoneCommandModal',
            './src/ui/TextLabelModal',
          ],
          // Group scene/entities
          'scene': [
            './src/scene/WorkshopScene',
            './src/entities/AsciiBot',
            './src/entities/SubagentManager',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
