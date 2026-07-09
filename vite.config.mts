import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import fs from 'fs';
dotenv.config();

const DEPLOY_PATH = process.env.DEPLOY_PATH || '';
const ENV = process.env.ENV || '';

const extraPath = path.resolve(__dirname, 'src/extra/index.ts');
const hasExtra = fs.existsSync(extraPath);

// https://vite.dev/config/
export default defineConfig({
  base: `${DEPLOY_PATH}`,
  server: {
    port: 1234,
    proxy: {
      '/piattaformaunitaria-legaldocs': {
        target: 'https://p4pa.pagopa.it',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: 'esnext',
    // sourcemap generation for debugging purposes. Please disable in production.
    sourcemap: ENV !== 'PROD'
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: false,
        titleProp: true
      },
      include: '**/*.svg'
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.json', '.tsx'],
    alias: {
      // Dynamic alias: point to extra if exists, otherwise to placeholder
      '@extra': hasExtra
        ? path.resolve(__dirname, 'src/extra')
        : path.resolve(__dirname, 'src/extra-placeholder'),

      // Alias for core modules (optional but recommended)
      '@core': path.resolve(__dirname, 'src')
    }
  },
  esbuild: {
    loader: 'tsx',
    include: /\.(ts|tsx|js|mjs)$/
  }
});
