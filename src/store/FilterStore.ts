import { computed, signal } from '@preact/signals-react';
import { FilterValues } from '../models/Filters';
import { FilterMap } from '../hooks/useMultiFilters';
import { noFilterSetted } from '../utils/filtersValidation';
import URI from '../utils/URI';

const initialFilterValuesFromURI: Partial<FilterValues> = URI.decode(
  window.location.hash
);

/**
 * Get initial selected filters based on the initial filter values from the URI
 * @param initialFilterValuesFromURI Partial<FilterValues>
 * @returns Array <keyof FilterMap>
 */
const getInitialSelectedFilters = (
  initialFilterValuesFromURI: Partial<FilterValues>
): Array<keyof FilterMap> => {
  const filters = Object.keys(initialFilterValuesFromURI) as Array<
    keyof FilterValues
  >;
  const selected: Array<keyof FilterMap> = [];
  filters.forEach((filter) => {
    const mapEntry = Object.entries(mapFilterNameToFilterValues).find(
      ([, value]) => value.includes(filter)
    );
    if (mapEntry) {
      const [key] = mapEntry;
      if (!selected.includes(key as keyof FilterMap)) {
        selected.push(key as keyof FilterMap);
      }
    }
  });
  return selected;
};

export const initialFilterValues: FilterValues = {
  ACCOUNTING_DATE_FROM: null,
  ACCOUNTING_DATE_TO: null,
  ACCOUNT_REGISTRY_CODE: '',
  AMOUNT: null,
  BILL_CODE: '',
  BILL_FROM: null,
  BILL_DATE_FROM: null,
  BILL_DATE_TO: null,
  DOCUMENT_CODE: '',
  DOCUMENT_CODE_FROM: null,
  IUV: '',
  IUR: '',
  IUD: '',
  IUF: '',
  PAYER: '',
  PSP_COMPANY_NAME: '',
  REGULATION_UNIQUE_IDENTIFIER: '',
  REMITTANCE_INFORMATION: '',
  REPORT_ID: '',
  TEMPORARY_CODE: '',
  TEMPORARY_CODE_FROM: null,
  VALUE_DATE_FROM: null,
  VALUE_DATE_TO: null,
  REGION_VALUE_DATE_FROM: null,
  REGION_VALUE_DATE_TO: null,
  PAY_DATE_FROM: null,
  PAY_DATE_TO: null,
  CLASSIFICATION_TYPE: '',
  LAST_CLASSIFICATION_DATE_FROM: null,
  LAST_CLASSIFICATION_DATE_TO: null,
  REGULATION_DATE_FROM: null,
  REGULATION_DATE_TO: null,
  PAYMENT_DATE_FROM: null,
  PAYMENT_DATE_TO: null,
  ASSESSMENT_NAME: '',
  DEBT_TYPE: '',
  ASSESSMENT_STATUS: '',
  LAST_UPDATE_DATE_FROM: null,
  LAST_UPDATE_DATE_TO: null,
  OFFICE_CODE: '',
  OFFICE_DESCRIPTION: '',
  ASSESSMENT_CODE: '',
  ASSESSMENT_DESCRIPTION: '',
  SECTION_CODE: '',
  SECTION_DESCRIPTION: '',
  OPERATING_YEAR: '',
  DEBT_POSITION_TYPE_ORG_CODE: '',
  STATUS: ''
};

export const mapFilterNameToFilterValues: Record<
  KeyofFilterMap,
  Array<keyof FilterValues>
