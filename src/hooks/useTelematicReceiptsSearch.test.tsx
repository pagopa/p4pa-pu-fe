import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import { useTelematicReceiptSearch } from './useTelematicReceiptsSearch';
import { useSearchParams } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn()
}));

vi.mock('../api/receipts', () => ({
  getReceipts: vi.fn(() => ({
    mutate: vi.fn(),
    data: null,
    isLoading: false,
    error: null
  }))
}));

vi.mock('../store/GlobalStore', () => ({
  useStore: () => ({
    state: { organizationId: 123 }
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

describe('useTelematicReceiptSearch', () => {
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as Mock).mockImplementation(() => [
      new URLSearchParams(),
      mockSetSearchParams
    ]);
  });

  const createDynamicSearchParamsMock = () => {
    let currentSearchParams = new URLSearchParams();

    const mockSetSearchParamsImpl = vi.fn((newParams: URLSearchParams) => {
      currentSearchParams = newParams;
      (useSearchParams as Mock).mockImplementation(() => [
        currentSearchParams,
        mockSetSearchParamsImpl
      ]);
    });

    (useSearchParams as Mock).mockImplementation(() => [
      currentSearchParams,
      mockSetSearchParamsImpl
    ]);

    return { mockSetSearchParamsImpl };
  };

  const defaultProps = {
    initialFilters: {},
    initialPage: 0,
    initialSize: 10
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useTelematicReceiptSearch(defaultProps)
    );

    expect(result.current.paginationParams.page).toBe(0);
    expect(result.current.paginationParams.size).toBe(10);
    expect(result.current.filterValues).toEqual({});
  });

  it('should initialize with custom values', () => {
    const customProps = {
      initialFilters: { iuv: 'test-iuv' },
      initialPage: 2,
      initialSize: 25
    };

    const { result } = renderHook(() => useTelematicReceiptSearch(customProps));

    expect(result.current.paginationParams.page).toBe(0);
    expect(result.current.paginationParams.size).toBe(25);
    expect(result.current.filterValues).toEqual({ iuv: 'test-iuv' });
  });

  it('should handle filter changes', () => {
    const { result } = renderHook(() =>
      useTelematicReceiptSearch(defaultProps)
    );

    act(() => {
      result.current.handleFilterChange('iuv', 'new-iuv');
    });

    expect(result.current.filterValues.iuv).toBe('new-iuv');
  });

  it('should handle pagination changes', () => {
    createDynamicSearchParamsMock();
    const { result, rerender } = renderHook(() =>
      useTelematicReceiptSearch(defaultProps)
    );

    act(() => {
      result.current.handlePaginationChange({ page: 2, size: 20 });
    });

    rerender();

    expect(result.current.paginationParams.page).toBe(2);
    expect(result.current.paginationParams.size).toBe(20);
  });

  it('should reset page when applying filters', () => {
    createDynamicSearchParamsMock();
    const { result, rerender } = renderHook(() =>
      useTelematicReceiptSearch(defaultProps)
    );

    act(() => {
      result.current.handlePaginationChange({ page: 2, size: 10 });
    });

    rerender();

    expect(result.current.paginationParams.page).toBe(2);

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.paginationParams.page).toBe(0);
  });

  it('should expose required functions', () => {
    const { result } = renderHook(() =>
      useTelematicReceiptSearch(defaultProps)
    );

    expect(typeof result.current.applyFilters).toBe('function');
    expect(typeof result.current.handleFilterChange).toBe('function');
    expect(typeof result.current.handlePaginationChange).toBe('function');
    expect(typeof result.current.setFilterValues).toBe('function');
    expect(typeof result.current.setSort).toBe('function');
  });
});
