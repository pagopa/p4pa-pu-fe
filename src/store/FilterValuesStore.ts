import { signal } from '@preact/signals-react';
import { FilterValues } from '../models/Filters';

export const initialFilterValues = {
  ACCOUNTING_DATE_FROM: null,
  ACCOUNTING_DATE_TO: null,
  AMOUNT: '0',
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

export const filterValues = signal<FilterValues>(initialFilterValues);

export const setFilterValues = (newState: FilterValues) => {
  filterValues.value = newState;
};
