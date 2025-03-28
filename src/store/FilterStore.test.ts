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
    selectedFilters.value = [''];
  });

  it('should initialize selectedFilters with an empty string', () => {
    expect(selectedFilters.value).toEqual(['']);
  });

  it('should set selectedFilters to a new state', () => {
    setSelectedFilters(['search', 'name']);
    expect(selectedFilters.value).toEqual(['search', 'name']);
  });

  it('should add a new filter row', () => {
    addFilterRow('search');
    expect(selectedFilters.value).toEqual(['', 'search']);
  });

  it('should add an empty filter row if no nextId is provided', () => {
    addFilterRow();
    expect(selectedFilters.value).toEqual(['', '']);
  });

  it('should remove a filter row by ID', () => {
    setSelectedFilters(['search', 'name']);
    removeFilterRow('search');
    expect(selectedFilters.value).toEqual(['name']);
  });

  it('should not remove the last filter row', () => {
    setSelectedFilters(['search']);
    removeFilterRow('search');
    expect(selectedFilters.value).toEqual(['search']);
  });

  it('should update a filter by index', () => {
    setSelectedFilters(['search', 'name']);
    updateFilter('date', 1);
    expect(selectedFilters.value).toEqual(['search', 'date']);
  });

  it('should remove all filters and reset to initial state', () => {
    setSelectedFilters(['search', 'name', 'date']);
    removeAllFilters();
    expect(selectedFilters.value).toEqual(['']);
  });
});
