/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import {
  canPerformSearch,
  hasPartialDateRangeErrors,
  noFilterSetted,
  shouldShowGeneralError
} from './filtersValidation';

describe('noFilterSetted', () => {
  it('should return true when filters object is empty', () => {
    expect(noFilterSetted({})).toBe(true);
  });

  it('should return true when all string values are empty or whitespace', () => {
    expect(
      noFilterSetted({
        iuv: '',
        iuf: '   '
      })
    ).toBe(true);
  });

  it('should return true when all non-string values are falsy', () => {
    expect(
      noFilterSetted({
        draft: false,
        count: 0,
        active: null
      })
    ).toBe(true);
  });

  it('should return false when at least one string value is not empty', () => {
    expect(
      noFilterSetted({
        name: 'Mario',
        city: ''
      })
    ).toBe(false);
  });

  it('should return false when at least one non-string value is truthy', () => {
    expect(
      noFilterSetted({
        draft: true,
        count: 0
      })
    ).toBe(false);
  });

  it('should handle mixed values correctly', () => {
    expect(
      noFilterSetted({
        name: '',
        city: '  ',
        active: false,
        count: 42
      })
    ).toBe(false);
  });

  it('should return false when date and other filters are correct', () => {
    expect(
      noFilterSetted({
        name: '',
        city: '  ',
        active: false,
        count: 42,
        date: { from: new Date(), to: new Date() }
      })
    ).toBe(false);
  });

  it('should return true when date is not correct', () => {
    expect(
      noFilterSetted({
        name: '',
        city: '  ',
        active: '',
        count: '',
        date: { from: null, to: null }
      })
    ).toBe(true);
  });

  it('should return true when date is not correct (only one date from the range exists)', () => {
    expect(
      noFilterSetted({
        name: '',
        city: '  ',
        active: '',
        count: '',
        date: { from: new Date(), to: null }
      })
    ).toBe(true);
  });

  it('should return true when date is not correct and a value is correct', () => {
    expect(
      noFilterSetted({
        name: '',
        city: '  ',
        active: '',
        count: 42,
        date: { from: new Date(), to: null }
      })
    ).toBe(true);
  });

  it('should return false when a Date object is provided as a direct filter value', () => {
    expect(
      noFilterSetted({
        name: '',
        singleDate: new Date()
      })
    ).toBe(false);
  });

  it('should return true when an invalid Date object is provided as a direct filter value', () => {
    const invalidDate = new Date('invalid-date');
    expect(
      noFilterSetted({
        name: '',
        singleDate: invalidDate
      })
    ).toBe(true);
  });

  it('should handle null filters', () => {
    expect(noFilterSetted(null as any)).toBe(true);
  });

  it('should handle undefined filters', () => {
    expect(noFilterSetted(undefined as any)).toBe(true);
  });
});

describe('canPerformSearch', () => {
  it('should return false when filters object is empty', () => {
    expect(canPerformSearch({})).toBe(false);
  });

  it('should return false when all filters are empty or falsy', () => {
    expect(
      canPerformSearch({
        name: '',
        city: '   ',
        active: false,
        count: 0
      })
    ).toBe(false);
  });

  it('should return true when at least one filter has a valid value', () => {
    expect(
      canPerformSearch({
        name: 'Mario',
        city: ''
      })
    ).toBe(true);
  });

  it('should return true when boolean filter is true', () => {
    expect(
      canPerformSearch({
        active: true,
        count: 0
      })
    ).toBe(true);
  });

  it('should return true when number filter is non-zero', () => {
    expect(
      canPerformSearch({
        active: false,
        count: 5
      })
    ).toBe(true);
  });

  it('should return true when date range is complete', () => {
    expect(
      canPerformSearch({
        name: '',
        date: { from: new Date(), to: new Date() }
      })
    ).toBe(true);
  });

  it('should return false when date range is incomplete', () => {
    expect(
      canPerformSearch({
        name: '',
        date: { from: new Date(), to: null }
      })
    ).toBe(false);
  });
});

