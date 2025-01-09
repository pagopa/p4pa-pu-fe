import { configDefaults, defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
		clearMocks: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'html', 'lcov'],
      reportOnFailure: true,
      exclude: [
        ...configDefaults.exclude,
				'**/*.test.ts?(x)',
				'src/__tests__/',
        'src/stories/',
        'src/index.tsx',
        'src/App.tsx',
        'src/global.d.ts',
        'src/components/Layout.tsx',
        'src/utils/style.tsx',
        'src/models/',
      ],
      include: ['src/**/*.ts?(x)'],
      thresholds: {
        lines: 80,
        branches: 80
      }
    },
  },
});
