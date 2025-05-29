import { act } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import { useReportingSearch, ReportingFilters } from './useReportingSearch';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
  };
});

vi.mock('../store/GlobalStore', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useStore: vi.fn(() => ({
      state: { organizationId: 12345 }
    })),
    StoreProvider: ({ children }: { children: React.ReactNode }) => children
  };
});

const mockQuery = {
  mutate: vi.fn(),
  data: {
    totalElements: 100,
    totalPages: 10,
    content: []
  },
  isSuccess: true,
  isLoading: false,
  error: null
};

vi.mock('../api/getPaymentsReporting', () => ({
  getPaymentsReporting: vi.fn(() => mockQuery),
  PaymentsReportingQuery: {}
}));

describe('useReportingSearch', () => {
  const initialFilters: ReportingFilters = {
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31')
    },
    regulationUniqueIdentifier: 'test-identifier',
    iuf: 'test-iuf'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useReportingSearch({
        initialFilters,
        initialPage: 0,
        initialSize: 10
      })
    );

    expect(result.current.filterValues).toEqual(initialFilters);
    expect(result.current.pagination.page).toBe(0);
    expect(result.current.pagination.size).toBe(10);
  });

  it('should initialize with custom page and size', () => {
    const { result } = renderHook(() =>
      useReportingSearch({
        initialFilters,
        initialPage: 2,
        initialSize: 25
      })
    );

    expect(result.current.pagination.page).toBe(0);
    expect(result.current.pagination.size).toBe(25);
  });

  it('should update filter values on handleFilterChange', () => {
    const { result } = renderHook(() =>
      useReportingSearch({
        initialFilters
      })
    );

    act(() => {
      result.current.handleFilterChange('iuf', 'new-iuf-value');
    });

    expect(result.current.filterValues.iuf).toBe('new-iuf-value');
  });

  it('should update filter values on setFilterValues', () => {
    const { result } = renderHook(() =>
      useReportingSearch({
        initialFilters
      })
    );

    const newFilters: ReportingFilters = {
      ...initialFilters,
      regulationUniqueIdentifier: 'updated-identifier'
    };

    act(() => {
      result.current.setFilterValues(newFilters);
    });

    expect(result.current.filterValues.regulationUniqueIdentifier).toBe(
      'updated-identifier'
    );
  });

  it('should call query.mutate when applyFilters is executed', () => {
    const { result } = renderHook(() =>
      useReportingSearch({
        initialFilters
      })
    );

    act(() => {
      result.current.applyFilters();
    });

    expect(mockQuery.mutate).toHaveBeenCalled();
  });

  it('should handle page changes correctly', () => {
    const { result } = renderHook(() =>
      useReportingSearch({
        initialFilters
      })
    );

    act(() => {
      result.current.handlePageChange(3);
    });

    expect(result.current.pagination.page).toBe(2);
  });

  it('should handle page size changes correctly', () => {
    const { result } = renderHook(() =>
      useReportingSearch({
        initialFilters
      })
    );

    act(() => {
      result.current.handlePageSizeChange(50);
    });

    expect(result.current.pagination.size).toBe(50);
  });

  it('should update sort values with setSort', () => {
    const { result } = renderHook(() =>
      useReportingSearch({
        initialFilters
      })
    );

    const sortValues = ['name,asc', 'date,desc'];

    act(() => {
      result.current.setSort(sortValues);
    });

    expect(mockQuery.mutate).toHaveBeenCalled();
  });

  it('should handle empty initial filters correctly', () => {
    const emptyFilters: ReportingFilters = {};

    const { result } = renderHook(() =>
      useReportingSearch({
        initialFilters: emptyFilters
      })
    );

    expect(result.current.filterValues).toEqual(emptyFilters);
    expect(result.current.pagination.page).toBe(0);
    expect(result.current.pagination.size).toBe(10);
  });

  it('should provide all expected return values', () => {
    const { result } = renderHook(() =>
      useReportingSearch({
        initialFilters
      })
    );

    expect(result.current).toHaveProperty('applyFilters');
    expect(result.current).toHaveProperty('query');
    expect(result.current).toHaveProperty('filterValues');
    expect(result.current).toHaveProperty('handleFilterChange');
    expect(result.current).toHaveProperty('handlePageChange');
    expect(result.current).toHaveProperty('handlePageSizeChange');
    expect(result.current).toHaveProperty('pagination');
    expect(result.current).toHaveProperty('setFilterValues');
    expect(result.current).toHaveProperty('setSort');
    expect(result.current).toHaveProperty('syncWithBackendData');

    expect(typeof result.current.applyFilters).toBe('function');
    expect(typeof result.current.handleFilterChange).toBe('function');
    expect(typeof result.current.handlePageChange).toBe('function');
    expect(typeof result.current.handlePageSizeChange).toBe('function');
    expect(typeof result.current.setFilterValues).toBe('function');
    expect(typeof result.current.setSort).toBe('function');
    expect(typeof result.current.syncWithBackendData).toBe('function');
  });
});
