import { useState, useCallback, useEffect } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
import { useStore } from '../store/GlobalStore';
import { FilterFieldValue } from '../models/Filters';
import { DebtPositionStatus } from '../../generated/apiClient';
import { usePaginationState } from './usePaginationState';
import debtPositions from '../api/debtPositions';

export type DebtPositionsFilters = {
  dateRange?: {
    from: Date;
    to: Date;
  };
  status?: DebtPositionStatus;
  fiscalCode?: string;
  iuv?: string;
  typeOrgId?: number;
};

export type UseDebtPositionFiltersProps = {
  initialFilters: DebtPositionsFilters;
  requestFn:
    | typeof debtPositions.getDebtPositionViews
    | typeof debtPositions.getInstallments;
  initialPage?: number;
  initialSize?: number;
  totalElements?: number;
};

export const useDebtPositionSearch = ({
  initialFilters,
  requestFn,
  initialPage,
  initialSize
}: UseDebtPositionFiltersProps) => {
  const {
    state: { organizationId }
  } = useStore();

  const [filterValues, setFilterValues] =
    useState<DebtPositionsFilters>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const { paginationParams, handlePaginationChange } = usePaginationState({
    initialPage,
    initialSize
  });

  const query = requestFn({ organizationId });

  const executeSearch = useCallback(
    (
      filters: DebtPositionsFilters,
      pagination: { page: number; size: number },
      sort: Array<string>
    ) => {
      query.mutate({ filters, pagination, sort });
    },
    [query]
  );

  const applyFilters = () => {
    const newPagination = { page: 0, size: paginationParams.size };
    handlePaginationChange(newPagination);
    executeSearch(filterValues, newPagination, sort);
  };

  useEffect(() => {
    executeSearch(filterValues, paginationParams, sort);
  }, []);

  const handleFilterChange = (id: string, value: FilterFieldValue): void => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      setSortModel(model);

      const apiSort = model.map(
        (item) => `${item.field},${item.sort === 'desc' ? 'DESC' : 'ASC'}`
      );

      setSort(apiSort.length > 0 ? apiSort : []);
      executeSearch(
        filterValues,
        paginationParams,
        apiSort.length > 0 ? apiSort : []
      );
    },
    [executeSearch, filterValues, paginationParams]
  );

  const handlePaginationChangeWithSearch = useCallback(
    (newPagination: { page: number; size: number }) => {
      handlePaginationChange(newPagination);
      executeSearch(filterValues, newPagination, sort);
    },
    [handlePaginationChange, executeSearch, filterValues, sort]
  );

  return {
    applyFilters,
    query,
    filterValues,
    handleFilterChange,
    handlePaginationChange: handlePaginationChangeWithSearch,
    paginationParams,
    setFilterValues,
    setSort,
    sortModel,
    handleSortModelChange
  };
};

export default useDebtPositionSearch;
