import { describe, expect, it, beforeEach } from 'vitest';
import {
  selectedFilters,
  setSelectedFilters,
  addFilterRow,
  removeFilterRow,
  updateFilter,
  removeAllFilters
} from './FilterStore';

describe('FilterStore', () => {
  beforeEach(() => {
    // Reset selectedFilters to its initial value before each test
    selectedFilters.value = [];
  });

  it('should initialize selectedFilters with an empty array', () => {
    expect(selectedFilters.value).toEqual([]);
  });

  it('should set selectedFilters to a new state', () => {
    setSelectedFilters(['ACCOUNTING_DATE_FROM', 'ACCOUNTING_DATE_TO']);
    expect(selectedFilters.value).toEqual([
      'ACCOUNTING_DATE_FROM',
      'ACCOUNTING_DATE_TO'
    ]);
  });

  it('should add a new filter row', () => {
    addFilterRow('ACCOUNTING_DATE_FROM');
    expect(selectedFilters.value).toEqual(['ACCOUNTING_DATE_FROM']);
  });

  it('should remove a filter row by its ID', () => {
    setSelectedFilters(['ACCOUNTING_DATE_FROM', 'ACCOUNTING_DATE_TO']);
    removeFilterRow('ACCOUNTING_DATE_TO');
    expect(selectedFilters.value).toEqual(['ACCOUNTING_DATE_FROM']);
  });

  it('should not remove the last filter row', () => {
    setSelectedFilters(['ACCOUNTING_DATE_FROM']);
    removeFilterRow('ACCOUNTING_DATE_FROM');
    expect(selectedFilters.value).toEqual(['ACCOUNTING_DATE_FROM']);
  });

  it('should update a filter by index', () => {
    setSelectedFilters(['ACCOUNTING_DATE_FROM', 'ACCOUNTING_DATE_TO']);
    updateFilter('ACCOUNTING_DATE_TO', 1);
    expect(selectedFilters.value).toEqual([
      'ACCOUNTING_DATE_FROM',
      'ACCOUNTING_DATE_TO'
    ]);
  });

  it('should remove all filters and reset to initial state', () => {
    setSelectedFilters(['ACCOUNTING_DATE_FROM', 'ACCOUNTING_DATE_TO']);
    removeAllFilters();
    expect(selectedFilters.value).toEqual([]);
  });
});
