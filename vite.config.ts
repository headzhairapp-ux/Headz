import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          // If URL doesn't have extension, rewrite to /
          if (!url.includes('.') && !url.startsWith('/@') && !url.startsWith('/node_modules')) {
            req.url = '/index.html';
          }
          next();
        });
      }
    }
  ],
  appType: 'spa',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
