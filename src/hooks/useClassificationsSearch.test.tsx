import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import { useSearchParams } from 'react-router';
import UseClassificationsSearch from './useClassificationsSearch';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as typeof importOriginal),
    useSearchParams: vi.fn()
  };
});

vi.mock('../api/classifications', () => ({
  getClassifications: vi.fn(() => ({
    mutate: vi.fn(),
    data: null,
    isLoading: false,
    error: null
  }))
}));

vi.mock('../store/GlobalStore', () => ({
  useStore: () => ({
    state: { organizationId: 123 }
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

const defaultFilters = {
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

describe('UseClassificationsSearch', () => {
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as Mock).mockImplementation(() => [
      new URLSearchParams(),
      mockSetSearchParams
    ]);
  });

  const defaultProps = {
    initialFilters: defaultFilters,
    initialPage: 0,
    initialSize: 10
  };

  it('should expose required functions', () => {
    const { result } = renderHook(() => UseClassificationsSearch(defaultProps));

    expect(typeof result.current.applyFilters).toBe('function');
    expect(typeof result.current.handlePaginationChange).toBe('function');
    expect(typeof result.current.setFilterValues).toBe('function');
    expect(typeof result.current.setSort).toBe('function');
  });
});
