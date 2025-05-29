import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import debtPositions, {
  DebtPositionInstallmentsQuery,
  DebtPositionViewQuery
} from '../api/debtPositions';
import { FilterFieldValue } from '../models/Filters';
import { useDataGridPaginationWithUrl } from './useDataGridPaginationWithUrl';
import { DebtPositionStatus } from '../../generated/apiClient';

export type DebtPositionFilters = {
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
  initialFilters: DebtPositionFilters;
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
  initialSize,
  totalElements
}: UseDebtPositionFiltersProps) => {
  const [filterValues, setFilterValues] =
    useState<DebtPositionFilters>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);

  const {
    state: { organizationId }
  } = useStore();

  const query = requestFn({ organizationId });

  const {
    pagination,
    handlePageChange,
    handlePageSizeChange,
    syncWithBackendData
  } = useDataGridPaginationWithUrl({
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

  // Synchronize pagination with backend data when URL sync is enabled
  useEffect(() => {
    if (query.data) {
      syncWithBackendData(query.data);
    }
  }, [query.data, syncWithBackendData]);

  const filterToRequest = (): DebtPositionViewQuery &
    DebtPositionInstallmentsQuery => ({
    dueDateFrom:
      filterValues?.dateRange?.from?.toISOString() ?? new Date(0).toISOString(),
    dueDateTo:
      filterValues?.dateRange?.to?.toISOString() ?? new Date().toISOString(),
    creationDateFrom:
      filterValues?.dateRange?.from?.toISOString() ?? new Date(0).toISOString(),
    creationDateTo:
      filterValues?.dateRange?.to?.toISOString() ?? new Date().toISOString(),
    page: pagination.page,
    size: pagination.size,
    ...(filterValues?.typeOrgId && {
      debtPositionTypeOrgId: filterValues.typeOrgId
    }),
    ...(filterValues?.iuv && { iuv: filterValues.iuv }),
    ...(filterValues?.fiscalCode && { fiscalCode: filterValues.fiscalCode }),
    ...(filterValues?.status && { status: filterValues.status }),
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
    setSort,
    syncWithBackendData
  };
};

export default useDebtPositionSearch;
