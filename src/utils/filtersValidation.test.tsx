/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import {
  canPerformSearch,
  hasOnlyPartialDateRangeErrors,
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

describe('hasOnlyPartialDateRangeErrors', () => {
  it('should return false when filters object is empty', () => {
    expect(hasOnlyPartialDateRangeErrors({})).toBe(false);
  });

  it('should return false when filters is null or undefined', () => {
    expect(hasOnlyPartialDateRangeErrors(null as any)).toBe(false);
    expect(hasOnlyPartialDateRangeErrors(undefined as any)).toBe(false);
  });

  it('should return true when only partial date range exists (only from)', () => {
    expect(
      hasOnlyPartialDateRangeErrors({
        name: '',
        active: false,
        count: 0,
        date: { from: new Date(), to: null }
      })
    ).toBe(true);
  });

  it('should return true when only partial date range exists (only to)', () => {
    expect(
      hasOnlyPartialDateRangeErrors({
        name: '',
        active: false,
        count: 0,
        date: { from: null, to: new Date() }
      })
    ).toBe(true);
  });

  it('should return false when date range is complete', () => {
    expect(
      hasOnlyPartialDateRangeErrors({
        name: '',
        active: false,
        count: 0,
        date: { from: new Date(), to: new Date() }
      })
    ).toBe(false);
  });

  it('should return false when there are valid non-date filters', () => {
    expect(
      hasOnlyPartialDateRangeErrors({
        name: 'Mario',
        active: false,
        count: 0,
        date: { from: new Date(), to: null }
      })
    ).toBe(false);
  });

  it('should return false when there are valid boolean filters', () => {
    expect(
      hasOnlyPartialDateRangeErrors({
        name: '',
        active: true,
        count: 0,
        date: { from: new Date(), to: null }
      })
    ).toBe(false);
  });

  it('should return false when there are valid numeric filters', () => {
    expect(
      hasOnlyPartialDateRangeErrors({
        name: '',
        active: false,
        count: 42,
        date: { from: new Date(), to: null }
      })
    ).toBe(false);
  });

  it('should return false when both date fields are null', () => {
    expect(
      hasOnlyPartialDateRangeErrors({
        name: '',
        active: false,
        count: 0,
        date: { from: null, to: null }
      })
    ).toBe(false);
  });

  it('should ignore error fields in the check', () => {
    expect(
      hasOnlyPartialDateRangeErrors({
        name: '',
        active: false,
        count: 0,
        date: { from: new Date(), to: null },
        date_fromError: 'Some error',
        date_toError: 'Another error'
      })
    ).toBe(true);
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
