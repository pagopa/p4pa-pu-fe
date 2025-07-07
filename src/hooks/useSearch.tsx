import { useState, useCallback, useEffect } from 'react';
import { FilterFieldValue } from '../models/Filters';
import { usePaginationState } from './usePaginationState';
import { UseMutationResult } from '@tanstack/react-query';

type SearchVariables<T> = {
  filters: T;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export type UseSearchProps<T, TData = unknown, TError = unknown> = {
  initialFilters: T;
  initialPage?: number;
  initialSize?: number;
  query: UseMutationResult<TData, TError, SearchVariables<T>>;
};

export const useSearch = <T, TData = unknown, TError = unknown>({
  initialFilters,
  initialPage = 0,
  initialSize = 10,
  query
}: UseSearchProps<T, TData, TError>) => {
  const [filters, setFilters] = useState<T>(initialFilters);
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

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue): void => {
      setFilters((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

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
    handleFilterChange,
    handlePaginationChange,
    paginationParams: pagination,
    setFilters,
    setSort
  };
};
