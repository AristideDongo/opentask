import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:4000';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  server: { port: 5173, proxy: { '/api': { target: apiTarget, changeOrigin: false } } },
  preview: { port: 4173, proxy: { '/api': { target: apiTarget, changeOrigin: false } } },
});
