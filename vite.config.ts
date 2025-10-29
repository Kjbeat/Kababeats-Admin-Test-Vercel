import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import dotenv from "dotenv";

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port:  Number(process.env.VITE_DEV_SERVER_PORT) || 3001,
    host: true,
    proxy: {
      // Proxy any /api requests to the backend to avoid CORS during local development.
      // Uses VITE_API_URL from env or falls back to localhost:3003.
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
        // Keep the /api prefix; rewrite if your backend expects something different.
        rewrite: (path) => path,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
