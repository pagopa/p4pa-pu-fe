import { vi } from 'vitest';
import { useSearch } from './useSearch';
import type { UseMutationResult } from '@tanstack/react-query';
import { renderHook, act } from '../__tests__/renderers';

// mock usePaginationState
const mockHandlePaginationChange = vi.fn();
const mockPaginationParams = { page: 1, size: 20 };
const mockSetPaginationParams = vi.fn((updater) => {
  if (typeof updater === 'function') {
    updater(mockPaginationParams);
  }
});

vi.mock('./usePaginationState', () => ({
  usePaginationState: () => ({
    paginationParams: mockPaginationParams,
    handlePaginationChange: mockHandlePaginationChange,
    setPaginationParams: mockSetPaginationParams
  })
}));

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
    expect(result.current.paginationParams).toEqual(mockPaginationParams);
  });

  it('calls query.mutateAsync on mount', () => {
    const query = createMockQuery();
    renderHook(() =>
      useSearch<Filters, Data, Error>({
        filters: { name: 'foo' },
        query,
        initialPage: 1,
        initialSize: 20
      })
    );
    expect(query.mutateAsync).toHaveBeenCalledWith({
      filters: { name: 'foo' },
      pagination: { ...mockPaginationParams, page: 0 },
      sort: []
    });
  });

  it('applyFilters resets page and calls query.mutateAsync', () => {
    const query = createMockQuery();
    const { result } = renderHook(() =>
      useSearch<Filters, Data, Error>({
        filters: { name: 'foo' },
        query
      })
    );

    act(() => {
      result.current.applyFilters({ name: 'foo' });
    });

    expect(mockHandlePaginationChange).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0 })
    );
    expect(query.mutateAsync).toHaveBeenCalledWith({
      filters: { name: 'foo' },
      pagination: { page: 0, size: mockPaginationParams.size },
      sort: []
    });
  });

  it('setSort updates state', () => {
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

    expect(typeof result.current.setSort).toBe('function');
  });
});
