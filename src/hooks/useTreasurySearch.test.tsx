import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import useTreasurySearch from './useTreasurySearch';
import { FilterValues } from '../models/Filters';

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
}));

describe('useTreasurySearch', () => {
  const initialFilters: FilterValues = {
    ACCOUNTING_DATE_FROM: null,
    ACCOUNTING_DATE_TO: null,
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
    ACCOUNT_REGISTRY_CODE: ''
  };

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useTreasurySearch({
        initialFilters
      })
    );

    expect(result.current.filters).toEqual(initialFilters);
    expect(result.current.paginationParams.page).toBe(0);
    expect(result.current.paginationParams.size).toBe(10);
  });

  it('should update filter values on applyFilters', () => {
    const { result } = renderHook(() =>
      useTreasurySearch({
        initialFilters
      })
    );

    const newFilters = { ...initialFilters, AMOUNT: 123000 };

    act(() => {
      result.current.applyFilters(newFilters);
    });

    expect(result.current.filters.AMOUNT).toBe(123000);
    expect(result.current.paginationParams.page).toBe(0);
  });
});
