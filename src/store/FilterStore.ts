import { computed, signal } from '@preact/signals-react';
import { FilterValues } from '../models/Filters';
import { FilterMap } from '../hooks/useMultiFilters';

export const initialFilterValues: FilterValues = {
  ACCOUNTING_DATE_FROM: null,
  ACCOUNTING_DATE_TO: null,
  AMOUNT: null,
  BILL_CODE: '',
  BILL_FROM: null,
  DOCUMENT_CODE: '',
  DOCUMENT_CODE_FROM: null,
  IUV: '',
  PAYER: '',
  REPORT_ID: '',
  TEMPORARY_CODE: '',
  TEMPORARY_CODE_FROM: null,
  VALUE_DATE_FROM: null,
  VALUE_DATE_TO: null
};

export const mapFilterNameToFilterValues: Record<
  KeyofFilterMap,
  Array<keyof FilterValues>
> = {
  ACCOUNTING_DATE: ['ACCOUNTING_DATE_FROM', 'ACCOUNTING_DATE_TO'],
  AMOUNT: ['AMOUNT'],
  BILL_CODE: ['BILL_CODE', 'BILL_FROM'],
  DOCUMENT_CODE: ['DOCUMENT_CODE', 'DOCUMENT_CODE_FROM'],
  IUV: ['IUV'],
  PAYER: ['PAYER'],
  REPORT_ID: ['REPORT_ID'],
  TEMPORARY_CODE: ['TEMPORARY_CODE', 'TEMPORARY_CODE_FROM'],
  VALUE_DATE: ['VALUE_DATE_FROM', 'VALUE_DATE_TO']
};

export type KeyofFilterMap = keyof FilterMap;
export type KeyofFilterValues = keyof FilterValues;

export const selectedFilters = signal<Array<KeyofFilterMap>>([]);

export function setSelectedFilters(newState: Array<KeyofFilterMap>) {
  selectedFilters.value = newState;
}

export const addFilterRow = (nextId: KeyofFilterMap) => {
  const filters = selectedFilters.value;
  setSelectedFilters([...filters, nextId]);
};

export const removeFilterRow = (id: KeyofFilterMap) => {
  const filters = selectedFilters.value;
  if (filters.length > 1) {
    setSelectedFilters(filters.filter((filterId) => filterId !== id));
    mapFilterNameToFilterValues[id].forEach((filter) => {
      resetFilterValue(filter);
    });
  }
};

export const updateFilter = (id: KeyofFilterMap, index: number) => {
  const filters = [...selectedFilters.value];
  filters[index] = id;
  setSelectedFilters(filters);
};

export const filterValues = signal<FilterValues>(initialFilterValues);

export const noFilterIsSelected = computed(() =>
  Object.values(filterValues.value).some((value) => !!value)
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
};
