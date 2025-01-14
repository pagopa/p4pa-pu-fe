import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
dotenv.config();

const DEPLOY_PATH = process.env.DEPLOY_PATH || '';

// https://vite.dev/config/
export default defineConfig({
  base: `${DEPLOY_PATH}`,
  build: {
    target: 'esnext'
  },
  plugins: [react()],
  server: {
    port: 1234,
  },
  define: {
    _global: ({})
  }
  
});