> = {
  ACCOUNTING_DATE: ['ACCOUNTING_DATE_FROM', 'ACCOUNTING_DATE_TO'],
  ACCOUNT_REGISTRY_CODE: ['ACCOUNT_REGISTRY_CODE'],
  AMOUNT: ['AMOUNT'],
  BILL_CODE: ['BILL_CODE', 'BILL_FROM'],
  BILL_DATE: ['BILL_DATE_FROM', 'BILL_DATE_TO'],
  DOCUMENT_CODE: ['DOCUMENT_CODE', 'DOCUMENT_CODE_FROM'],
  IUV: ['IUV'],
  IUR: ['IUR'],
  IUD: ['IUD'],
  IUF: ['IUF'],
  PAYER: ['PAYER'],
  PSP_COMPANY_NAME: ['PSP_COMPANY_NAME'],
  REGULATION_UNIQUE_IDENTIFIER: ['REGULATION_UNIQUE_IDENTIFIER'],
  REMITTANCE_INFORMATION: ['REMITTANCE_INFORMATION'],
  REPORT_ID: ['REPORT_ID'],
  TEMPORARY_CODE: ['TEMPORARY_CODE', 'TEMPORARY_CODE_FROM'],
  VALUE_DATE: ['VALUE_DATE_FROM', 'VALUE_DATE_TO'],
  REGION_VALUE_DATE: ['REGION_VALUE_DATE_FROM', 'REGION_VALUE_DATE_TO'],
  PAY_DATE: ['PAY_DATE_FROM', 'PAY_DATE_TO'],
  CLASSIFICATION_TYPE: ['CLASSIFICATION_TYPE'],
  LAST_CLASSIFICATION_DATE: [
    'LAST_CLASSIFICATION_DATE_FROM',
    'LAST_CLASSIFICATION_DATE_TO'
  ],
  REGULATION_DATE: ['REGULATION_DATE_FROM', 'REGULATION_DATE_TO'],
  PAYMENT_DATE: ['PAYMENT_DATE_FROM', 'PAYMENT_DATE_TO'],
  ASSESSMENT_NAME: ['ASSESSMENT_NAME'],
  DEBT_TYPE: ['DEBT_TYPE'],
  ASSESSMENT_STATUS: ['ASSESSMENT_STATUS'],
  LAST_UPDATE_DATE: ['LAST_UPDATE_DATE_FROM', 'LAST_UPDATE_DATE_TO'],
  OFFICE_CODE: ['OFFICE_CODE'],
  OFFICE_DESCRIPTION: ['OFFICE_DESCRIPTION'],
  ASSESSMENT_CODE: ['ASSESSMENT_CODE'],
  ASSESSMENT_DESCRIPTION: ['ASSESSMENT_DESCRIPTION'],
  SECTION_CODE: ['SECTION_CODE'],
  SECTION_DESCRIPTION: ['SECTION_DESCRIPTION'],
  OPERATING_YEAR: ['OPERATING_YEAR'],
  DEBT_POSITION_TYPE_ORG_CODE: ['DEBT_POSITION_TYPE_ORG_CODE'],
  STATUS: ['STATUS']
};

export type KeyofFilterMap = keyof FilterMap;
export type KeyofFilterValues = keyof FilterValues;

export const selectedFilters = signal<Array<KeyofFilterMap>>(
  getInitialSelectedFilters(initialFilterValuesFromURI)
);

export function setSelectedFilters(newState: Array<KeyofFilterMap>) {
  selectedFilters.value = newState;
}

export const addFilterRow = (nextId: KeyofFilterMap) => {
  const filters = selectedFilters.value;
  setSelectedFilters([...filters, nextId]);
};

export const removeFilterRow = (id: KeyofFilterMap) => {
  const filters = selectedFilters.value;
  setSelectedFilters(filters.filter((filterId) => filterId !== id));
  mapFilterNameToFilterValues[id].forEach((filter) => {
    resetFilterValue(filter);
  });
};

export const updateFilter = (id: KeyofFilterMap | undefined, index: number) => {
  // If id is undefined, it means user cleared the filter select
  // In this case, remove the filter row instead of updating it
  if (id === undefined) {
    // Check if the index exists in the array
    if (index >= 0 && index < selectedFilters.value.length) {
      const filterToRemove = selectedFilters.value[index];
      removeFilterRow(filterToRemove);
    }
    return;
  }

  const filters = [...selectedFilters.value];
  const previousFilter = filters[index];
  filters[index] = id;
  setSelectedFilters(filters);
  removeFilterRow(previousFilter);
};

export const filterValues = signal<FilterValues>({
  ...initialFilterValues,
  ...initialFilterValuesFromURI
});

export const noFilterIsSelected = computed(() =>
  noFilterSetted(filterValues.value)
);

export const setFilterValues = (newState: FilterValues) => {
  filterValues.value = newState;
};

export const resetFilterValue = (id: keyof FilterValues) => {
  filterValues.value = {
    ...filterValues.value,
    [id]: initialFilterValues[id]
  };
};

export const removeAllFilters = () => {
  setSelectedFilters([]);
  setFilterValues(initialFilterValues);
  URI.set('', { replace: true });
};
