import { defineConfig, configDefaults } from 'vitest/config';
import { config } from 'dotenv';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: './vitest.setup.ts',
    environment: 'jsdom',
    clearMocks: true,
    watch: false,
    silent: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'html', 'lcov'],
      reportOnFailure: true,
      exclude: [
        ...configDefaults.exclude,
        '**/*.test.ts?(x)',
        '**/*.styles.ts?(x)',
        'generated/',
        'src/__tests__/',
        'src/index.tsx',
        'src/App.tsx',
        'src/global.d.ts',
        'src/components/Layout.tsx',
        'src/utils/style.tsx',
        'src/models/'
      ],
      include: ['src/**/*.ts?(x)'],
      thresholds: {
        lines: 80,
        branches: 80
      }
    },
    env: {
      ...config({ path: './.env.test' }).parsed
    },
    include: ['**/*.test.ts?(x)']
  },
  build: {
    // sourcemap generation for debugging purposes
    sourcemap: true
  }
});
