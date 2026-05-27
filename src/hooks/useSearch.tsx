import { useEffect } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import utils from '../utils';
import { useHashParamsListener } from './useHashParamsListener';
import { trimStringValues } from '../utils/textUtils';
import { useScreenReaderAnnouncement } from './useScreenReaderAnnouncement';
import { useTranslation } from 'react-i18next';

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
  TData extends { totalElements: number },
  TError = unknown
>({ filters, query }: UseSearchProps<T, TData, TError>) {
  const {
    page: hashPage = 1,
    size = 10,
    sortDirection,
    sortField
  } = useHashParamsListener() as {
    page: number;
    size: number;
    sortDirection: string;
    sortField: string;
  };

  const { t } = useTranslation();
  const { announce } = useScreenReaderAnnouncement();

  const page = hashPage > 0 ? hashPage - 1 : 0;

  const sort =
    sortDirection && sortField ? [`${sortField},${sortDirection}`] : [];

  useEffect(() => {
    query.mutateAsync({
      filters,
      pagination: { size, page },
      sort
    });
  }, [page, size, sortDirection, sortField]);

  // Handle filter application: resetting pagination and sort model
  const applyFilters = async (appliedFilters: T) => {
    const trimmedFilters = trimStringValues(appliedFilters);

    const params = utils.URI.encode({
      ...trimmedFilters,
      page: null,
      size: null,
      sort: null
    });
    utils.URI.set(params, { replace: true });
    const response = await query.mutateAsync({
      filters: trimmedFilters,
      pagination: { size: 10, page: 0 },
      sort: []
    });

    const resultsTable = document.getElementById('data-results-table');
    const resultsFocusable =
      resultsTable?.getElementsByClassName('MuiDataGrid-main');
    (resultsFocusable?.[0] as HTMLElement)?.focus();

    if (query.isSuccess) {
      announce(
        t('a11y.search.filtersApplied', { count: response.totalElements })
      );
    }
  };

  return {
    applyFilters,
    query
  };
}
