import { useEffect } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import utils from '../utils';
import { useHashParamsListener } from './useHashParamsListener';

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
 * React Hook for managing search interfaces with filter state,
 * pagination (with URL hash sync), and sort, performing query on changes.
 */
export function useSearch<
  T extends Record<string, unknown>,
  TData = unknown,
  TError = unknown
>({ filters, query }: UseSearchProps<T, TData, TError>) {
  const {
    page = 1,
    size = 10,
    sortDirection,
    sortField
  } = useHashParamsListener() as {
    page: number;
    size: number;
    sortDirection: string;
    sortField: string;
  };

  const sort =
    sortDirection && sortField ? [`${sortField},${sortDirection}`] : [];

  useEffect(() => {
    query.mutateAsync({
      filters,
      pagination: { size, page: page - 1 },
      sort
    });
  }, [page, size, sortDirection, sortField]);

  // Handle filter application: reset page to 0, update URL hash, and query
  const applyFilters = (appliedFilters: T) => {
    const params = utils.URI.encode(appliedFilters);
    utils.URI.set(params);

    query.mutateAsync({
      filters: appliedFilters,
      pagination: { size, page: 0 },
      sort: []
    });
  };

  return {
    applyFilters,
    query
  };
}
