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
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js into its own chunk (largest dependency)
          'three': ['three'],
          // Split Tone.js audio library into its own chunk
          'tone': ['tone'],
          // Note: @deepgram/sdk, ws, chokidar are server-side only
        },
      },
      // Enable tree-shaking for better optimization
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Increase chunk size warning limit since we're code-splitting
    chunkSizeWarningLimit: 600,
    // Use esbuild for faster minification (default in Vite)
    minify: 'esbuild',
    cssMinify: true,
  },
})
