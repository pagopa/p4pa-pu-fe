import { useState, useCallback, useEffect } from 'react';
import { usePaginationState } from './usePaginationState';
import { UseMutationResult } from '@tanstack/react-query';

type SearchVariables<T> = {
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

export const useSearch = <T, TData = unknown, TError = unknown>({
  filters,
  initialPage = 0,
  initialSize = 10,
  query
}: UseSearchProps<T, TData, TError>) => {
  const [sort, setSort] = useState<Array<string>>([]);

  const {
    paginationParams: pagination,
    handlePaginationChange,
    setPaginationParams
  } = usePaginationState({
    initialPage,
    initialSize
  });

  // update query when pagination or sort changes
  useEffect(() => {
    query.mutateAsync({ filters, pagination, sort });
  }, [pagination, sort]);

  const applyFilters = useCallback(() => {
    // Reset to first page when applying new filters
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
    query.mutate({
      filters,
      pagination: { page: 0, size: pagination.size },
      sort
    });
  }, [filters, pagination.size, query, setPaginationParams, sort]);

  return {
    applyFilters,
    query,
    filters,
    handlePaginationChange,
    paginationParams: pagination,
    setSort
  };
};
