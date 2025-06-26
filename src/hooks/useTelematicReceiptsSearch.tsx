import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterFieldValue } from '../models/Filters';
import { getReceipts } from '../api/receipts';
import { usePaginationState } from './usePaginationState';
import { TelematicReceiptsFilters } from '../api/receipts/mappings';

export type UseTelematicReceiptsSearchProps = {
  initialFilters: TelematicReceiptsFilters;
  initialPage?: number;
  initialSize?: number;
};

export const useTelematicReceiptSearch = ({
  initialFilters,
  initialPage = 0,
  initialSize = 10
}: UseTelematicReceiptsSearchProps) => {
  const [filters, setFilters] =
    useState<TelematicReceiptsFilters>(initialFilters);
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

  const query = getReceipts({ organizationId });

  useEffect(() => {
    query.mutateAsync({ filters, pagination, sort });
  }, []);

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue): void => {
      setFilters((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

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
    paginationParams: pagination,
    setFilters,
    setSort
  };
};

export default useTelematicReceiptSearch;
