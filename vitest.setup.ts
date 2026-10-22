import { i18nTestSetup } from './src/__tests__/i18nTestSetup';
import { expect } from 'vitest';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);

i18nTestSetup({});
