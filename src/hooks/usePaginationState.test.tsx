import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchParams } from 'react-router';
import {
  usePaginationState,
  PaginationParams,
  UsePaginationStateReturn
} from './usePaginationState';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as typeof importOriginal),
    useSearchParams: vi.fn()
  };
});

describe('usePaginationState', () => {
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

  const testPaginationChange = (
    result: { current: UsePaginationStateReturn },
    newPagination: PaginationParams
  ) => {
    result.current.handlePaginationChange(newPagination);
  };

  const testSetPaginationParams = (
    result: { current: UsePaginationStateReturn },
    newParams: PaginationParams
  ) => {
    result.current.setPaginationParams(newParams);
  };

  const testFunctionalSetPaginationParams = (result: {
    current: UsePaginationStateReturn;
  }) => {
    result.current.setPaginationParams((prev: PaginationParams) => ({
      ...prev,
      page: prev.page + 1
    }));
  };

  const testCallbackWithoutThrowing = (result: {
    current: UsePaginationStateReturn;
  }) => {
    testPaginationChange(result, { page: 1, size: 20 });
  };

  const expectNoErrorThrown = (testFunction: () => void) => {
    expect(testFunction).not.toThrow();
  };

  const actAndTest = (result: { current: UsePaginationStateReturn }) => {
    act(() => {
      testCallbackWithoutThrowing(result);
    });
  };

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePaginationState());

      expect(result.current.paginationParams).toEqual({
        page: 0,
        size: 10
      });
    });

    it('should initialize with custom values then sync with URL', () => {
      const { result } = renderHook(() =>
        usePaginationState({
          initialPage: 2,
          initialSize: 25
        })
      );

      expect(result.current.paginationParams).toEqual({
        page: 0,
        size: 25
      });
    });

    it('should read URL parameters and sync state', () => {
      const mockSearchParams = new URLSearchParams('?page=3&size=20');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() => usePaginationState());

      expect(result.current.paginationParams).toEqual({
        page: 2,
        size: 20
      });
    });

    it('should handle invalid URL parameters by passing them through', () => {
      const mockSearchParams = new URLSearchParams('?page=invalid&size=abc');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() =>
        usePaginationState({
          initialSize: 15
        })
      );

      expect(result.current.paginationParams).toEqual({
        page: NaN,
        size: NaN
      });
    });

    it('should prioritize URL parameters over initial values', () => {
      const mockSearchParams = new URLSearchParams('?page=5&size=30');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() =>
        usePaginationState({
          initialPage: 1,
          initialSize: 10
        })
      );

      expect(result.current.paginationParams).toEqual({
        page: 4,
        size: 30
      });
    });
  });

  describe('Pagination Changes', () => {
    it('should handle pagination change correctly via handlePaginationChange', () => {
      createDynamicSearchParamsMock();
      const { result, rerender } = renderHook(() => usePaginationState());

      const newPagination: PaginationParams = { page: 3, size: 20 };

      act(() => {
        testPaginationChange(result, newPagination);
      });

      rerender();

      expect(result.current.paginationParams).toEqual({
        page: 3,
        size: 20
      });
    });

    it('should update URL when pagination changes', () => {
      const { result } = renderHook(() => usePaginationState());

      mockSetSearchParams.mockClear();

      const newPagination: PaginationParams = { page: 2, size: 25 };

      act(() => {
        testPaginationChange(result, newPagination);
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );

      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get('page')).toBe('3');
      expect(calledParams.get('size')).toBe('25');
    });

    it('should preserve existing URL parameters when updating pagination', () => {
      const mockSearchParams = new URLSearchParams('?filter=test&sort=name');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() => usePaginationState());

      mockSetSearchParams.mockClear();

      act(() => {
        testPaginationChange(result, { page: 1, size: 15 });
      });

      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get('page')).toBe('2');
      expect(calledParams.get('size')).toBe('15');
      expect(calledParams.get('filter')).toBe('test');
      expect(calledParams.get('sort')).toBe('name');
    });

    it('should call onPaginationChange callback when provided', () => {
      const onPaginationChange = vi.fn();
      const { result } = renderHook(() =>
        usePaginationState({
          onPaginationChange
        })
      );

      const newPagination: PaginationParams = { page: 1, size: 20 };

      act(() => {
        testPaginationChange(result, newPagination);
      });

      expect(onPaginationChange).toHaveBeenCalledWith(newPagination);
    });

    it('should not call onPaginationChange callback when not provided', () => {
      const { result } = renderHook(() => usePaginationState());

      expectNoErrorThrown(() => actAndTest(result));
    });
  });

  describe('Direct State Updates', () => {
    it('should allow direct state updates via setPaginationParams but useEffect may override', () => {
      const { result } = renderHook(() => usePaginationState());

      act(() => {
        testSetPaginationParams(result, { page: 5, size: 50 });
      });

      expect(result.current.paginationParams).toEqual({
        page: 0,
        size: 10
      });

      expect(mockSetSearchParams).not.toHaveBeenCalled();
    });

    it('should allow functional updates via setPaginationParams but useEffect may override', () => {
      const { result } = renderHook(() =>
        usePaginationState({
          initialPage: 1,
          initialSize: 10
        })
      );

      act(() => {
        testFunctionalSetPaginationParams(result);
      });

      expect(result.current.paginationParams).toEqual({
        page: 0,
        size: 10
      });
    });
  });

  describe('URL Synchronization Edge Cases', () => {
    it('should handle missing URL parameters', () => {
      const mockSearchParams = new URLSearchParams('?other=value');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() =>
        usePaginationState({
          initialPage: 2,
          initialSize: 15
        })
      );

      expect(result.current.paginationParams).toEqual({
        page: 0,
        size: 15
      });
    });

    it('should handle zero and negative values in URL', () => {
      const mockSearchParams = new URLSearchParams('?page=0&size=-5');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() =>
        usePaginationState({
          initialSize: 10
        })
      );

      expect(result.current.paginationParams).toEqual({
        page: -1,
        size: -5
      });
    });

    it('should sync state when URL changes after mount', () => {
      const mockSearchParams = new URLSearchParams('?page=1&size=10');
      const mockSetSearchParamsRef = { current: mockSetSearchParams };

      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParamsRef.current
      ]);

      const { result, rerender } = renderHook(() => usePaginationState());

      expect(result.current.paginationParams).toEqual({
        page: 0,
        size: 10
      });

      const newMockSearchParams = new URLSearchParams('?page=4&size=25');
      (useSearchParams as Mock).mockImplementation(() => [
        newMockSearchParams,
        mockSetSearchParamsRef.current
      ]);

      rerender();

      expect(result.current.paginationParams).toEqual({
        page: 3,
        size: 25
      });
    });
  });

  describe('Return Value Structure', () => {
    it('should return all required properties', () => {
      const { result } = renderHook(() => usePaginationState());

      expect(result.current).toHaveProperty('paginationParams');
      expect(result.current).toHaveProperty('handlePaginationChange');
      expect(result.current).toHaveProperty('setPaginationParams');

      expect(typeof result.current.paginationParams).toBe('object');
      expect(typeof result.current.handlePaginationChange).toBe('function');
      expect(typeof result.current.setPaginationParams).toBe('function');
    });

    it('should have stable setPaginationParams reference', () => {
      const { result, rerender } = renderHook(() => usePaginationState());

      const firstSetPaginationParams = result.current.setPaginationParams;

      rerender();

      expect(result.current.setPaginationParams).toBe(firstSetPaginationParams);
    });

    it('should have handlePaginationChange with dependencies', () => {
      const onPaginationChange = vi.fn();
      const { result } = renderHook(() =>
        usePaginationState({
          onPaginationChange
        })
      );

      expect(typeof result.current.handlePaginationChange).toBe('function');
    });
  });
});
