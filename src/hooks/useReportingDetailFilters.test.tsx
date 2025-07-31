/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import { useReportingDetailFilters } from './useReportingDetailFilters';

vi.mock('./usePaginationState', () => {
  let mockPaginationParams = { page: 0, size: 10 };
  let mockSetPaginationParams: any;

  return {
    usePaginationState: vi.fn(() => {
      mockSetPaginationParams = vi.fn((updaterOrValue: any) => {
        if (typeof updaterOrValue === 'function') {
          mockPaginationParams = updaterOrValue(mockPaginationParams);
        } else {
          mockPaginationParams = updaterOrValue;
        }
      });

      return {
        paginationParams: mockPaginationParams,
        handlePaginationChange: vi.fn((newPagination: any) => {
          mockPaginationParams = newPagination;
        }),
        setPaginationParams: mockSetPaginationParams
      };
    })
  };
});

describe('useReportingDetailFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useReportingDetailFilters());

    expect(result.current.appliedFilters.page).toBe(0);
    expect(result.current.appliedFilters.size).toBe(10);
    expect(result.current.appliedFilters.iuv).toBeUndefined();
    expect(result.current.appliedFilters.payDateFrom).toBeUndefined();
    expect(result.current.appliedFilters.payDateTo).toBeUndefined();
  });

  it('initializes with custom initial filters', () => {
    const initialFilters = {
      page: 1,
      size: 20,
      iuv: 'test-iuv',
      payDateFrom: '2023-01-01',
      payDateTo: '2023-12-31'
    };

    const { result } = renderHook(() =>
      useReportingDetailFilters({ initialFilters })
    );

    expect(result.current.appliedFilters).toEqual(
      expect.objectContaining({
        iuv: 'test-iuv',
        payDateFrom: '2023-01-01',
        payDateTo: '2023-12-31'
      })
    );
  });

  it('updates draft filters correctly', () => {
    const { result } = renderHook(() => useReportingDetailFilters());

    act(() => {
      result.current.updateDraftFilters({ iuv: 'new-iuv' });
    });

    expect(result.current.draftFilters.iuv).toBe('new-iuv');
    expect(result.current.appliedFilters.iuv).toBeUndefined();
  });

  it('cleans empty string values in draft filters', () => {
    const { result } = renderHook(() => useReportingDetailFilters());

    act(() => {
      result.current.updateDraftFilters({ iuv: '' });
    });

    expect(result.current.draftFilters.iuv).toBeUndefined();
  });

  it('applies filters and resets page', () => {
    const mockOnFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useReportingDetailFilters({
        initialFilters: { page: 5, size: 10 },
        onFiltersChange: mockOnFiltersChange
      })
    );

    act(() => {
      result.current.updateDraftFilters({ iuv: 'test-iuv' });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters.iuv).toBe('test-iuv');

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        iuv: 'test-iuv',
        page: 0,
        size: 10
      })
    );
  });

  it('trims IUV value when applying filters', () => {
    const { result } = renderHook(() => useReportingDetailFilters());

    act(() => {
      result.current.updateDraftFilters({ iuv: '  test-iuv  ' });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters.iuv).toBe('test-iuv');
  });

  it('handles date changes correctly', () => {
    const { result } = renderHook(() => useReportingDetailFilters());

    act(() => {
      const testDate = new Date('2023-06-15T12:00:00');
      result.current.handleDateFromChange(testDate);
    });

    expect(result.current.draftFilters.payDateFrom).toBe('2023-06-15');

    act(() => {
      const testDate = new Date('2023-12-31T23:59:59');
      result.current.handleDateToChange(testDate);
    });

    expect(result.current.draftFilters.payDateTo).toBe('2023-12-31');
  });

  it('handles null date changes correctly', () => {
    const { result } = renderHook(() => useReportingDetailFilters());

    act(() => {
      result.current.updateDraftFilters({
        payDateFrom: '2023-01-01',
        payDateTo: '2023-12-31'
      });
    });

    act(() => {
      result.current.handleDateFromChange(null);
      result.current.handleDateToChange(null);
    });

    expect(result.current.draftFilters.payDateFrom).toBeUndefined();
    expect(result.current.draftFilters.payDateTo).toBeUndefined();
  });

  it('detects active filters correctly', () => {
    const { result } = renderHook(() => useReportingDetailFilters());

    expect(result.current.hasActiveFilters()).toBe(false);

    act(() => {
      result.current.updateDraftFilters({ iuv: 'test-iuv' });
    });

    expect(result.current.hasActiveFilters()).toBe(true);

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.hasActiveFilters()).toBe(false);
  });

  it('detects active filters for date changes', () => {
    const { result } = renderHook(() => useReportingDetailFilters());

    act(() => {
      result.current.handleDateFromChange(new Date('2023-06-15'));
    });

    expect(result.current.hasActiveFilters()).toBe(true);

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.hasActiveFilters()).toBe(false);
  });

  it('handles sort model changes correctly', () => {
    const mockOnFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useReportingDetailFilters({ onFiltersChange: mockOnFiltersChange })
    );

    const sortModel = [{ field: 'iuv', sort: 'asc' as const }];

    act(() => {
      result.current.handleSortModelChange(sortModel);
    });

    expect(result.current.sortModel).toEqual(sortModel);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: ['iuv,asc'],
        page: 0
      })
    );
  });

  it('handles pagination updates correctly', () => {
    const mockOnFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useReportingDetailFilters({ onFiltersChange: mockOnFiltersChange })
    );

    const newPagination = { page: 2, size: 20 };

    act(() => {
      result.current.updatePagination(newPagination);
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        size: 20
      })
    );
  });

  it('combines sort and pagination correctly in updatePagination', () => {
    const mockOnFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useReportingDetailFilters({ onFiltersChange: mockOnFiltersChange })
    );

    act(() => {
      result.current.handleSortModelChange([
        { field: 'payDate', sort: 'desc' }
      ]);
    });

    vi.clearAllMocks();

    act(() => {
      result.current.updatePagination({ page: 1, size: 15 });
    });

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        size: 15,
        sort: ['payDate,desc']
      })
    );
  });

  it('handles empty sort model correctly', () => {
    const mockOnFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useReportingDetailFilters({ onFiltersChange: mockOnFiltersChange })
    );

    act(() => {
      result.current.handleSortModelChange([]);
    });

    expect(result.current.sortModel).toEqual([]);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.not.objectContaining({
        sort: expect.anything()
      })
    );
  });
});
