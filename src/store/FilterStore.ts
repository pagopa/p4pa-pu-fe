import { computed, signal } from '@preact/signals-react';
import { FilterValues } from '../models/Filters';

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

export type KeyofFilterValues = keyof FilterValues;

export const selectedFilters = signal<Array<KeyofFilterValues>>([]);

export function setSelectedFilters(newState: Array<KeyofFilterValues>) {
  selectedFilters.value = newState;
}

export const addFilterRow = (nextId: KeyofFilterValues) => {
  const filters = selectedFilters.value;
  setSelectedFilters([...filters, nextId]);
};

export const removeFilterRow = (id: KeyofFilterValues) => {
  const filters = selectedFilters.value;
  if (filters.length > 1) {
    setSelectedFilters(filters.filter((filterId) => filterId !== id));
    setFilterValue(id);
  }
};

export const updateFilter = (id: KeyofFilterValues, index: number) => {
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

export const setFilterValue = (id: KeyofFilterValues) => {
  filterValues.value = {
    ...filterValues.value,
    [id]: initialFilterValues[id]
  };
};

export const removeAllFilters = () => {
  setSelectedFilters([]);
  setFilterValues(initialFilterValues);
};
