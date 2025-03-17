import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      protocol: 'ws',
      timeout: 30000
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});