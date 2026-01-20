import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSearch, SearchVariables } from './useSearch';
import { UseMutationResult } from '@tanstack/react-query';

vi.mock('./useHashParamsListener', () => ({
  useHashParamsListener: vi.fn(() => ({
    page: 1,
    size: 10,
    sortDirection: '',
    sortField: ''
  }))
}));

vi.mock('../utils', () => ({
  default: {
    URI: {
      encode: vi.fn((params) => JSON.stringify(params)),
      set: vi.fn()
    }
  }
}));

import { useHashParamsListener } from './useHashParamsListener';
import utils from '../utils';
import { act, renderHook, waitFor } from '../__tests__/renderers';

type TestFilters = {
  iuv?: string;
  iud?: string;
  name?: string;
};

type TestData = {
  items: Array<{ id: string }>;
  total: number;
};

const createMockQuery = () => {
  const mutateAsync = vi.fn().mockResolvedValue({ items: [], total: 0 });

  return {
    mutateAsync,
    data: undefined,
    error: null,
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    status: 'idle',
    reset: vi.fn(),
    mutate: vi.fn()
  } as unknown as UseMutationResult<
    TestData,
    Error,
    SearchVariables<TestFilters>
  >;
};

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHashParamsListener).mockReturnValue({
      page: 1,
      size: 10,
      sortDirection: '',
      sortField: ''
    });
  });

  describe('initialization', () => {
    it('calls query.mutateAsync on mount with initial filters', async () => {
      const mockQuery = createMockQuery();
      const filters: TestFilters = { iuv: 'ABC123' };

      renderHook(() =>
        useSearch({
          filters,
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledWith({
          filters,
          pagination: { size: 10, page: 0 },
          sort: []
        });
      });
    });

    it('uses page 0 when hashPage is 1', async () => {
      const mockQuery = createMockQuery();

      renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            pagination: { size: 10, page: 0 }
          })
        );
      });
    });

    it('calculates correct page from hash params', async () => {
      vi.mocked(useHashParamsListener).mockReturnValue({
        page: 3,
        size: 20,
        sortDirection: '',
        sortField: ''
      });

      const mockQuery = createMockQuery();

      renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            pagination: { size: 20, page: 2 }
          })
        );
      });
    });

    it('handles page 0 or negative values', async () => {
      vi.mocked(useHashParamsListener).mockReturnValue({
        page: 0,
        size: 10,
        sortDirection: '',
        sortField: ''
      });

      const mockQuery = createMockQuery();

      renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            pagination: { size: 10, page: 0 }
          })
        );
      });
    });
  });

  describe('sorting', () => {
    it('includes sort when sortField and sortDirection are provided', async () => {
      vi.mocked(useHashParamsListener).mockReturnValue({
        page: 1,
        size: 10,
        sortDirection: 'asc',
        sortField: 'name'
      });

      const mockQuery = createMockQuery();

      renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            sort: ['name,asc']
          })
        );
      });
    });

    it('returns empty sort array when sort params are missing', async () => {
      const mockQuery = createMockQuery();

      renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            sort: []
          })
        );
      });
    });
  });

  describe('applyFilters', () => {
    it('trims string values in filters', async () => {
      const mockQuery = createMockQuery();

      const { result } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      act(() => {
        result.current.applyFilters({
          iuv: '  ABC123  ',
          iud: '  DEF456  ',
          name: '  Test Name  '
        });
      });

      expect(mockQuery.mutateAsync).toHaveBeenCalledWith({
        filters: {
          iuv: 'ABC123',
          iud: 'DEF456',
          name: 'Test Name'
        },
        pagination: { size: 10, page: 0 },
        sort: []
      });
    });

    it('preserves spaces in the middle of strings', async () => {
      const mockQuery = createMockQuery();

      const { result } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      act(() => {
        result.current.applyFilters({
          name: '  Test Redirect Name  '
        });
      });

      expect(mockQuery.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: {
            name: 'Test Redirect Name'
          }
        })
      );
    });

    it('does not modify non-string values', async () => {
      const mockQuery = createMockQuery();

      const { result } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      const filtersWithMixedTypes = {
        name: '  Test  ',
        count: 42,
        active: true,
        data: null
      } as unknown as TestFilters;

      act(() => {
        result.current.applyFilters(filtersWithMixedTypes);
      });

      expect(mockQuery.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: {
            name: 'Test',
            count: 42,
            active: true,
            data: null
          }
        })
      );
    });

    it('resets pagination to first page', async () => {
      const mockQuery = createMockQuery();

      const { result } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      act(() => {
        result.current.applyFilters({ iuv: 'ABC123' });
      });

      expect(mockQuery.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: { size: 10, page: 0 }
        })
      );
    });

    it('resets sort', async () => {
      const mockQuery = createMockQuery();

      const { result } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalled();
      });

      vi.clearAllMocks();

      act(() => {
        result.current.applyFilters({ iuv: 'ABC123' });
      });

      expect(mockQuery.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: []
        })
      );
    });

    it('updates URL with trimmed filters', async () => {
      const mockQuery = createMockQuery();

      const { result } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalled();
      });

      act(() => {
        result.current.applyFilters({
          iuv: '  ABC123  '
        });
      });

      expect(utils.URI.encode).toHaveBeenCalledWith({
        iuv: 'ABC123',
        page: null,
        size: null,
        sort: null
      });

      expect(utils.URI.set).toHaveBeenCalledWith(expect.any(String), {
        replace: true
      });
    });

    it('focuses on results table after applying filters', async () => {
      const mockQuery = createMockQuery();
      const mockFocus = vi.fn();

      const mockDataGrid = { focus: mockFocus };
      const mockTable = {
        getElementsByClassName: vi.fn().mockReturnValue([mockDataGrid])
      };
      vi.spyOn(document, 'getElementById').mockReturnValue(
        mockTable as unknown as HTMLElement
      );

      const { result } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalled();
      });

      act(() => {
        result.current.applyFilters({ iuv: 'ABC123' });
      });

      expect(document.getElementById).toHaveBeenCalledWith(
        'data-results-table'
      );
      expect(mockTable.getElementsByClassName).toHaveBeenCalledWith(
        'MuiDataGrid-main'
      );
      expect(mockFocus).toHaveBeenCalled();
    });

    it('handles missing results table gracefully', async () => {
      const mockQuery = createMockQuery();

      vi.spyOn(document, 'getElementById').mockReturnValue(null);

      const { result } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalled();
      });

      expect(() => {
        // eslint-disable-next-line sonarjs/no-nested-functions
        act(() => {
          result.current.applyFilters({ iuv: 'ABC123' });
        });
      }).not.toThrow();
    });
  });

  describe('return value', () => {
    it('returns applyFilters function and query', async () => {
      const mockQuery = createMockQuery();

      const { result } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      expect(result.current).toHaveProperty('applyFilters');
      expect(result.current).toHaveProperty('query');
      expect(typeof result.current.applyFilters).toBe('function');
      expect(result.current.query).toBe(mockQuery);
    });
  });

  describe('reactivity to hash params', () => {
    it('re-fetches when page changes', async () => {
      const mockQuery = createMockQuery();

      const { rerender } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledTimes(1);
      });

      vi.mocked(useHashParamsListener).mockReturnValue({
        page: 2,
        size: 10,
        sortDirection: '',
        sortField: ''
      });

      rerender();

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledTimes(2);
      });
    });

    it('re-fetches when size changes', async () => {
      const mockQuery = createMockQuery();

      const { rerender } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledTimes(1);
      });

      vi.mocked(useHashParamsListener).mockReturnValue({
        page: 1,
        size: 20,
        sortDirection: '',
        sortField: ''
      });

      rerender();

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledTimes(2);
      });
    });

    it('re-fetches when sort changes', async () => {
      const mockQuery = createMockQuery();

      const { rerender } = renderHook(() =>
        useSearch({
          filters: {},
          query: mockQuery
        })
      );

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledTimes(1);
      });

      vi.mocked(useHashParamsListener).mockReturnValue({
        page: 1,
        size: 10,
        sortDirection: 'desc',
        sortField: 'createdAt'
      });

      rerender();

      await waitFor(() => {
        expect(mockQuery.mutateAsync).toHaveBeenCalledTimes(2);
      });
    });
  });
});
