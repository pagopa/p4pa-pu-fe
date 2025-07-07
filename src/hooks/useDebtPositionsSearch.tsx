import { useState, useCallback, useEffect } from 'react';
import { GridSortModel } from '@mui/x-data-grid';
import { useStore } from '../store/GlobalStore';
import debtPositions, {
  DebtPositionInstallmentsQuery,
  DebtPositionViewQuery
} from '../api/debtPositions';
import { FilterFieldValue } from '../models/Filters';
import { DebtPositionStatus } from '../../generated/apiClient';
import { usePaginationState } from './usePaginationState';

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

  const [appliedFilters, setAppliedFilters] =
    useState<DebtPositionsFilters>(filterValues);

  const buildQueryParams = useCallback(
    (
      filters: DebtPositionsFilters,
      pagination: { page: number; size: number },
      sortParams: Array<string>
    ): DebtPositionViewQuery & DebtPositionInstallmentsQuery => {
      return {
        dueDateFrom: filters?.dateRange?.from?.toISOString(),
        dueDateTo: filters?.dateRange?.to?.toISOString(),
        creationDateFrom: filters?.dateRange?.from?.toISOString(),
        creationDateTo: filters?.dateRange?.to?.toISOString(),
        page: pagination.page,
        size: pagination.size,
        ...(filters?.typeOrgId && {
          debtPositionTypeOrgId: filters.typeOrgId
        }),
        ...(filters?.iuv && { iuv: filters.iuv }),
        ...(filters?.fiscalCode && {
          fiscalCode: filters.fiscalCode
        }),
        ...(filters?.status && { status: filters.status }),
        ...(sortParams.length && { sort: sortParams })
      };
    },
    []
  );

  const executeSearch = useCallback(
    (
      filters: DebtPositionsFilters,
      pagination: { page: number; size: number },
      sortParams: Array<string>
    ) => {
      const payload = buildQueryParams(filters, pagination, sortParams);
      query.mutate(payload);
    },
    [buildQueryParams, query]
  );

  const applyFilters = useCallback(() => {
    setAppliedFilters({ ...filterValues });
    const newPagination = { page: 0, size: paginationParams.size };
    handlePaginationChange(newPagination);
    executeSearch(filterValues, newPagination, sort);
  }, [
    filterValues,
    paginationParams.size,
    executeSearch,
    sort,
    handlePaginationChange
  ]);

  useEffect(() => {
    if (organizationId && !query.data) {
      executeSearch(appliedFilters, paginationParams, sort);
    }
  }, [organizationId]);

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue): void => {
      setFilterValues((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const updateDraftFilters = useCallback(
    (updates: Partial<DebtPositionsFilters>) => {
      setFilterValues((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const updateSingleDraftFilter = useCallback(
    (id: keyof DebtPositionsFilters, value: string) => {
      updateDraftFilters({ [id]: value });
    },
    [updateDraftFilters]
  );

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      setSortModel(model);

      const apiSort = model.map(
        (item) => `${item.field},${item.sort === 'desc' ? 'DESC' : 'ASC'}`
      );

      setSort(apiSort.length > 0 ? apiSort : []);
      executeSearch(
        appliedFilters,
        paginationParams,
        apiSort.length > 0 ? apiSort : []
      );
    },
    [executeSearch, appliedFilters, paginationParams]
  );

  const handlePaginationChangeWithSearch = useCallback(
    (newPagination: { page: number; size: number }) => {
      handlePaginationChange(newPagination);
      executeSearch(appliedFilters, newPagination, sort);
    },
    [handlePaginationChange, executeSearch, appliedFilters, sort]
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
    handleSortModelChange,
    updateDraftFilters,
    updateSingleDraftFilter
  };
};

export default useDebtPositionSearch;
