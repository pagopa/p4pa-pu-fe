import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import useTelematicReceiptSearch, {
  TelematicReceiptFilters
} from './useTelematicReceiptsSearch';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
}));

describe('useTelematicReceiptSearch', () => {
  const initialFilters: TelematicReceiptFilters = {
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31')
    }
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useTelematicReceiptSearch({
        initialFilters
      })
    );

    expect(result.current.filterValues).toEqual(initialFilters);
    expect(result.current.pagination.page).toBe(0);
    expect(result.current.pagination.size).toBe(10);
  });

  it('should update filter values on handleFilterChange', () => {
    const { result } = renderHook(() =>
      useTelematicReceiptSearch({
        initialFilters
      })
    );

    act(() => {
      result.current.handleFilterChange('iuv', '123');
    });

    expect(result.current.filterValues.iuv).toBe('123');
  });
});
