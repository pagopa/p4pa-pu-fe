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
    setSelectedFilters(['ACCOUNTING_DATE', 'AMOUNT']);
    expect(selectedFilters.value).toEqual(['ACCOUNTING_DATE', 'AMOUNT']);
  });

  it('should add a new filter row', () => {
    addFilterRow('ACCOUNTING_DATE');
    expect(selectedFilters.value).toEqual(['ACCOUNTING_DATE']);
  });

  it('should remove a filter row by its ID', () => {
    setSelectedFilters(['ACCOUNTING_DATE', 'AMOUNT']);
    removeFilterRow('AMOUNT');
    expect(selectedFilters.value).toEqual(['ACCOUNTING_DATE']);
  });

  it('should remove the last filter row', () => {
    setSelectedFilters(['ACCOUNTING_DATE']);
    removeFilterRow('ACCOUNTING_DATE');
    expect(selectedFilters.value).toEqual(['ACCOUNTING_DATE']);
  });

  it('should update a filter by index', () => {
    setSelectedFilters(['ACCOUNTING_DATE', 'AMOUNT']);
    updateFilter('AMOUNT', 1);
    expect(selectedFilters.value).toEqual(['ACCOUNTING_DATE', 'AMOUNT']);
  });

  it('should remove all filters and reset to initial state', () => {
    setSelectedFilters(['ACCOUNTING_DATE', 'AMOUNT']);
    removeAllFilters();
    expect(selectedFilters.value).toEqual([]);
  });
});
