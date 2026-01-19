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
  optimizeDeps: {
    // Pre-bundle these dependencies for faster loading
    include: ['three', 'tone'],
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
    sourcemap: false, // Disable sourcemaps in production for faster loading
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js into separate chunk (largest dependency)
          'three': ['three'],
          // Split Tone.js audio library into separate chunk
          'tone': ['tone'],
          // Split vendor dependencies
          'vendor': ['@deepgram/sdk'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
