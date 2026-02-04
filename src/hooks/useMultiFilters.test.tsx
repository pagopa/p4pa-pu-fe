import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import { useMultiFilters, FilterCategory } from './useMultiFilters';
import * as FilterStore from '../store/FilterStore';
import { FilterValues } from '../models/Filters';
import { filterValues } from '../store/FilterStore';

const initialFilterValues: FilterValues = {
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

describe('useMultiFilters', () => {
  beforeEach(() => {
    // Reset store state and signals
    filterValues.value = { ...initialFilterValues };
    FilterStore.selectedFilters.value = [];

    // If other signals or reactive states are used, reset them here
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMultiFilters());
    expect(result.current.filterValues).toEqual(filterValues.value);
    expect(result.current.selectedFilters).toEqual(
      FilterStore.selectedFilters.value
    );
    expect(result.current.filterMap).toBeDefined();
    expect(typeof result.current.removeAllFilters).toBe('function');
    // noFilterIsSelected is a computed ref with .value
    expect(result.current.noFilterIsSelected).toHaveProperty('value');
  });

  it('should return correct filters for filterCategory TREASURY', () => {
    const { result } = renderHook(() =>
      useMultiFilters({ filterCategory: FilterCategory.TREASURY })
    );
    expect(Object.keys(result.current.filterMap)).toEqual(
      expect.arrayContaining([
        'ACCOUNTING_DATE',
        'AMOUNT',
        'BILL_CODE',
        'DOCUMENT_CODE',
        'PAYER',
        'REPORT_ID',
        'VALUE_DATE'
      ])
    );
  });

  it('should return correct filters for filterCategory CLASSIFICATIONS', () => {
    const { result } = renderHook(() =>
      useMultiFilters({ filterCategory: FilterCategory.CLASSIFICATIONS })
    );
    expect(Object.keys(result.current.filterMap)).toEqual(
      expect.arrayContaining([
        'IUV',
        'IUR',
        'IUD',
        'IUF',
        'LAST_CLASSIFICATION_DATE',
        'REGULATION_DATE',
        'REGULATION_UNIQUE_IDENTIFIER',
        'REMITTANCE_INFORMATION',
        'PSP_COMPANY_NAME',
        'PAYMENT_DATE',
        'BILL_DATE',
        'REGION_VALUE_DATE',
        'ACCOUNT_REGISTRY_CODE',
        'AMOUNT',
        'PAY_DATE'
      ])
    );
  });

  it('should translate known keys', () => {
    const { result } = renderHook(() => useMultiFilters());
    expect(result.current.filterMap.ACCOUNTING_DATE.label).toBe(
      'commons.filters.accountingDate.label'
    );
    expect(result.current.filterMap.AMOUNT.label).toBe(
      'commons.filters.amount.label'
    );
    expect(result.current.filterMap.IUV.label).toBe(
      'commons.filters.iuv.label'
    );
    expect(result.current.filterMap.CLASSIFICATION_TYPE.label).toBe(
      'classifications.filters.classificationType'
    );
  });

  it('should validate date ranges correctly', async () => {
    // Manually set invalid date range in the store before calling useMultiFilters
    filterValues.value = {
      ...initialFilterValues,
      ACCOUNTING_DATE_FROM: new Date('2023-01-01'),
      ACCOUNTING_DATE_TO: null
    };

    // Selected filters can remain empty or preset
    FilterStore.selectedFilters.value = ['IUV', 'AMOUNT'];

    const { result } = renderHook(() => useMultiFilters());

    await waitFor(() => {
      expect(result.current.validationErrors.ACCOUNTING_DATE).toBe(
        'Both FROM and TO dates must be set or both unset'
      );
      expect(result.current.isValid).toBe(false);
    });
  });

  it('should call removeAllFilters on clearOnMount prop', () => {
    // Spy on removeAllFilters function
    const removeAllFiltersSpy = vi.spyOn(FilterStore, 'removeAllFilters');
    renderHook(() => useMultiFilters({ clearOnMount: true }));
    expect(removeAllFiltersSpy).toHaveBeenCalled();
  });

  it('should compute isValid correctly', () => {
    // Set noFilterIsSelected.value to false (filters selected)
    Object.defineProperty(FilterStore.noFilterIsSelected, 'value', {
      get: () => false,
      configurable: true
    });

    const { result } = renderHook(() => useMultiFilters());

    expect(result.current.isValid).toBe(true);
  });
});
