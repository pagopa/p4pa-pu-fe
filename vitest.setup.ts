import { i18nTestSetup } from './src/__tests__/i18nTestSetup';
import * as matchers from 'vitest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

i18nTestSetup({});
