import { useState, useEffect } from 'react';
import { usePaginationState } from './usePaginationState';
import { UseMutationResult } from '@tanstack/react-query';
import utils from '../utils';

export type SearchVariables<T> = {
  filters: T;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export type UseSearchProps<T, TData = unknown, TError = unknown> = {
  filters: T;
  initialPage?: number;
  initialSize?: number;
  query: UseMutationResult<TData, TError, SearchVariables<T>>;
};

/**
 * React Hook for managing search-like interfaces with filter state,
 * pagination, and sort, supporting updates of the URL fragment.
 */
export function useSearch<
  T extends Record<string, unknown>,
  TData = unknown,
  TError = unknown
>({
  filters,
  initialPage = 0,
  initialSize = 10,
  query
}: UseSearchProps<T, TData, TError>) {
  const [sort, setSort] = useState<Array<string>>([]);

  const {
    paginationParams: pagination,
    handlePaginationChange,
    setPaginationParams
  } = usePaginationState({
    initialPage,
    initialSize,
    onPaginationChange: (newPagination) => {
      setPaginationParams(newPagination);
      query.mutate({ filters, pagination: newPagination, sort });
    }
  });

  useEffect(() => {
    query.mutate({ filters, pagination: { ...pagination, page: 0 }, sort });
  }, []);

  const onSortChange = (newSort: Array<string>) => {
    setSort(newSort);
    handlePaginationChange({ ...pagination, page: 0 });
    query.mutate({
      filters,
      pagination: { ...pagination, page: 0 },
      sort: newSort
    });
  };

  const applyFilters = (filters: T) => {
    handlePaginationChange({ ...pagination, page: 0 });
    const params = utils.URI.encode(filters);
    utils.URI.set(params);
    query.mutate({
      filters,
      pagination: { ...pagination, page: 0 },
      sort
    });
  };

  return {
    applyFilters,
    query,
    handlePaginationChange,
    paginationParams: pagination,
    onSortChange,
    setSort
  };
}
