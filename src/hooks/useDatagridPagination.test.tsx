import { act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDataGridPagination } from './useDatagridPagination';
import { StoreProvider } from '../store/GlobalStore';
import { renderHook } from '../__tests__/renderers';

describe('useDataGridPagination', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDataGridPagination(), {
      wrapper: StoreProvider
    });

    expect(result.current.pagination).toEqual({
      page: 0,
      size: 10,
      currentPage: 1
    });
  });

  it('should initialize with custom values', () => {
    const { result } = renderHook(
      () => useDataGridPagination({ initialPage: 2, initialSize: 20 }),
      { wrapper: StoreProvider }
    );

    expect(result.current.pagination).toEqual({
      page: 2,
      size: 20,
      currentPage: 3
    });
  });

  it('should handle page change correctly', () => {
    const onPaginationChange = vi.fn();
    const { result } = renderHook(
      () => useDataGridPagination({ onPaginationChange }),
      { wrapper: StoreProvider }
    );

    act(() => {
      result.current.handlePageChange(3);
    });

    expect(result.current.pagination).toEqual({
      page: 2,
      size: 10,
      currentPage: 3
    });
    expect(onPaginationChange).toHaveBeenCalledWith({
      page: 2,
      size: 10
    });
  });

  it('should handle page size change correctly', () => {
    const onPaginationChange = vi.fn();
    const { result } = renderHook(
      () => useDataGridPagination({ onPaginationChange }),
      { wrapper: StoreProvider }
    );

    act(() => {
      result.current.handlePageSizeChange(25);
    });

    expect(result.current.pagination).toEqual({
      page: 0,
      size: 25,
      currentPage: 1
    });
    expect(onPaginationChange).toHaveBeenCalledWith({
      page: 0,
      size: 25
    });
  });

  it('should reset page to 0 when changing page size', () => {
    const { result } = renderHook(
      () => useDataGridPagination({ initialPage: 2 }),
      { wrapper: StoreProvider }
    );

    act(() => {
      result.current.handlePageSizeChange(25);
    });

    expect(result.current.pagination).toEqual({
      page: 0,
      size: 25,
      currentPage: 1
    });
  });

  it('should handle multiple page changes', () => {
    const { result } = renderHook(() => useDataGridPagination(), {
      wrapper: StoreProvider
    });

    act(() => {
      result.current.handlePageChange(3);
    });

    act(() => {
      result.current.handlePageChange(2);
    });

    expect(result.current.pagination).toEqual({
      page: 1,
      size: 10,
      currentPage: 2
    });
  });
});
