import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import useDebtTypesFilters from './useDebtTypesFilters';
import { GridSortModel } from '@mui/x-data-grid';

describe('useDebtTypesFilters', () => {
  const mockOnFiltersChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly initialize default filters', () => {
    const { result } = renderHook(() =>
      useDebtTypesFilters({
        initialFilters: {}
      })
    );

    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 10
    });

    expect(result.current.draftFilters).toEqual({
      page: 0,
      size: 10
    });

    expect(result.current.sortModel).toEqual([]);
    expect(result.current.isSearchEnabled).toBe(false);
  });

  it('should update draft filters when updateDraftFilters being called', () => {
    const { result } = renderHook(() =>
      useDebtTypesFilters({
        initialFilters: {}
      })
    );

    act(() => {
      result.current.updateDraftFilters({ description: 'Test Description' });
    });

    expect(result.current.draftFilters).toEqual({
      page: 0,
      size: 10,
      description: 'Test Description'
    });

    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 10
    });

    expect(result.current.isSearchEnabled).toBe(true);
  });

  it('should apply filters and reset page index to 0 when applyFilters being called', () => {
    const { result } = renderHook(() =>
      useDebtTypesFilters({
        initialFilters: { page: 2 },
        onFiltersChange: mockOnFiltersChange
      })
    );

    act(() => {
      result.current.updateDraftFilters({ description: 'Test Description' });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 10,
      description: 'Test Description'
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      description: 'Test Description'
    });
  });

  it('should update pagination when updatePagination being called', () => {
    const { result } = renderHook(() =>
      useDebtTypesFilters({
        initialFilters: {},
        onFiltersChange: mockOnFiltersChange
      })
    );

    act(() => {
      result.current.updatePagination({ page: 3, size: 25 });
    });

    expect(result.current.appliedFilters).toEqual({
      page: 3,
      size: 25
    });

    expect(result.current.draftFilters).toEqual({
      page: 3,
      size: 25
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      page: 3,
      size: 25
    });
  });

  it('should handle sort order correctly', () => {
    const { result } = renderHook(() =>
      useDebtTypesFilters({
        initialFilters: {},
        onFiltersChange: mockOnFiltersChange
      })
    );

    const newSortModel: GridSortModel = [{ field: 'description', sort: 'asc' }];

    act(() => {
      result.current.handleSortModelChange(newSortModel);
    });

    expect(result.current.sortModel).toEqual(newSortModel);

    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 10,
      sort: ['description,asc']
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      sort: ['description,asc']
    });
  });

  it('should handle filters change', () => {
    const { result, rerender } = renderHook(
      (props) => useDebtTypesFilters(props),
      {
        initialProps: {
          initialFilters: { page: 0, size: 10 }
        }
      }
    );

    expect(result.current.appliedFilters).toEqual({
      page: 0,
      size: 10
    });

    rerender({
      initialFilters: { page: 2, size: 20 }
    });

    expect(result.current.appliedFilters).toEqual({
      page: 2,
      size: 20
    });
  });
});
