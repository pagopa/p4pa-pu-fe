import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import useDebtPositionSearch, { DebtPositionFilters } from './useDebtPositionsSearch';

const mockRequest = vi.fn().mockReturnValue({
  mutate: vi.fn(),
  data: [],
  isSuccess: true,
  isLoading: false,
});

describe('useDebtPositionSearch', () => {
  const initialFilters: DebtPositionFilters = {
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31'),
    },
    status: 'TUTTI',
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useDebtPositionSearch({
        initialFilters,
        requestFn: mockRequest,
        autoFetch: false,
      })
    );

    expect(result.current.filterValues).toEqual(initialFilters);
    expect(result.current.pagination.page).toBe(0);
    expect(result.current.pagination.size).toBe(10);
  });

  it('should fetch data when applyFilters is called', () => {
    const { result } = renderHook(() =>
      useDebtPositionSearch({
        initialFilters,
        requestFn: mockRequest,
        autoFetch: false,
      })
    );

    act(() => {
      result.current.applyFilters();
    });

    expect(mockRequest().mutate).toHaveBeenCalled();
  });

  it('should update filter values on handleFilterChange', () => {
    const { result } = renderHook(() =>
      useDebtPositionSearch({
        initialFilters,
        requestFn: mockRequest,
        autoFetch: false,
      })
    );

    act(() => {
      result.current.handleFilterChange('status', 'ACTIVE');
    });

    expect(result.current.filterValues.status).toBe('ACTIVE');
  });
});
