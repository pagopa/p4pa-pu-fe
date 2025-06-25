import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/GlobalStore';
import { FilterValues } from '../models/Filters';
import { format } from 'date-fns/format';
import { usePaginationState } from './usePaginationState';
import {
  ClassificationsQuery,
  getClassifications
} from '../api/classifications';
import { ClassificationsEnum } from '../../generated/apiClient';

export type UseClassificationsSearchProps = {
  initialFilters: FilterValues;
  initialPage?: number;
  initialSize?: number;
  totalElements?: number;
};

export const UseClassificationsSearch = ({
  initialFilters,
  initialPage,
  initialSize
}: UseClassificationsSearchProps) => {
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

  const query = getClassifications(organizationId);

  useEffect(() => {
    query.mutate(filterToRequest());
  }, [organizationId, paginationParams.page, paginationParams.size, sort]);

  const filterToRequest = useCallback(
    (
      filterValuesRequest: FilterValues = filterValues,
      paginationOverride?: { page: number; size: number }
    ): ClassificationsQuery => {
      const pagination = paginationOverride || paginationParams;

      return {
        ...(filterValuesRequest.CLASSIFICATION_TYPE && {
          label: filterValuesRequest.CLASSIFICATION_TYPE as ClassificationsEnum
        }),
        ...(filterValuesRequest.IUV && { iuv: filterValuesRequest.IUV }),
        ...(filterValuesRequest.IUR && { iur: filterValuesRequest.IUR }),
        ...(filterValuesRequest.IUD && { iud: filterValuesRequest.IUD }),
        ...(filterValuesRequest.IUF && { iuf: filterValuesRequest.IUF }),
        ...(filterValuesRequest.LAST_CLASSIFICATION_DATE_FROM && {
          lastClassificationDateFrom: format(
            filterValuesRequest.LAST_CLASSIFICATION_DATE_FROM,
            'yyyy-MM-dd'
          )
        }),
        ...(filterValuesRequest.LAST_CLASSIFICATION_DATE_TO && {
          lastClassificationDateTo: format(
            filterValuesRequest.LAST_CLASSIFICATION_DATE_TO,
            'yyyy-MM-dd'
          )
        }),
        ...(filterValuesRequest.REGULATION_DATE_FROM && {
          regulationDateFrom: format(
            filterValuesRequest.REGULATION_DATE_FROM,
            'yyyy-MM-dd'
          )
        }),
        ...(filterValuesRequest.REGULATION_DATE_TO && {
          regulationDateTo: format(
            filterValuesRequest.REGULATION_DATE_TO,
            'yyyy-MM-dd'
          )
        }),
        ...(filterValuesRequest.AMOUNT && {
          billAmountCents: filterValuesRequest.AMOUNT * 100
        }),
        ...(filterValuesRequest.BILL_DATE_FROM && {
          billDateFrom: format(filterValuesRequest.BILL_DATE_FROM, 'yyyy-MM-dd')
        }),
        ...(filterValuesRequest.BILL_DATE_TO && {
          billDateTo: format(filterValuesRequest.BILL_DATE_TO, 'yyyy-MM-dd')
        }),
        ...(filterValuesRequest.PAYMENT_DATE_FROM && {
          paymentDateTimeFrom:
            filterValuesRequest.PAYMENT_DATE_FROM.toISOString()
        }),
        ...(filterValuesRequest.PAYMENT_DATE_TO && {
          paymentDateTimeTo: filterValuesRequest.PAYMENT_DATE_TO.toISOString()
        }),
        ...(filterValuesRequest.PAY_DATE_FROM && {
          payDateFrom: filterValuesRequest.PAY_DATE_FROM.toISOString()
        }),
        ...(filterValuesRequest.PAY_DATE_TO && {
          payDateTo: filterValuesRequest.PAY_DATE_TO.toISOString()
        }),
        ...(filterValuesRequest.REGULATION_UNIQUE_IDENTIFIER && {
          regulationUniqueIdentifier:
            filterValuesRequest.REGULATION_UNIQUE_IDENTIFIER
        }),
        ...(filterValuesRequest.ACCOUNT_REGISTRY_CODE && {
          accountRegistryCode: filterValuesRequest.ACCOUNT_REGISTRY_CODE
        }),
        ...(filterValuesRequest.REMITTANCE_INFORMATION && {
          remittanceInformation: filterValuesRequest.REMITTANCE_INFORMATION
        }),
        ...(filterValuesRequest.PSP_COMPANY_NAME && {
          pspCompanyName: filterValuesRequest.PSP_COMPANY_NAME
        }),
        ...(filterValuesRequest.REGION_VALUE_DATE_FROM && {
          regionValueDateFrom: format(
            filterValuesRequest.REGION_VALUE_DATE_FROM,
            'yyyy-MM-dd'
          )
        }),
        ...(filterValuesRequest.REGION_VALUE_DATE_TO && {
          regionValueDateTo: format(
            filterValuesRequest.REGION_VALUE_DATE_TO,
            'yyyy-MM-dd'
          )
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

export default UseClassificationsSearch;
