import { FilterItem } from '../components/FilterContainer/FilterContainer';
import { useStore } from '../store/GlobalStore';
import { useEffect, useState } from 'react';
import {
  mapFilterNameToFilterValues,
  noFilterIsSelected,
  removeAllFilters
} from '../store/FilterStore';
import { FilterValues } from '../models/Filters';
import { useFullListMultifilters } from './useFullListMultifilters';

export enum FilterCategory {
  ASSESSMENT = 'ASSESSMENT',
  ASSESSMENTS_REGISTRY = 'ASSESSMENTS_REGISTRY',
  CLASSIFICATIONS = 'CLASSIFICATIONS',
  TREASURY = 'TREASURY'
}

export type FilterMap = Record<
  | keyof Omit<
      FilterValues,
      | 'ACCOUNTING_DATE_FROM'
      | 'ACCOUNTING_DATE_TO'
      | 'BILL_FROM'
      | 'BILL_DATE_FROM'
      | 'BILL_DATE_TO'
      | 'DOCUMENT_CODE_FROM'
      | 'TEMPORARY_CODE_FROM'
      | 'VALUE_DATE_FROM'
      | 'VALUE_DATE_TO'
      | 'REGION_VALUE_DATE_FROM'
      | 'REGION_VALUE_DATE_TO'
      | 'PAY_DATE_FROM'
      | 'PAY_DATE_TO'
      | 'LAST_CLASSIFICATION_DATE_FROM'
      | 'LAST_CLASSIFICATION_DATE_TO'
      | 'REGULATION_DATE_FROM'
      | 'REGULATION_DATE_TO'
      | 'PAYMENT_DATE_FROM'
      | 'PAYMENT_DATE_TO'
      | 'LAST_UPDATE_DATE_FROM'
      | 'LAST_UPDATE_DATE_TO'
    >
  | 'ACCOUNTING_DATE'
  | 'VALUE_DATE'
  | 'BILL_DATE'
  | 'REGION_VALUE_DATE'
  | 'PAY_DATE'
  | 'LAST_CLASSIFICATION_DATE'
  | 'REGULATION_DATE'
  | 'PAYMENT_DATE'
  | 'LAST_UPDATE_DATE',
  { label: string; fields: Array<FilterItem> }
>;

export const useMultiFilters = (props?: {
  clearOnMount?: boolean;
  filterCategory?: FilterCategory;
}) => {
  const {
    state: { filterValues, selectedFilters }
  } = useStore();

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    if (props?.clearOnMount) {
      removeAllFilters();
    }
  }, []);

  const validateDateRanges = () => {
    const errors: Record<string, string | null> = {};
    for (const filterKey in mapFilterNameToFilterValues) {
      const fields = mapFilterNameToFilterValues[filterKey as keyof FilterMap];
      if (
        fields.length === 2 &&
        fields[0].toString().endsWith('_FROM') &&
        fields[1].toString().endsWith('_TO')
      ) {
        const fromValue = filterValues[fields[0]];
        const toValue = filterValues[fields[1]];
        if ((!fromValue && toValue) || (fromValue && !toValue)) {
          errors[filterKey] =
            'Both FROM and TO dates must be set or both unset';
        } else {
          errors[filterKey] = null;
        }
      }
    }
    setValidationErrors(errors);
  };

  useEffect(() => {
    validateDateRanges();
  }, [filterValues]);

  const fullFilterMap = useFullListMultifilters();

  const assessmentFilters: Array<keyof FilterMap> = [
    'ASSESSMENT_NAME',
    'DEBT_TYPE',
    'ASSESSMENT_STATUS',
    'LAST_UPDATE_DATE',
    'IUV'
  ];

  const assessmentRegistryFilters: Array<keyof FilterMap> = [
    'ASSESSMENT_CODE',
    'ASSESSMENT_DESCRIPTION',
    'OFFICE_CODE',
    'OFFICE_DESCRIPTION',
    'SECTION_CODE',
    'SECTION_DESCRIPTION',
    'STATUS',
    'OPERATING_YEAR',
    'DEBT_POSITION_TYPE_ORG_CODE'
  ];

  const classificationsFilters: Array<keyof FilterMap> = [
    'ACCOUNT_REGISTRY_CODE',
    'AMOUNT',
    'BILL_DATE',
    'BILL_CODE',
    'CLASSIFICATION_TYPE',
    'IUD',
    'IUF',
    'IUR',
    'IUV',
    'LAST_CLASSIFICATION_DATE',
    'PAY_DATE',
    'PAYMENT_DATE',
    'PSP_COMPANY_NAME',
    'REGION_VALUE_DATE',
    'REGULATION_DATE',
    'REGULATION_UNIQUE_IDENTIFIER',
    'REMITTANCE_INFORMATION'
  ];

  const treasuryFilters: Array<keyof FilterMap> = [
    'ACCOUNTING_DATE',
    'AMOUNT',
    'BILL_CODE',
    'DOCUMENT_CODE',
    'PAYER',
    'REPORT_ID',
    'VALUE_DATE'
  ];

  const categoryMap: Record<FilterCategory, Array<keyof FilterMap>> = {
    [FilterCategory.TREASURY]: treasuryFilters,
    [FilterCategory.CLASSIFICATIONS]: classificationsFilters,
    [FilterCategory.ASSESSMENTS_REGISTRY]: assessmentRegistryFilters,
    [FilterCategory.ASSESSMENT]: assessmentFilters
  };

  const getFilteredMap = (): FilterMap => {
    if (!props?.filterCategory) {
      return fullFilterMap;
    }

    const allowedFilters = categoryMap[props.filterCategory];

    return Object.fromEntries(
      Object.entries(fullFilterMap).filter(([key]) =>
        allowedFilters.includes(key as keyof FilterMap)
      )
    ) as FilterMap;
  };

  const filterMap = getFilteredMap();

  return {
    filterMap,
    selectedFilters,
    removeAllFilters,
    noFilterIsSelected,
    filterValues,
    validationErrors,
    isValid:
      !noFilterIsSelected.peek() &&
      !Object.values(validationErrors).some((value) => value !== null)
  };
};
