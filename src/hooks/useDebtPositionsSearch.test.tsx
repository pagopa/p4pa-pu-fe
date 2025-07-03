import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import useDebtPositionSearch, {
  DebtPositionsFilters
} from './useDebtPositionsSearch';
import { DebtPositionStatus } from '../../generated/apiClient';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
}));

const mockRequest = vi.fn().mockReturnValue({
  mutate: vi.fn(),
  data: [],
  isSuccess: true,
  isLoading: false
});

describe('useDebtPositionSearch', () => {
  const initialFilters: DebtPositionsFilters = {
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31')
    },
    status: DebtPositionStatus.TO_SYNC
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useDebtPositionSearch({
        initialFilters,
        requestFn: mockRequest
      })
    );

    expect(result.current.filterValues).toEqual(initialFilters);
    expect(result.current.paginationParams.page).toBe(0);
    expect(result.current.paginationParams.size).toBe(10);
  });

  it('should fetch data when applyFilters is called', () => {
    const { result } = renderHook(() =>
      useDebtPositionSearch({
        initialFilters,
        requestFn: mockRequest
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
        requestFn: mockRequest
      })
    );

    act(() => {
      result.current.handleFilterChange('status', 'ACTIVE');
    });

    expect(result.current.filterValues.status).toBe('ACTIVE');
  });
});
