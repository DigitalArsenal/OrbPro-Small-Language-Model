import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [wasm()],
  resolve: {
    // Follow symlinks in public/models
    preserveSymlinks: false,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm'],
  },
  define: {
    CESIUM_BASE_URL: JSON.stringify('/Cesium'),
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
    fs: {
      // Allow serving files from symlinked model directory
      allow: ['.', 'mlc-models'],
      strict: false,
    },
  },
});
