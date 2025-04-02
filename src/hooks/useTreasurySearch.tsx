import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterFieldValue, FilterValues } from '../models/Filters';
import { useDataGridPagination } from './useDatagridPagination';
import { getTreasuries, TreasuriesQuery } from '../api/treasuries';


export type UseTreasurySearchProps = {
  initialFilters: FilterValues;
};

export const UseTreasurySearch = ({
  initialFilters
}: UseTreasurySearchProps) => {
  const [filterValues, setFilterValues] =
    useState<FilterValues>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);

  const {
    state: { organizationId }
  } = useStore();

  const query = getTreasuries(organizationId);

  const { pagination, handlePageChange, handlePageSizeChange } =
    useDataGridPagination({
      initialPage: 0,
      initialSize: 10,
      onPaginationChange: () => query.mutate(filterToRequest())
    });

  useEffect(() => {
    query.mutate(filterToRequest());
  }, [organizationId, pagination.page, pagination.size, sort]);

  const filterToRequest = (filterValuesRequest: FilterValues = filterValues): TreasuriesQuery => ({
    ...(filterValuesRequest.ACCOUNTING_DATE_FROM && { billDateFrom: filterValuesRequest.ACCOUNTING_DATE_FROM.toISOString() }),
    ...(filterValuesRequest.ACCOUNTING_DATE_TO && { billDateTo: filterValuesRequest.ACCOUNTING_DATE_TO.toISOString() }),
    ...(filterValuesRequest.AMOUNT && { billAmountCents: filterValuesRequest.AMOUNT * 100 }),
    ...(filterValuesRequest.BILL_CODE && { billCode: filterValuesRequest.BILL_CODE }),
    ...(filterValuesRequest.BILL_FROM && { billYear: filterValuesRequest.BILL_FROM.getFullYear().toString() }),
    ...(filterValuesRequest.DOCUMENT_CODE && { documentCode: filterValuesRequest.DOCUMENT_CODE }),
    ...(filterValuesRequest.DOCUMENT_CODE_FROM && { documentYear: filterValuesRequest.DOCUMENT_CODE_FROM.getFullYear().toString() }),
    ...(filterValuesRequest.IUV && { iuv: filterValuesRequest.IUV }),
    ...(filterValuesRequest.PAYER && { pspLastName: filterValuesRequest.PAYER }),
    ...(filterValuesRequest.TEMPORARY_CODE && { provisionalCode: filterValuesRequest.TEMPORARY_CODE }),
    ...(filterValuesRequest?.TEMPORARY_CODE_FROM && { provisionalAe: filterValuesRequest.TEMPORARY_CODE_FROM.getFullYear().toString() }),
    ...(filterValuesRequest.VALUE_DATE_FROM && { regionValueDateFrom: filterValuesRequest.VALUE_DATE_FROM.toISOString() }),
    ...(filterValuesRequest.VALUE_DATE_TO && { regionValueDateTo: filterValuesRequest.VALUE_DATE_TO.toISOString() }),
    ...(filterValuesRequest.REPORT_ID && { iuf: filterValuesRequest.REPORT_ID }),
    page: pagination.page,
    size: pagination.size,
    ...(sort.length && { sort }),
  });


  const applyFilters = (filterValues: FilterValues) => {
    query.mutate(filterToRequest(filterValues));
    setFilterValues(filterValues);
  }

  return {
    applyFilters,
    query,
    filterValues,
    handlePageChange,
    handlePageSizeChange,
    pagination,
    setFilterValues,
    setSort
  };
};

export default UseTreasurySearch;