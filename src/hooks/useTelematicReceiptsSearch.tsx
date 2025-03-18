import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterFieldValue } from '../models/Filters';
import { useDataGridPagination } from './useDatagridPagination';
import { getReceipts, TelematicReceiptsQuery } from '../api/receipts';

export type TelematicReceiptFilters = {
  dateRange?: {
    from: Date;
    to: Date;
  };
  iuv?: string;
  typeOrgId?: number;
};

export type UseTelematicReceiptSearchProps = {
  initialFilters: TelematicReceiptFilters;
};

export const useTelematicReceiptSearch = ({
  initialFilters
}: UseTelematicReceiptSearchProps) => {
  const [filterValues, setFilterValues] =
    useState<TelematicReceiptFilters>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);

  const {
    state: { organizationId }
  } = useStore();

  const query = getReceipts(organizationId);

  const { pagination, handlePageChange, handlePageSizeChange } =
    useDataGridPagination({
      initialPage: 0,
      initialSize: 10,
      onPaginationChange: () => query.mutate(filterToRequest())
    });

  useEffect(() => {
    query.mutate(filterToRequest());
  }, [organizationId, pagination.page, pagination.size, sort]);

  const filterToRequest = (): TelematicReceiptsQuery => ({
    paymentDateTimeFrom:
      filterValues?.dateRange?.from?.toISOString() ?? new Date(0).toISOString(),
    paymentDateTimeTo:
      filterValues?.dateRange?.to?.toISOString() ?? new Date().toISOString(),
    page: pagination.page,
    size: pagination.size,
    ...(filterValues?.typeOrgId && {
      debtPositionTypeOrgId: filterValues.typeOrgId
    }),
    ...(filterValues?.iuv && { iuv: filterValues.iuv }),
    ...(sort.length && { sort }),
    receiptOrigin: 'RECEIPT_PAGOPA'
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

export default useTelematicReceiptSearch;
