import { defineConfig, configDefaults } from 'vitest/config';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const isCI = !!process.env.CI;

export default defineConfig({
  resolve: {
    extensions: ['.ts', '.js', '.mjs', '.json', '.tsx'],
    alias: {
      '@extra': fileURLToPath(new URL('./src/extra', import.meta.url)),
      '@core': fileURLToPath(new URL('./src', import.meta.url)),
      '@generated': fileURLToPath(new URL('./generated', import.meta.url))
    }
  },
  test: {
    bail: isCI ? 1 : 5,
    globals: true,
    setupFiles: './vitest.setup.ts',
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        settings: {
          fetch: {
            disableSameOriginPolicy: true
          }
        }
      }
    },

    clearMocks: true,
    mockReset: false,
    isolate: true,

    watch: false,

    silent: 'passed-only',
    reporters: ['dot'],

    fsModuleCache: true,

    pool: 'forks',
    maxWorkers: isCI ? 2 : '50%',
    coverage: {
      provider: 'v8',
      reporter: isCI ? ['text', 'json-summary', 'lcov'] : ['text'],
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
        global: {
          lines: 80,
          branches: 80
        }
      }
    },
    env: config({ path: './.env.test' }).parsed || {},
    server: {
      deps: {
        inline: [
          /@pagopa\/mui-italia/,
          /@mui\/material/,
          /@mui\/icons-material/
        ]
      }
    },
    include: ['**/*.test.ts?(x)']
  }
});
