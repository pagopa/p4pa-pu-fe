import '@testing-library/jest-dom/vitest';
import { i18nTestSetup } from './src/__tests__/i18nTestSetup';

beforeEach(() => {
  vi.stubGlobal('fetch', (input: RequestInfo | URL) => {
    throw new Error(`Unmocked fetch: ${String(input)}`);
  });
  vi.stubGlobal(
    'XMLHttpRequest',
    class {
      open(method: string, url: string): void {
        throw new Error(`Unmocked XHR: ${method} ${url}`);
      }
    }
  );
});

i18nTestSetup({});
