import { useState, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterValues } from '../models/Filters';
import { useDataGridPaginationWithUrl } from './useDataGridPaginationWithUrl';
import { getTreasuries, TreasuriesQuery } from '../api/treasuries';
import { format } from 'date-fns/format';

export type UseTreasurySearchProps = {
  initialFilters: FilterValues;
  initialPage?: number;
  initialSize?: number;
  totalElements?: number;
};

export const UseTreasurySearch = ({
  initialFilters,
  initialPage,
  initialSize,
  totalElements
}: UseTreasurySearchProps) => {
  const [filterValues, setFilterValues] =
    useState<FilterValues>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);

  const {
    state: { organizationId }
  } = useStore();

  const query = getTreasuries(organizationId);

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

  const filterToRequest = (
    filterValuesRequest: FilterValues = filterValues
  ): TreasuriesQuery => ({
    ...(filterValuesRequest.ACCOUNTING_DATE_FROM && {
      billDateFrom: format(
        filterValuesRequest.ACCOUNTING_DATE_FROM,
        'yyyy-MM-dd'
      )
    }),
    ...(filterValuesRequest.ACCOUNTING_DATE_TO && {
      billDateTo: format(filterValuesRequest.ACCOUNTING_DATE_TO, 'yyyy-MM-dd')
    }),
    ...(filterValuesRequest.AMOUNT && {
      billAmountCents: filterValuesRequest.AMOUNT * 100
    }),
    ...(filterValuesRequest.BILL_CODE && {
      billCode: filterValuesRequest.BILL_CODE
    }),
    ...(filterValuesRequest.BILL_FROM && {
      billYear: filterValuesRequest.BILL_FROM.getFullYear().toString()
    }),
    ...(filterValuesRequest.DOCUMENT_CODE && {
      documentCode: filterValuesRequest.DOCUMENT_CODE
    }),
    ...(filterValuesRequest.DOCUMENT_CODE_FROM && {
      documentYear: format(filterValuesRequest.DOCUMENT_CODE_FROM, 'yyyy-MM-dd')
    }),
    ...(filterValuesRequest.IUV && { iuv: filterValuesRequest.IUV }),
    ...(filterValuesRequest.PAYER && {
      pspLastName: filterValuesRequest.PAYER
    }),
    ...(filterValuesRequest.TEMPORARY_CODE && {
      provisionalCode: filterValuesRequest.TEMPORARY_CODE
    }),
    ...(filterValuesRequest?.TEMPORARY_CODE_FROM && {
      provisionalAe: format(
        filterValuesRequest.TEMPORARY_CODE_FROM,
        'yyyy-MM-dd'
      )
    }),
    ...(filterValuesRequest.VALUE_DATE_FROM && {
      regionValueDateFrom: format(
        filterValuesRequest.VALUE_DATE_FROM,
        'yyyy-MM-dd'
      )
    }),
    ...(filterValuesRequest.VALUE_DATE_TO && {
      regionValueDateTo: format(filterValuesRequest.VALUE_DATE_TO, 'yyyy-MM-dd')
    }),
    ...(filterValuesRequest.REPORT_ID && {
      iuf: filterValuesRequest.REPORT_ID
    }),
    page: pagination.page,
    size: pagination.size,
    ...(sort.length && { sort })
  });

  const applyFilters = (filterValues: FilterValues) => {
    query.mutate(filterToRequest(filterValues));
    setFilterValues(filterValues);
    // Note: We don't reset the page here because Treasury handles filters separately from pagination
  };

  return {
    applyFilters,
    query,
    filterValues,
    handlePageChange,
    handlePageSizeChange,
    pagination,
    setFilterValues,
    setSort,
    syncWithBackendData
  };
};

export default UseTreasurySearch;