describe('hasPartialDateRangeErrors', () => {
  it('should return false when filters object is empty', () => {
    expect(hasPartialDateRangeErrors({})).toBe(false);
  });

  it('should return false when filters is null or undefined', () => {
    expect(hasPartialDateRangeErrors(null as any)).toBe(false);
    expect(hasPartialDateRangeErrors(undefined as any)).toBe(false);
  });

  it('should return true when only partial date range exists (only from)', () => {
    expect(
      hasPartialDateRangeErrors({
        name: '',
        active: false,
        count: 0,
        date: { from: new Date(), to: null }
      })
    ).toBe(true);
  });

  it('should return true when only partial date range exists (only to)', () => {
    expect(
      hasPartialDateRangeErrors({
        name: '',
        active: false,
        count: 0,
        date: { from: null, to: new Date() }
      })
    ).toBe(true);
  });

  it('should return false when date range is complete', () => {
    expect(
      hasPartialDateRangeErrors({
        name: '',
        active: false,
        count: 0,
        date: { from: new Date(), to: new Date() }
      })
    ).toBe(false);
  });

  it('should return true when there are valid non-date filters and partial dates', () => {
    expect(
      hasPartialDateRangeErrors({
        name: 'Mario',
        active: false,
        count: 0,
        date: { from: new Date(), to: null }
      })
    ).toBe(true);
  });

  it('should return true when there are valid boolean filters and partial dates', () => {
    expect(
      hasPartialDateRangeErrors({
        name: '',
        active: true,
        count: 0,
        date: { from: new Date(), to: null }
      })
    ).toBe(true);
  });

  it('should return true when there are valid numeric filters and partial dates', () => {
    expect(
      hasPartialDateRangeErrors({
        name: '',
        active: false,
        count: 42,
        date: { from: new Date(), to: null }
      })
    ).toBe(true);
  });

  it('should return false when both date fields are null', () => {
    expect(
      hasPartialDateRangeErrors({
        name: '',
        active: false,
        count: 0,
        date: { from: null, to: null }
      })
    ).toBe(false);
  });

  it('should ignore error fields in the check', () => {
    expect(
      hasPartialDateRangeErrors({
        name: '',
        active: false,
        count: 0,
        date: { from: new Date(), to: null },
        date_fromError: 'Some error',
        date_toError: 'Another error'
      })
    ).toBe(true);
  });

  it('should return false for keys ending with _fromError even if they have date filter structure', () => {
    expect(
      hasPartialDateRangeErrors({
        name: '',
        date_fromError: { from: new Date(), to: null }
      })
    ).toBe(false);
  });

  it('should return false for keys ending with _toError even if they have date filter structure', () => {
    expect(
      hasPartialDateRangeErrors({
        name: '',
        date_toError: { from: null, to: new Date() }
      })
    ).toBe(false);
  });

  it('should return false for keys ending with _fromError or _toError and ignore them in partial date check', () => {
    expect(
      hasPartialDateRangeErrors({
        name: '',
        date_fromError: { from: new Date(), to: null },
        date_toError: { from: null, to: new Date() },
        otherDate: { from: new Date(), to: new Date() }
      })
    ).toBe(false);
  });
});

describe('shouldShowGeneralError', () => {
  it('should return true when no filters are set', () => {
    expect(shouldShowGeneralError({})).toBe(true);
  });

  it('should return true when all filters are empty/falsy', () => {
    expect(
      shouldShowGeneralError({
        name: '',
        city: '   ',
        active: false,
        count: 0
      })
    ).toBe(true);
  });

  it('should return false when there are valid filters', () => {
    expect(
      shouldShowGeneralError({
        name: 'Mario',
        city: ''
      })
    ).toBe(false);
  });

  it('should return false when there are only partial date range errors', () => {
    expect(
      shouldShowGeneralError({
        name: '',
        active: false,
        count: 0,
        date: { from: new Date(), to: null }
      })
    ).toBe(false);
  });

  it('should return true when no filters are set and no partial date errors', () => {
    expect(
      shouldShowGeneralError({
        name: '',
        active: false,
        count: 0,
        date: { from: null, to: null }
      })
    ).toBe(true);
  });

  it('should return false when date range is complete', () => {
    expect(
      shouldShowGeneralError({
        name: '',
        active: false,
        count: 0,
        date: { from: new Date(), to: new Date() }
      })
    ).toBe(false);
  });

  it('should return true when filters are invalid but not partial date errors', () => {
    expect(
      shouldShowGeneralError({
        name: '   ',
        active: false,
        count: 0
      })
    ).toBe(true);
  });

  it('should handle mixed scenarios with multiple date ranges', () => {
    expect(
      shouldShowGeneralError({
        name: '',
        startDate: { from: new Date(), to: null },
        endDate: { from: null, to: new Date() }
      })
    ).toBe(false);
  });
});
