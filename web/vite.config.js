import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/os-anime/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'force-graph': ['react-force-graph-3d'],
          'three': ['three'],
        }
      }
    }
  }
});
