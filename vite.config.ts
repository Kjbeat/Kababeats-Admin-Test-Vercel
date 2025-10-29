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
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
