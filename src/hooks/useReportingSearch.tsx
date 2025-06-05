import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterFieldValue } from '../models/Filters';
import {
  getPaymentsReporting,
  PaymentsReportingQuery
} from '../api/getPaymentsReporting';
import { usePaginationState } from './usePaginationState';

export type ReportingFilters = {
  dateRange?: {
    from: Date;
    to: Date;
  };
  regulationUniqueIdentifier?: string;
  organizationId?: number;
  iuf?: string;
};

export type UseReportingSearchProps = {
  initialFilters: ReportingFilters;
  initialPage?: number;
  initialSize?: number;
};

export const useReportingSearch = ({
  initialFilters,
  initialPage,
  initialSize
}: UseReportingSearchProps) => {
  const [filterValues, setFilterValues] =
    useState<ReportingFilters>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);

  const { paginationParams, handlePaginationChange, setPaginationParams } =
    usePaginationState({
      initialPage,
      initialSize
    });

  const {
    state: { organizationId }
  } = useStore();

  const query = getPaymentsReporting(organizationId);

  useEffect(() => {
    query.mutate(filterToRequest());
  }, [organizationId, paginationParams.page, paginationParams.size, sort]);

  const filterToRequest = (): PaymentsReportingQuery => ({
    regulationDateFrom:
      filterValues?.dateRange?.from?.toISOString().slice(0, 10) ??
      new Date(0).toISOString().slice(0, 10),
    regulationDateTo:
      filterValues?.dateRange?.to?.toISOString().slice(0, 10) ??
      new Date().toISOString().slice(0, 10),
    page: paginationParams.page,
    size: paginationParams.size,
    ...(filterValues?.regulationUniqueIdentifier && {
      regulationUniqueIdentifier: filterValues.regulationUniqueIdentifier
    }),
    ...(filterValues?.iuf && { iuf: filterValues.iuf }),
    ...(sort.length && { sort })
  });

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue): void => {
      setFilterValues((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const applyFilters = useCallback(() => {
    query.mutate(filterToRequest());
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
  }, [filterToRequest, query]);

  return {
    applyFilters,
    query,
    filterValues,
    handleFilterChange,
    handlePaginationChange,
    paginationParams,
    setFilterValues,
    setSort
  };
};

export default useReportingSearch;
