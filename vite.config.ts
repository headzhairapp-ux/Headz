import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { runGemini } from './lib/geminiCore';

export default defineConfig(({ mode }) => {
  // Load all env vars (including non-VITE_ ones) for the dev-only API middleware.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      // Dev-only: run /api/gemini locally so `npm run dev` mirrors the Vercel
      // serverless function. Must be registered before spa-fallback so the API
      // path isn't rewritten to index.html.
      {
        name: 'gemini-dev-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.method !== 'POST' || req.url !== '/api/gemini') {
              return next();
            }

            const sendJson = (status: number, body: unknown) => {
              res.statusCode = status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(body));
            };

            const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
              return sendJson(500, {
                error: 'GEMINI_API_KEY is not set in your local .env file.',
              });
            }

            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(chunk as Buffer));
            req.on('end', async () => {
              try {
                const { contents, model } = JSON.parse(
                  Buffer.concat(chunks).toString('utf-8') || '{}'
                );
                if (!contents) {
                  return sendJson(400, {
                    error: 'Missing "contents" in request body.',
                  });
                }
                const result = await runGemini(apiKey, contents, model);
                sendJson(200, result);
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : 'Gemini request failed.';
                sendJson(502, { error: message });
              }
            });
            req.on('error', () => sendJson(400, { error: 'Failed to read request body.' }));
          });
        },
      },
      react(),
      {
        name: 'spa-fallback',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';
            // If URL doesn't have extension, rewrite to / (but never the API).
            if (
              !url.includes('.') &&
              !url.startsWith('/@') &&
              !url.startsWith('/node_modules') &&
              !url.startsWith('/api/')
            ) {
              req.url = '/index.html';
            }
            next();
          });
        },
      },
    ],
    appType: 'spa',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
