import { configDefaults, defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
		clearMocks: true,
    environment: 'jsdom',
  },
});
