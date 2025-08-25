import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { subDays, addDays } from 'date-fns';
import { usePaymentsTableFilters } from './usePaymentsTableFilters';
import { toStartOfDay, toEndOfDay } from '../utils/formatters';
import type { PaymentsUIFilters } from '../api/classifications/paidInstallments/mappings';

const createWrapper = (initialEntries = ['/']) => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

describe('usePaymentsTableFilters', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnFilterValidationError = vi.fn();

  const today = new Date('2024-03-24T12:00:00Z');
  const thirtyDaysAgo = subDays(today, 30);

  const expectHookActionsNotToThrow = (actions: () => void) => {
    expect(() => {
      act(actions);
    }).not.toThrow();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(today);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default filters when no initial filters are provided', () => {
      const { result } = renderHook(() => usePaymentsTableFilters(), {
        wrapper: createWrapper()
      });

      expect(result.current.draftFilters.dateFrom).toEqual(
        toStartOfDay(thirtyDaysAgo)
      );
      expect(result.current.draftFilters.dateTo).toEqual(toEndOfDay(today));
      expect(result.current.appliedFilters.dateFrom).toEqual(
        toStartOfDay(thirtyDaysAgo)
      );
      expect(result.current.appliedFilters.dateTo).toEqual(toEndOfDay(today));
      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.hasValidFilters).toBe(true);
    });

    it('should initialize with custom initial filters', () => {
      const customDateFrom = new Date('2024-01-01');
      const customDateTo = new Date('2024-01-31');
      const initialFilters: Partial<PaymentsUIFilters> = {
        dateFrom: customDateFrom,
        dateTo: customDateTo,
        iuv: 'TEST123'
      };

      const { result } = renderHook(
        () => usePaymentsTableFilters({ initialFilters }),
        { wrapper: createWrapper() }
      );

      expect(result.current.draftFilters.dateFrom).toEqual(customDateFrom);
      expect(result.current.draftFilters.dateTo).toEqual(customDateTo);
      expect(result.current.draftFilters.iuv).toBe('TEST123');
      expect(result.current.appliedFilters.dateFrom).toEqual(customDateFrom);
      expect(result.current.appliedFilters.dateTo).toEqual(customDateTo);
      expect(result.current.appliedFilters.iuv).toBe('TEST123');
    });

    it('should auto-load default filters on mount when autoLoadOnMount is true', () => {
      renderHook(
        () =>
          usePaymentsTableFilters({
            onFiltersChange: mockOnFiltersChange,
            autoLoadOnMount: true
          }),
        { wrapper: createWrapper() }
      );

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: toStartOfDay(thirtyDaysAgo),
          dateTo: toEndOfDay(today)
        })
      );
    });

    it('should not auto-load when autoLoadOnMount is false', () => {
      renderHook(
        () =>
          usePaymentsTableFilters({
            onFiltersChange: mockOnFiltersChange,
            autoLoadOnMount: false
          }),
        { wrapper: createWrapper() }
      );

      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });
  });

  describe('Draft filters management', () => {
    it('should update draft filters correctly', () => {
      const { result } = renderHook(() => usePaymentsTableFilters(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.updateDraftFilters({ iuv: 'NEW_IUV' });
      });

      expect(result.current.draftFilters.iuv).toBe('NEW_IUV');
      expect(result.current.appliedFilters.iuv).toBeUndefined();
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should remove empty values when updating draft filters', () => {
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            initialFilters: { iuv: 'EXISTING_IUV' }
          }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.updateDraftFilters({ iuv: '' });
      });

      expect(result.current.draftFilters.iuv).toBeUndefined();
    });

    it('should update multiple properties in draft filters', () => {
      const { result } = renderHook(() => usePaymentsTableFilters(), {
        wrapper: createWrapper()
      });

      const newDateFrom = new Date('2024-02-01');
      const newDateTo = new Date('2024-02-28');

      act(() => {
        result.current.updateDraftFilters({
          iuv: 'MULTI_UPDATE',
          dateFrom: newDateFrom,
          dateTo: newDateTo
        });
      });

      expect(result.current.draftFilters.iuv).toBe('MULTI_UPDATE');
      expect(result.current.draftFilters.dateFrom).toEqual(newDateFrom);
      expect(result.current.draftFilters.dateTo).toEqual(newDateTo);
    });
  });

  describe('Filter validation', () => {
    it('should consider filters valid when at least one field is filled', () => {
      const { result } = renderHook(
        () => usePaymentsTableFilters({ initialFilters: {} }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.updateDraftFilters({ iuv: 'TEST_IUV' });
      });
      expect(result.current.hasValidFilters).toBe(true);

      act(() => {
        result.current.updateDraftFilters({
          iuv: undefined,
          dateFrom: new Date('2024-01-01')
        });
      });
      expect(result.current.hasValidFilters).toBe(true);

      act(() => {
        result.current.updateDraftFilters({
          dateFrom: undefined,
          updateDateFrom: new Date('2024-01-01')
        });
      });
      expect(result.current.hasValidFilters).toBe(true);
    });

    it('should consider filters valid even when all explicit fields are empty but there are default dates', () => {
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            initialFilters: {
              iuv: undefined,
              dateFrom: undefined,
              dateTo: undefined,
              updateDateFrom: undefined,
              updateDateTo: undefined
            }
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.hasValidFilters).toBe(true);
      expect(result.current.draftFilters.dateFrom).toBeDefined();
      expect(result.current.draftFilters.dateTo).toBeDefined();
    });

    it('should ignore empty strings in validation but keep default dates', () => {
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            initialFilters: { iuv: '   ' }
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.hasValidFilters).toBe(true);
      expect(result.current.draftFilters.dateFrom).toBeDefined();
      expect(result.current.draftFilters.dateTo).toBeDefined();
    });
  });

  describe('Filter application', () => {
    it('should apply filters when they are valid', () => {
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            onFiltersChange: mockOnFiltersChange,
            onFilterValidationError: mockOnFilterValidationError
          }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.updateDraftFilters({ iuv: 'APPLY_TEST' });
      });

      act(() => {
        result.current.applyFilters();
      });

      const today = toEndOfDay(new Date());
      const thirtyDaysAgo = toStartOfDay(subDays(today as Date, 30));

      expect(result.current.appliedFilters.iuv).toBe('APPLY_TEST');
      expect(result.current.hasActiveFilters).toBe(false);
      expect(mockOnFilterValidationError).toHaveBeenCalledWith(false);
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        iuv: 'APPLY_TEST',
        dateFrom: thirtyDaysAgo,
        dateTo: today
      });
    });

    it('should fail application when filters are not valid (all dates nullified)', () => {
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            initialFilters: {
              dateFrom: undefined,
              dateTo: undefined,
              iuv: undefined
            },
            onFiltersChange: mockOnFiltersChange,
            onFilterValidationError: mockOnFilterValidationError,
            autoLoadOnMount: false
          }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.updateDraftFilters({
          iuv: undefined,
          dateFrom: null,
          dateTo: null,
          updateDateFrom: null,
          updateDateTo: null
        });
      });

      expect(result.current.hasValidFilters).toBe(false);

      act(() => {
        result.current.applyFilters();
      });

      expect(mockOnFilterValidationError).toHaveBeenCalledWith(true);
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
    });
  });

  describe('Date handlers', () => {
    it('should handle dateFrom change', () => {
      const { result } = renderHook(() => usePaymentsTableFilters(), {
        wrapper: createWrapper()
      });

      const newDate = new Date('2024-02-01');

      act(() => {
        result.current.handleDateFromChange(newDate);
      });

      expect(result.current.draftFilters.dateFrom).toEqual(newDate);
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should handle dateTo change', () => {
      const { result } = renderHook(() => usePaymentsTableFilters(), {
        wrapper: createWrapper()
      });

      const newDate = new Date('2024-02-28');

      act(() => {
        result.current.handleDateToChange(newDate);
      });

      expect(result.current.draftFilters.dateTo).toEqual(newDate);
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should handle nullish values for dates', () => {
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            initialFilters: {
              dateFrom: new Date('2024-01-01'),
              dateTo: new Date('2024-01-31')
            }
          }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.handleDateFromChange(null);
        result.current.handleDateToChange(null);
      });

      expect(result.current.draftFilters.dateFrom).toBeFalsy();
      expect(result.current.draftFilters.dateTo).toBeFalsy();
    });
  });

  describe('Active filters detection', () => {
    it('should detect when there are active filters not yet applied', () => {
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            initialFilters: { iuv: 'ORIGINAL' }
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.hasActiveFilters).toBe(false);

      act(() => {
        result.current.updateDraftFilters({ iuv: 'MODIFIED' });
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should detect date changes as active filters', () => {
      const originalDate = new Date('2024-01-01');
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            initialFilters: { dateFrom: originalDate }
          }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.handleDateFromChange(addDays(originalDate, 1));
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should not detect active filters after application', () => {
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            onFiltersChange: mockOnFiltersChange
          }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.updateDraftFilters({ iuv: 'APPLY_AND_CHECK' });
      });

      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.applyFilters();
      });

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('API conversion', () => {
    it('should expose the API conversion function', () => {
      const { result } = renderHook(() => usePaymentsTableFilters(), {
        wrapper: createWrapper()
      });

      expect(typeof result.current.convertFiltersToAPI).toBe('function');
    });
  });

  describe('Edge cases', () => {
    it('should handle partially defined initial filters', () => {
      const customDateFrom = new Date('2024-01-01');
      const customDateTo = new Date('2024-01-31');

      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            initialFilters: {
              dateFrom: customDateFrom,
              dateTo: customDateTo
            }
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.draftFilters.dateFrom).toEqual(customDateFrom);
      expect(result.current.draftFilters.dateTo).toEqual(customDateTo);
    });

    it('should use default filters when only one initial date is defined', () => {
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            initialFilters: { dateFrom: new Date('2024-01-01') }
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.draftFilters.dateFrom).toEqual(
        toStartOfDay(thirtyDaysAgo)
      );
      expect(result.current.draftFilters.dateTo).toEqual(toEndOfDay(today));
    });

    it('should not auto-load more than once', () => {
      const { rerender } = renderHook(
        () =>
          usePaymentsTableFilters({
            onFiltersChange: mockOnFiltersChange,
            autoLoadOnMount: true
          }),
        { wrapper: createWrapper() }
      );

      expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);

      rerender();
      rerender();

      expect(mockOnFiltersChange).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined callbacks without errors', () => {
      const { result } = renderHook(
        () =>
          usePaymentsTableFilters({
            onFiltersChange: undefined,
            onFilterValidationError: undefined
          }),
        { wrapper: createWrapper() }
      );

      expectHookActionsNotToThrow(() => {
        result.current.updateDraftFilters({ iuv: 'NO_CALLBACK' });
        result.current.applyFilters();
      });
    });
  });
});
