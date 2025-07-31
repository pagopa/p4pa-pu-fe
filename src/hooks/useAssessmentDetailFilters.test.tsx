import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import {
  useAssessmentDetailFilters,
  AssessmentDetailFilters
} from './useAssessmentDetailFilters';

describe('useAssessmentDetailFilters', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useAssessmentDetailFilters());
    expect(result.current.appliedFilters.page).toBe(0);
    expect(result.current.appliedFilters.size).toBe(10);
    expect(result.current.draftFilters.page).toBe(0);
    expect(result.current.draftFilters.size).toBe(10);
  });

  it('initializes with custom filters', () => {
    const initialFilters: Partial<AssessmentDetailFilters> = {
      page: 2,
      size: 25,
      iuv: 'IUV123',
      iud: 'IUD456',
      updateDateTimeFrom: '2023-01-01T00:00:00.000Z',
      updateDateTimeTo: '2023-12-31T23:59:59.999Z',
      paymentDateTimeFrom: '2023-02-01T00:00:00.000Z',
      paymentDateTimeTo: '2023-11-30T23:59:59.999Z',
      fiscalCode: 'RSSMRA80A01H501U',
      sort: 'iuv,asc'
    };
    const { result } = renderHook(() =>
      useAssessmentDetailFilters({ initialFilters })
    );
    expect(result.current.appliedFilters).toMatchObject(initialFilters);
  });

  it('correctly updates draft filters', () => {
    const { result } = renderHook(() => useAssessmentDetailFilters());
    act(() => {
      result.current.updateDraftFilters({ iuv: 'NEW-IUV' });
    });
    expect(result.current.draftFilters.iuv).toBe('NEW-IUV');
  });

  it('applies filters and resets the page', () => {
    const mockOnFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useAssessmentDetailFilters({
        initialFilters: { page: 3 },
        onFiltersChange: mockOnFiltersChange
      })
    );
    act(() => {
      result.current.updateDraftFilters({ iuv: 'TEST-IUV' });
    });
    act(() => {
      result.current.applyFilters();
    });
    expect(result.current.appliedFilters.iuv).toBe('TEST-IUV');
    expect(result.current.appliedFilters.page).toBe(0);
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        iuv: 'TEST-IUV',
        page: 0
      })
    );
  });

  it('handles date changes correctly', () => {
    const { result } = renderHook(() => useAssessmentDetailFilters());
    const testDate = new Date('2023-06-15T12:00:00');
    act(() => {
      result.current.handleDateFromChange(testDate);
    });
    expect(result.current.draftFilters.updateDateTimeFrom).toContain(
      '2023-06-15'
    );
    act(() => {
      result.current.handleDateToChange(testDate);
    });
    expect(result.current.draftFilters.updateDateTimeTo).toContain(
      '2023-06-15'
    );
    act(() => {
      result.current.handlePaymentDateFromChange(testDate);
    });
    expect(result.current.draftFilters.paymentDateTimeFrom).toContain(
      '2023-06-15'
    );
    act(() => {
      result.current.handlePaymentDateToChange(testDate);
    });
    expect(result.current.draftFilters.paymentDateTimeTo).toContain(
      '2023-06-15'
    );
  });

  it('correctly detects active filters', () => {
    const { result } = renderHook(() => useAssessmentDetailFilters());
    expect(result.current.hasActiveFilters()).toBe(false);
    act(() => {
      result.current.updateDraftFilters({ iuv: 'ACTIVE-IUV' });
    });
    expect(result.current.hasActiveFilters()).toBe(true);
    act(() => {
      result.current.applyFilters();
    });
    expect(result.current.hasActiveFilters()).toBe(false);
  });

  it('updates pagination and notifies the callback', () => {
    const mockOnFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useAssessmentDetailFilters({
        initialFilters: { page: 1, size: 10 },
        onFiltersChange: mockOnFiltersChange
      })
    );
    act(() => {
      result.current.updatePagination({ page: 2, size: 20 });
    });
    expect(result.current.appliedFilters.page).toBe(2);
    expect(result.current.appliedFilters.size).toBe(20);
    expect(result.current.draftFilters.page).toBe(2);
    expect(result.current.draftFilters.size).toBe(20);
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, size: 20 })
    );
  });

  it('handles sort model correctly', () => {
    const mockOnFiltersChange = vi.fn();
    const { result } = renderHook(() =>
      useAssessmentDetailFilters({
        onFiltersChange: mockOnFiltersChange
      })
    );
    const sortModel = [{ field: 'iuv', sort: 'asc' } as const];
    act(() => {
      result.current.handleSortModelChange(sortModel);
    });
    expect(result.current.sortModel).toEqual(sortModel);
    expect(result.current.appliedFilters.sort).toEqual('iuv,asc');
    expect(result.current.draftFilters.sort).toEqual('iuv,asc');
    expect(result.current.appliedFilters.page).toBe(0);
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'iuv,asc', page: 0 })
    );
  });
});
