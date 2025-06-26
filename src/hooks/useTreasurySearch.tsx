import { useState, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterValues } from '../models/Filters';
import { usePaginationState } from './usePaginationState';
import { getTreasuries } from '../api/treasuries';

export type UseTreasurySearchProps = {
  filters: FilterValues;
  initialPage?: number;
  initialSize?: number;
};

export const UseTreasurySearch = ({
  filters,
  initialPage,
  initialSize
}: UseTreasurySearchProps) => {
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

  const applyFilters = (filters: FilterValues) => {
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
    handlePaginationChange,
    setSort
  };
};

export default UseTreasurySearch;
