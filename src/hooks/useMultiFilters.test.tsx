import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import { useMultiFilters, FilterCategory } from './useMultiFilters';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../store/FilterStore', () => {
  const mockRemoveAllFilters = vi.fn();
  const mockSetFilterValues = vi.fn();
  const mockNoFilterIsSelected = vi.fn();
  const mockNoFilterSelectedExcludingClassificationType = vi.fn();

  return {
    removeAllFilters: mockRemoveAllFilters,
    setFilterValues: mockSetFilterValues,
    noFilterIsSelected: mockNoFilterIsSelected,
    noFilterSelectedExcludingClassificationType:
      mockNoFilterSelectedExcludingClassificationType
  };
});

const mockFilterValues = {
  ACCOUNTING_DATE_FROM: null,
  ACCOUNTING_DATE_TO: null,
  AMOUNT: null,
  BILL_CODE: '',
  BILL_FROM: null,
  DOCUMENT_CODE: '',
  DOCUMENT_CODE_FROM: null,
  IUV: '',
  IUR: '',
  IUD: '',
  IUF: '',
  PAYER: '',
  REPORT_ID: '',
  TEMPORARY_CODE: '',
  TEMPORARY_CODE_FROM: null,
  VALUE_DATE_FROM: null,
  VALUE_DATE_TO: null,
  CLASSIFICATION_TYPE: '',
  LAST_CLASSIFICATION_DATE_FROM: null,
  LAST_CLASSIFICATION_DATE_TO: null,
  REGULATION_DATE_FROM: null,
  REGULATION_DATE_TO: null
};

const mockSelectedFilters = ['IUV', 'AMOUNT'];

vi.mock('../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      filterValues: mockFilterValues,
      selectedFilters: mockSelectedFilters
    }
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

describe('useMultiFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMultiFilters());

    expect(result.current.filterValues).toEqual(mockFilterValues);
    expect(result.current.selectedFilters).toEqual(mockSelectedFilters);
    expect(result.current.filterMap).toBeDefined();
    expect(typeof result.current.removeAllFilters).toBe('function');
    expect(typeof result.current.noFilterIsSelected).toBe('function');
    expect(
      typeof result.current.noFilterSelectedExcludingClassificationType
    ).toBe('function');
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
        'IUV',
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
});
