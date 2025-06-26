import { useState, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterValues } from '../models/Filters';
import { usePaginationState } from './usePaginationState';
import { getTreasuries } from '../api/treasuries';

export type UseTreasurySearchProps = {
  initialFilters: FilterValues;
  initialPage?: number;
  initialSize?: number;
};

const useTreasurySearch = ({
  initialFilters,
  initialPage = 0,
  initialSize = 10
}: UseTreasurySearchProps) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
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

  const query = getTreasuries({ organizationId });

  useEffect(() => {
    query.mutate({ filters, pagination, sort });
  }, []);

  const applyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
    query.mutate({
      filters: newFilters,
      pagination: { page: 0, size: pagination.size },
      sort
    });
  };

  return {
    applyFilters,
    query,
    filters,
    handlePaginationChange,
    setSort,
    paginationParams: pagination
  };
};

export default useTreasurySearch;
