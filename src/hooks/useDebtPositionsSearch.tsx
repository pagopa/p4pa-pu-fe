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
    | typeof debtPositions.getInstallments; // Allow passing the request function
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
  const [filterValues, setFilterValues] =
    useState<DebtPositionsFilters>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const { paginationParams, handlePaginationChange } = usePaginationState({
    initialPage,
    initialSize
  });

  const {
    state: { organizationId }
  } = useStore();

  const query = requestFn({ organizationId });

  const [appliedFilters, setAppliedFilters] =
    useState<DebtPositionsFilters>(filterValues);

  const applyFilters = useCallback(() => {
    setAppliedFilters({ ...filterValues });
    handlePaginationChange({ page: 0, size: paginationParams.size });
  }, [filterValues, handlePaginationChange, paginationParams.size]);

  const filterToRequest = useCallback((): DebtPositionViewQuery &
    DebtPositionInstallmentsQuery => {
    const payload = {
      dueDateFrom:
        appliedFilters?.dateRange?.from?.toISOString() ??
        new Date(0).toISOString(),
      dueDateTo:
        appliedFilters?.dateRange?.to?.toISOString() ??
        new Date().toISOString(),
      creationDateFrom:
        appliedFilters?.dateRange?.from?.toISOString() ??
        new Date(0).toISOString(),
      creationDateTo:
        appliedFilters?.dateRange?.to?.toISOString() ??
        new Date().toISOString(),
      page: paginationParams.page,
      size: paginationParams.size,
      ...(appliedFilters?.typeOrgId && {
        debtPositionTypeOrgId: appliedFilters.typeOrgId
      }),
      ...(appliedFilters?.iuv && { iuv: appliedFilters.iuv }),
      ...(appliedFilters?.fiscalCode && {
        fiscalCode: appliedFilters.fiscalCode
      }),
      ...(appliedFilters?.status && { status: appliedFilters.status }),
      ...(sort.length && { sort })
    };

    return payload;
  }, [appliedFilters, paginationParams, sort]);

  useEffect(() => {
    const payload = filterToRequest();
    query.mutate(payload);
  }, [
    organizationId,
    paginationParams.page,
    paginationParams.size,
    sort,
    appliedFilters,
    filterToRequest
  ]);

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

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel(model);

    const apiSort = model.map(
      (item) => `${item.field},${item.sort === 'desc' ? 'DESC' : 'ASC'}`
    );

    setSort(apiSort.length > 0 ? apiSort : []);
  }, []);

  return {
    applyFilters,
    query,
    filterValues,
    handleFilterChange,
    handlePaginationChange,
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
