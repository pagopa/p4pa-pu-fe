import { useState, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterFieldValue } from '../models/Filters';
import { usePaginationState } from './usePaginationState';
import { ReportingFilters } from '../api/getPaymentsReporting/mappings';
import { getPaymentsReporting } from '../api/getPaymentsReporting';

export type UseReportingSearchProps = {
  initialFilters: ReportingFilters;
  initialPage?: number;
  initialSize?: number;
};

export const useReportingSearch = ({
  initialFilters,
  initialPage = 0,
  initialSize = 10
}: UseReportingSearchProps) => {
  const [filters, setFilters] = useState<ReportingFilters>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);

  const {
    paginationParams: pagination,
    handlePaginationChange,
    setPaginationParams
  } = usePaginationState({
    initialPage,
    initialSize
  });

  const {
    state: { organizationId }
  } = useStore();

  const query = getPaymentsReporting({ organizationId });

  useEffect(() => {
    query.mutateAsync({ filters, pagination, sort });
  }, []);

  const handleFilterChange = (id: string, value: FilterFieldValue): void => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const applyFilters = () => {
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
    query.mutate({
      filters,
      pagination: { page: 0, size: pagination.size },
      sort
    });
  };

  return {
    applyFilters,
    query,
    filters,
    handleFilterChange,
    handlePaginationChange,
    setSort,
    pagination
  };
};

export default useReportingSearch;
