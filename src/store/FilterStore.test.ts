import { describe, expect, it, beforeEach } from 'vitest';
import {
  filtersState,
  setFiltersState,
  addFilterRow,
  removeFilterRow,
  updateFilter,
  removeAllFilters,
} from './FilterStore';

describe('FilterStore', () => {
  beforeEach(() => {
    // Reset filtersState to its initial value before each test
    filtersState.value = [''];
  });

  it('should initialize filtersState with an empty string', () => {
    expect(filtersState.value).toEqual(['']);
  });

  it('should set filtersState to a new state', () => {
    setFiltersState(['search', 'name']);
    expect(filtersState.value).toEqual(['search', 'name']);
  });

  it('should add a new filter row', () => {
    addFilterRow('search');
    expect(filtersState.value).toEqual(['', 'search']);
  });

  it('should add an empty filter row if no nextId is provided', () => {
    addFilterRow();
    expect(filtersState.value).toEqual(['', '']);
  });

  it('should remove a filter row by ID', () => {
    setFiltersState(['search', 'name']);
    removeFilterRow('search');
    expect(filtersState.value).toEqual(['name']);
  });

  it('should not remove the last filter row', () => {
    setFiltersState(['search']);
    removeFilterRow('search');
    expect(filtersState.value).toEqual(['search']);
  });

  it('should update a filter by index', () => {
    setFiltersState(['search', 'name']);
    updateFilter('date', 1);
    expect(filtersState.value).toEqual(['search', 'date']);
  });

  it('should remove all filters and reset to initial state', () => {
    setFiltersState(['search', 'name', 'date']);
    removeAllFilters();
    expect(filtersState.value).toEqual(['']);
  });
});
