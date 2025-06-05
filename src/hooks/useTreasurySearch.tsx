import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterValues } from '../models/Filters';
import { getTreasuries, TreasuriesQuery } from '../api/treasuries';
import { format } from 'date-fns/format';
import { usePaginationState } from './usePaginationState';

export type UseTreasurySearchProps = {
  initialFilters: FilterValues;
  initialPage?: number;
  initialSize?: number;
  totalElements?: number;
};

export const UseTreasurySearch = ({
  initialFilters,
  initialPage,
  initialSize
}: UseTreasurySearchProps) => {
  const [filterValues, setFilterValues] =
    useState<FilterValues>(initialFilters);
  const [sort, setSort] = useState<Array<string>>([]);

  const { paginationParams, handlePaginationChange, setPaginationParams } =
    usePaginationState({
      initialPage,
      initialSize
    });
  const {
    state: { organizationId }
  } = useStore();

  const query = getTreasuries(organizationId);

  useEffect(() => {
    query.mutate(filterToRequest());
  }, [organizationId, paginationParams.page, paginationParams.size, sort]);

  const filterToRequest = useCallback(
    (
      filterValuesRequest: FilterValues = filterValues,
      paginationOverride?: { page: number; size: number }
    ): TreasuriesQuery => {
      const pagination = paginationOverride || paginationParams;

      return {
        ...(filterValuesRequest.ACCOUNTING_DATE_FROM && {
          billDateFrom: format(
            filterValuesRequest.ACCOUNTING_DATE_FROM,
            'yyyy-MM-dd'
          )
        }),
        ...(filterValuesRequest.ACCOUNTING_DATE_TO && {
          billDateTo: format(
            filterValuesRequest.ACCOUNTING_DATE_TO,
            'yyyy-MM-dd'
          )
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
          documentYear: format(
            filterValuesRequest.DOCUMENT_CODE_FROM,
            'yyyy-MM-dd'
          )
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
          regionValueDateTo: format(
            filterValuesRequest.VALUE_DATE_TO,
            'yyyy-MM-dd'
          )
        }),
        ...(filterValuesRequest.REPORT_ID && {
          iuf: filterValuesRequest.REPORT_ID
        }),
        page: pagination.page,
        size: pagination.size,
        ...(sort.length && { sort })
      };
    },
    [filterValues, paginationParams, sort]
  );

  const applyFilters = (filterValues: FilterValues) => {
    query.mutate(filterToRequest(filterValues));
    setFilterValues(filterValues);
    setPaginationParams((prev) => ({ ...prev, page: 0 }));
  };

  return {
    applyFilters,
    query,
    filterValues,
    handlePaginationChange,
    paginationParams,
    setFilterValues,
    setSort
  };
};

export default UseTreasurySearch;
