import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import svgr from 'vite-plugin-svgr';
dotenv.config();

const DEPLOY_PATH = process.env.DEPLOY_PATH || '';
const ENV = process.env.ENV || '';

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
    extensions: ['.ts', '.js', '.mjs', '.json', '.tsx']
  },
  esbuild: {
    loader: 'tsx',
    include: /\.(ts|tsx|js|mjs)$/
  }
});
