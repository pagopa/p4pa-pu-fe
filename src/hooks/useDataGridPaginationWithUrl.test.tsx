import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';
import { useDataGridPaginationWithUrl } from './useDataGridPaginationWithUrl';

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn()
}));

describe('useDataGridPaginationWithUrl', () => {
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as Mock).mockImplementation(() => [
      new URLSearchParams(),
      mockSetSearchParams
    ]);
  });

  describe('URL sync always active mode', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useDataGridPaginationWithUrl());

      expect(result.current.pagination).toEqual({
        page: 0,
        size: 10,
        currentPage: 1
      });
    });

    it('should initialize with custom parameters', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          initialPage: 2,
          initialSize: 20
        })
      );

      expect(result.current.pagination).toEqual({
        page: 0,
        size: 20,
        currentPage: 1
      });
    });

    it('should handle page change correctly and update URL', () => {
      const onPaginationChange = vi.fn();
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          onPaginationChange
        })
      );

      act(() => {
        result.current.handlePageChange(3);
      });

      expect(result.current.pagination.page).toBe(2);
      expect(result.current.pagination.currentPage).toBe(3);
      expect(onPaginationChange).toHaveBeenCalledWith({ page: 2, size: 10 });
      expect(mockSetSearchParams).toHaveBeenCalled();
    });

    it('should handle page size change and update URL', () => {
      const onPaginationChange = vi.fn();
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          onPaginationChange,
          totalElements: 50
        })
      );

      act(() => {
        result.current.handlePageChange(3);
      });

      act(() => {
        result.current.handlePageSizeChange(20);
      });

      expect(result.current.pagination).toEqual({
        page: 2,
        size: 20,
        currentPage: 3
      });
      expect(onPaginationChange).toHaveBeenLastCalledWith({
        page: 2,
        size: 20
      });
      expect(mockSetSearchParams).toHaveBeenCalled();
    });

    it('should handle page overflow when changing size', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          totalElements: 25
        })
      );

      act(() => {
        result.current.handlePageChange(3);
      });

      act(() => {
        const newPage = result.current.handlePageSizeChange(20);
        expect(newPage).toBe(2);
      });

      expect(result.current.pagination.currentPage).toBe(2);
    });

    it('should initialize by reading URL parameters', () => {
      const mockSearchParams = new URLSearchParams('?page=3&size=25');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() => useDataGridPaginationWithUrl());

      expect(result.current.pagination).toEqual({
        page: 2,
        size: 25,
        currentPage: 3
      });
    });

    it('should update URL when page changes', () => {
      const { result } = renderHook(() => useDataGridPaginationWithUrl());

      mockSetSearchParams.mockClear();

      act(() => {
        result.current.handlePageChange(4);
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );

      const lastCallIndex = mockSetSearchParams.mock.calls.length - 1;
      const calledParams = mockSetSearchParams.mock.calls[lastCallIndex][0];
      expect(calledParams.get('page')).toBe('4');
      expect(calledParams.get('size')).toBe('10');
    });

    it('should update URL when page size changes', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          totalElements: 100
        })
      );

      mockSetSearchParams.mockClear();

      act(() => {
        result.current.handlePageSizeChange(25);
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );

      const lastCallIndex = mockSetSearchParams.mock.calls.length - 1;
      const calledParams = mockSetSearchParams.mock.calls[lastCallIndex][0];
      expect(calledParams.get('page')).toBe('1');
      expect(calledParams.get('size')).toBe('25');
    });

    it('should sync with backend data', () => {
      const { result } = renderHook(() => useDataGridPaginationWithUrl());

      const backendData = {
        number: 1,
        size: 15,
        totalElements: 100,
        totalPages: 7
      };

      mockSetSearchParams.mockClear();

      act(() => {
        result.current.syncWithBackendData(backendData);
      });

      expect(result.current.pagination).toEqual({
        page: 1,
        size: 15,
        currentPage: 2
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );

      const lastCallIndex = mockSetSearchParams.mock.calls.length - 1;
      const calledParams = mockSetSearchParams.mock.calls[lastCallIndex][0];
      expect(calledParams.get('page')).toBe('2');
      expect(calledParams.get('size')).toBe('15');
    });

    it('should handle edge case: URL page > totalPages', () => {
      const mockSearchParams = new URLSearchParams('?page=10&size=10');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() => useDataGridPaginationWithUrl());

      const backendData = {
        number: 0,
        size: 10,
        totalElements: 15,
        totalPages: 2
      };

      act(() => {
        result.current.syncWithBackendData(backendData);
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );

      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get('page')).toBe('1');
      expect(calledParams.get('size')).toBe('10');
    });

    it('should update totalElements via setter', () => {
      const { result } = renderHook(() => useDataGridPaginationWithUrl());

      act(() => {
        result.current.setTotalElements(150);
      });

      act(() => {
        result.current.handlePageChange(5);
      });

      act(() => {
        result.current.handlePageSizeChange(30);
      });

      expect(result.current.pagination.currentPage).toBe(5);
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid values in URL', () => {
      const mockSearchParams = new URLSearchParams('?page=invalid&size=abc');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          initialSize: 15
        })
      );

      expect(result.current.pagination).toEqual({
        page: 0,
        size: 15,
        currentPage: 1
      });
    });

    it('should handle totalElements = 0', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          totalElements: 0
        })
      );

      act(() => {
        result.current.handlePageSizeChange(20);
      });

      expect(result.current.pagination.currentPage).toBe(1);
    });

    it('should do nothing if syncWithBackendData receives invalid data', () => {
      const { result } = renderHook(() => useDataGridPaginationWithUrl());

      const initialPagination = result.current.pagination;

      mockSetSearchParams.mockClear();

      act(() => {
        result.current.syncWithBackendData(undefined);
      });

      expect(result.current.pagination).toEqual(initialPagination);

      act(() => {
        result.current.syncWithBackendData({
          number: 1,
          size: 0,
          totalElements: 100
        });
      });

      expect(result.current.pagination).toEqual(initialPagination);
      expect(mockSetSearchParams).not.toHaveBeenCalled();
    });
  });
});
