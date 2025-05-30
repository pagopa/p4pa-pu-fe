import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterFieldValue } from '../models/Filters';
import { getReceipts, TelematicReceiptsQuery } from '../api/receipts';
import { ReceiptOriginType } from '../../generated/apiClient';
import { usePaginationState } from './usePaginationState';

export type TelematicReceiptFilters = {
  dateRange?: {
    from: Date;
    to: Date;
  };
  iuv?: string;
  typeOrgId?: number;
};

export type UseTelematicReceiptsSearchProps = {
  initialFilters: TelematicReceiptFilters;
  initialPage?: number;
  initialSize?: number;
};

export const useTelematicReceiptSearch = ({
  initialFilters,
  initialPage,
  initialSize
}: UseTelematicReceiptsSearchProps) => {
  const [filterValues, setFilterValues] =
    useState<TelematicReceiptFilters>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);
  const { paginationParams, handlePaginationChange, setPaginationParams } =
    usePaginationState({
      initialPage,
      initialSize
    });

  const {
    state: { organizationId }
  } = useStore();

  const query = getReceipts(organizationId);

  useEffect(() => {
    query.mutate(filterToRequest());
  }, [organizationId, paginationParams.page, paginationParams.size, sort]);

  const filterToRequest = (): TelematicReceiptsQuery => ({
    paymentDateTimeFrom:
      filterValues?.dateRange?.from?.toISOString() ?? new Date(0).toISOString(),
    paymentDateTimeTo:
      filterValues?.dateRange?.to?.toISOString() ?? new Date().toISOString(),
    page: paginationParams.page,
    size: paginationParams.size,
    ...(filterValues?.typeOrgId && {
      debtPositionTypeOrgId: filterValues.typeOrgId
    }),
    ...(filterValues?.iuv && { iuv: filterValues.iuv }),
    ...(sort.length && { sort }),
    receiptOrigin: ReceiptOriginType.RECEIPT_PAGOPA
  });

  const handleFilterChange = useCallback(
    (id: string, value: FilterFieldValue): void => {
      setFilterValues((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const applyFilters = useCallback(() => {
    query.mutate(filterToRequest());
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
  }, [filterToRequest, query]);

  return {
    applyFilters,
    query,
    filterValues,
    handleFilterChange,
    handlePaginationChange,
    paginationParams,
    setFilterValues,
    setSort
  };
};

export default useTelematicReceiptSearch;
