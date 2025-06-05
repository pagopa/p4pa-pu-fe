import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import useReportingFilters from './useReportingFilters';

describe('useReportingFilters', () => {
  const mockOnFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct filters', () => {
    const { result } = renderHook(() =>
      useReportingFilters({ onFilter: mockOnFilter })
    );

    const filterIds = result.current.filters.map((f) => f.id);
    expect(filterIds).toEqual([
      'iuf',
      'regulationUniqueIdentifier',
      'dateRange',
      'applyFilters'
    ]);
  });

  it('should not include apply button in "grid" layout', () => {
    const { result } = renderHook(() =>
      useReportingFilters({
        onFilter: mockOnFilter,
        layout: 'grid'
      })
    );

    const filterIds = result.current.filters.map((f) => f.id);
    expect(filterIds).toEqual([
      'iuf',
      'regulationUniqueIdentifier',
      'dateRange'
    ]);
    expect(filterIds.includes('applyFilters')).toBe(false);
  });
});
