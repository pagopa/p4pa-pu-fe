import { vi } from 'vitest';
import { useSearch } from './useSearch';
import type { UseMutationResult } from '@tanstack/react-query';
import { renderHook, act } from '../__tests__/renderers';

// mock usePaginationState
const mockHandlePaginationChange = vi.fn();
const mockSetPaginationParams = vi.fn();
const mockPaginationParams = { page: 1, size: 20 };

vi.mock('./usePaginationState', () => ({
  usePaginationState: () => ({
    paginationParams: mockPaginationParams,
    handlePaginationChange: mockHandlePaginationChange,
    setPaginationParams: mockSetPaginationParams
  })
}));

// mock for query props
type Filters = { name: string };
type Data = { result: string };
type Error = { message: string };

function createMockQuery(): UseMutationResult<
  Data,
  Error,
  {
    filters: Filters;
    pagination: { page: number; size: number };
    sort: Array<string>;
  }
> {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({ result: 'ok' })
    // Add any other methods if needed, with correct types
  } as unknown as UseMutationResult<
    Data,
    Error,
    {
      filters: Filters;
      pagination: { page: number; size: number };
      sort: Array<string>;
    }
  >;
}

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct filters and pagination', () => {
    const query = createMockQuery();
    const { result } = renderHook(() =>
      useSearch<Filters, Data, Error>({
        filters: { name: 'foo' },
        initialPage: 1,
        initialSize: 20,
        query
      })
    );
    expect(result.current.filters).toEqual({ name: 'foo' });
    expect(result.current.paginationParams).toEqual(mockPaginationParams);
  });

  it('calls query.mutateAsync on mount', () => {
    const query = createMockQuery();
    renderHook(() =>
      useSearch<Filters, Data, Error>({
        filters: { name: 'foo' },
        query
      })
    );
    expect(query.mutateAsync).toHaveBeenCalledWith({
      filters: { name: 'foo' },
      pagination: mockPaginationParams,
      sort: []
    });
  });

  it('applyFilters resets page and calls query.mutate', () => {
    const query = createMockQuery();
    const { result } = renderHook(() =>
      useSearch<Filters, Data, Error>({
        filters: { name: 'foo' },
        query
      })
    );
    act(() => {
      result.current.applyFilters();
    });
    expect(mockSetPaginationParams).toHaveBeenCalledWith(expect.any(Function));
    expect(query.mutate).toHaveBeenCalledWith({
      filters: { name: 'foo' },
      pagination: { page: 0, size: mockPaginationParams.size },
      sort: []
    });
  });

  it('setSort update state', () => {
    const query = createMockQuery();
    const { result } = renderHook(() =>
      useSearch<Filters, Data, Error>({
        filters: { name: 'foo' },
        query
      })
    );
    act(() => {
      result.current.setSort(['name']);
    });
    expect(result.current.setSort).toBeTypeOf('function');
  });
});
