import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import { useReportingDetailFilters } from './useReportingDetailFilters';

describe('useReportingDetailFilters', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useReportingDetailFilters());

    expect(result.current.appliedFilters.page).toBe(0);
    expect(result.current.appliedFilters.size).toBe(10);
    expect(result.current.draftFilters.page).toBe(0);
    expect(result.current.draftFilters.size).toBe(10);
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

    expect(result.current.appliedFilters).toEqual({
      page: 1,
      size: 20,
      iuv: 'test-iuv',
      payDateFrom: '2023-01-01',
      payDateTo: '2023-12-31'
    });
  });

  it('updates draft filters correctly', () => {
    const { result } = renderHook(() => useReportingDetailFilters());

    act(() => {
      result.current.updateDraftFilters({ iuv: 'new-iuv' });
    });

    expect(result.current.draftFilters.iuv).toBe('new-iuv');
  });

  it('applies filters and resets page', () => {
    const mockOnFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useReportingDetailFilters({
        initialFilters: { page: 5 },
        onFiltersChange: mockOnFiltersChange
      })
    );

    act(() => {
      result.current.updateDraftFilters({ iuv: 'test-iuv' });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(
      result.current.appliedFilters.iuv,
      'IUV not set correctly in appliedFilters'
    ).toBe('test-iuv');
    expect(result.current.appliedFilters.page, 'Page not reset to 0').toBe(0);
    expect(
      mockOnFiltersChange,
      'onFiltersChange not called'
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        iuv: 'test-iuv',
        page: 0
      })
    );
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

  it('updates pagination correctly', () => {
    const mockOnFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useReportingDetailFilters({
        onFiltersChange: mockOnFiltersChange
      })
    );

    act(() => {
      result.current.updatePagination({ page: 2, size: 15 });
    });

    expect(result.current.appliedFilters.page).toBe(2);
    expect(result.current.appliedFilters.size).toBe(15);
    expect(result.current.draftFilters.page).toBe(2);
    expect(result.current.draftFilters.size).toBe(15);
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        size: 15
      })
    );
  });

  it('detects active filters', () => {
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
});
