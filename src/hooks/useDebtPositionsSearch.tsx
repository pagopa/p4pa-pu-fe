import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import debtPositions, {
  DebtPositionInstallmentsQuery,
  DebtPositionViewQuery
} from '../api/debtPositions';
import { FilterFieldValue } from '../models/Filters';
import { useDataGridPagination } from './useDatagridPagination';

export type DebtPositionFilters = {
  dateRange?: {
    from: Date;
    to: Date;
  };
  status?: DebtPositionViewQuery['status'];
  fiscalCode?: string;
  iuv?: string;
  typeOrgId?: number;
};

export type UseDebtPositionFiltersProps = {
  initialFilters: DebtPositionFilters;
  requestFn:
    | typeof debtPositions.getDebtPositionViews
    | typeof debtPositions.getInstallments; // Allow passing the request function
};

export const useDebtPositionSearch = ({
  initialFilters,
  requestFn
}: UseDebtPositionFiltersProps) => {
  const [filterValues, setFilterValues] =
    useState<DebtPositionFilters>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);

  const {
    state: { organizationId }
  } = useStore();

  const query = requestFn({ organizationId });

  const { pagination, handlePageChange, handlePageSizeChange } =
    useDataGridPagination({
      initialPage: 0,
      initialSize: 10,
      onPaginationChange: () => query.mutate(filterToRequest())
    });

  useEffect(() => {
    query.mutate(filterToRequest());
  }, [organizationId, pagination.page, pagination.size, sort]);

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

export default useDebtPositionSearch;
