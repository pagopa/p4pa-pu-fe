import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterFieldValue } from '../models/Filters';
import { useDataGridPagination } from './useDatagridPagination';
import {
  getPaymentsReporting,
  PaymentsReportingQuery
} from '../api/getPaymentsReporting';

// Definizione dei filtri per la ricerca
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
  totalElements?: number;
};

export const useReportingSearch = ({
  initialFilters,
  initialPage,
  initialSize,
  totalElements
}: UseReportingSearchProps) => {
  const [filterValues, setFilterValues] =
    useState<ReportingFilters>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);

  const {
    state: { organizationId }
  } = useStore();

  const query = getPaymentsReporting(organizationId);

  const { pagination, handlePageChange, handlePageSizeChange } =
    useDataGridPagination({
      initialPage: initialPage ?? 0,
      initialSize: initialSize ?? 10,
      onPaginationChange: () => {
        query.mutate(filterToRequest());
      },
      totalElements
    });

  useEffect(() => {
    query.mutate(filterToRequest());
  }, [organizationId, pagination.page, pagination.size, sort]);

  const filterToRequest = (): PaymentsReportingQuery => ({
    regulationDateFrom:
      filterValues?.dateRange?.from?.toISOString().slice(0, 10) ??
      new Date(0).toISOString().slice(0, 10),
    regulationDateTo:
      filterValues?.dateRange?.to?.toISOString().slice(0, 10) ??
      new Date().toISOString().slice(0, 10),
    page: pagination.page,
    size: pagination.size,
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
    handlePageChange(1);
  }, [filterToRequest, query]);

  return {
    applyFilters,
    query,
    filterValues,
    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    pagination,
    setFilterValues,
    setSort
  };
};

export default useReportingSearch;
