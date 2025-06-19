import { describe, it, expect } from 'vitest';
import { noFilterSetted } from './filtersValidation';

describe('noFilterSetted', () => {
  it('should return true when filters object is empty', () => {
    expect(noFilterSetted({})).toBe(true);
  });

  it('should return true when all string values are empty or whitespace', () => {
    expect(
      noFilterSetted({
        iuv: '',
        iuf: '   ',
      })
    ).toBe(true);
  });

  it('should return true when all non-string values are falsy', () => {
    expect(
      noFilterSetted({
        draft: false,
        count: 0,
        active: null,
      })
    ).toBe(true);
  });

  it('should return false when at least one string value is not empty', () => {
    expect(
      noFilterSetted({
        name: 'Mario',
        city: '',
      })
    ).toBe(false);
  });

  it('should return false when at least one non-string value is truthy', () => {
    expect(
      noFilterSetted({
        draft: true,
        count: 0,
      })
    ).toBe(false);
  });

  it('should handle mixed values correctly', () => {
    expect(
      noFilterSetted({
        name: '',
        city: '  ',
        active: false,
        count: 42,
      })
    ).toBe(false);
  });
});
