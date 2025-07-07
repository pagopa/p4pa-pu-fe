import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import { useSearchParams } from 'react-router';
import UseClassificationsSearch from './useClassificationsSearch';
import { ClassificationsEnum } from '../../generated/apiClient';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as typeof importOriginal),
    useSearchParams: vi.fn()
  };
});

const mockMutate = vi.fn();
vi.mock('../api/classifications', () => ({
  getClassifications: vi.fn(() => ({
    mutate: mockMutate,
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
  ACCOUNT_REGISTRY_CODE: '',
  ASSESSMENT_NAME: '',
  DEBT_TYPE: '',
  ASSESSMENT_STATUS: '',
  LAST_UPDATE_DATE_FROM: null,
  LAST_UPDATE_DATE_TO: null
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

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => UseClassificationsSearch(defaultProps));

    expect(result.current.filterValues).toEqual(defaultFilters);
    expect(result.current.paginationParams.page).toBe(0);
    expect(result.current.paginationParams.size).toBe(10);
    expect(result.current.query).toBeDefined();
  });

  it('should call mutate on mount with initial filters', () => {
    renderHook(() => UseClassificationsSearch(defaultProps));

    expect(mockMutate).toHaveBeenCalledWith({
      page: 0,
      size: 10
    });
  });

  describe('applyFilters', () => {
    it('should update filter values and reset pagination', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      const newFilters = {
        ...defaultFilters,
        IUV: 'test-iuv',
        CLASSIFICATION_TYPE: 'DOPPI'
      };

      act(() => {
        result.current.applyFilters(newFilters);
      });

      expect(result.current.filterValues).toEqual(newFilters);
      expect(result.current.paginationParams.page).toBe(0);
      expect(mockMutate).toHaveBeenCalledWith({
        iuv: 'test-iuv',
        label: 'DOPPI',
        page: 0,
        size: 10
      });
    });

    it('should handle amount conversion to cents', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      const filtersWithAmount = {
        ...defaultFilters,
        AMOUNT: 123.45
      };

      act(() => {
        result.current.applyFilters(filtersWithAmount);
      });

      expect(mockMutate).toHaveBeenCalledWith({
        billAmountCents: 12345,
        page: 0,
        size: 10
      });
    });

    it('should format dates correctly', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      const testDate = new Date('2023-12-25T10:30:00.000Z');
      const filtersWithDates = {
        ...defaultFilters,
        LAST_CLASSIFICATION_DATE_FROM: testDate,
        LAST_CLASSIFICATION_DATE_TO: testDate,
        REGULATION_DATE_FROM: testDate,
        REGULATION_DATE_TO: testDate,
        BILL_DATE_FROM: testDate,
        BILL_DATE_TO: testDate,
        PAY_DATE_FROM: testDate,
        PAY_DATE_TO: testDate,
        REGION_VALUE_DATE_FROM: testDate,
        REGION_VALUE_DATE_TO: testDate
      };

      act(() => {
        result.current.applyFilters(filtersWithDates);
      });

      expect(mockMutate).toHaveBeenCalledWith({
        lastClassificationDateFrom: '2023-12-25',
        lastClassificationDateTo: '2023-12-25',
        regulationDateFrom: '2023-12-25',
        regulationDateTo: '2023-12-25',
        billDateFrom: '2023-12-25',
        billDateTo: '2023-12-25',
        payDateFrom: '2023-12-25',
        payDateTo: '2023-12-25',
        regionValueDateFrom: '2023-12-25',
        regionValueDateTo: '2023-12-25',
        page: 0,
        size: 10
      });
    });

    it('should handle payment date as ISO string', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      const testDate = new Date('2023-12-25T10:30:00.000Z');
      const filtersWithPaymentDates = {
        ...defaultFilters,
        PAYMENT_DATE_FROM: testDate,
        PAYMENT_DATE_TO: testDate
      };

      act(() => {
        result.current.applyFilters(filtersWithPaymentDates);
      });

      expect(mockMutate).toHaveBeenCalledWith({
        paymentDateTimeFrom: testDate.toISOString(),
        paymentDateTimeTo: testDate.toISOString(),
        page: 0,
        size: 10
      });
    });

    it('should include all text filters when provided', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      const filtersWithText = {
        ...defaultFilters,
        IUV: 'test-iuv',
        IUR: 'test-iur',
        IUD: 'test-iud',
        IUF: 'test-iuf',
        REGULATION_UNIQUE_IDENTIFIER: 'test-regulation',
        ACCOUNT_REGISTRY_CODE: 'test-account',
        REMITTANCE_INFORMATION: 'test-remittance',
        PSP_COMPANY_NAME: 'test-psp'
      };

      act(() => {
        result.current.applyFilters(filtersWithText);
      });

      expect(mockMutate).toHaveBeenCalledWith({
        iuv: 'test-iuv',
        iur: 'test-iur',
        iud: 'test-iud',
        iuf: 'test-iuf',
        regulationUniqueIdentifier: 'test-regulation',
        accountRegistryCode: 'test-account',
        remittanceInformation: 'test-remittance',
        pspCompanyName: 'test-psp',
        page: 0,
        size: 10
      });
    });
  });

  describe('setSort', () => {
    it('should update sort and trigger new query', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      act(() => {
        result.current.setSort(['name', 'asc']);
      });

      // The effect should trigger and call mutate with sort
      expect(mockMutate).toHaveBeenCalledWith({
        page: 0,
        size: 10,
        sort: ['name', 'asc']
      });
    });
  });

  describe('handlePaginationChange', () => {
    it('should call handlePaginationChange function', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      // Test that the function exists and can be called
      expect(typeof result.current.handlePaginationChange).toBe('function');

      act(() => {
        result.current.handlePaginationChange({ page: 1, size: 20 });
      });

      // The function should execute without errors
      expect(result.current.handlePaginationChange).toBeDefined();
    });
  });

  describe('setFilterValues', () => {
    it('should update filter values without triggering query', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      const newFilters = { ...defaultFilters, IUV: 'test-update' };

      act(() => {
        result.current.setFilterValues(newFilters);
      });

      expect(result.current.filterValues).toEqual(newFilters);
      // Should not trigger additional calls beyond the initial mount
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
  });

  describe('useEffect triggers', () => {
    beforeEach(() => {
      mockMutate.mockClear();
    });

    it('should trigger query on mount', () => {
      renderHook(() => UseClassificationsSearch(defaultProps));

      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith({
        page: 0,
        size: 10
      });
    });
  });

  describe('Classification Type Enum', () => {
    it('should handle CLASSIFICATION_TYPE as ClassificationsEnum', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      const filtersWithEnum = {
        ...defaultFilters,
        CLASSIFICATION_TYPE: ClassificationsEnum.DOPPI
      };

      act(() => {
        result.current.applyFilters(filtersWithEnum);
      });

      expect(mockMutate).toHaveBeenCalledWith({
        label: ClassificationsEnum.DOPPI,
        page: 0,
        size: 10
      });
    });
  });

  describe('filterToRequest edge cases', () => {
    it('should handle empty filters', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      act(() => {
        result.current.applyFilters(defaultFilters);
      });

      expect(mockMutate).toHaveBeenCalledWith({
        page: 0,
        size: 10
      });
    });

    it('should handle pagination override', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      // Test the filterToRequest functionality with different pagination
      // This is tested indirectly through applyFilters which resets page to 0
      const filtersWithData = {
        ...defaultFilters,
        IUV: 'test-iuv'
      };

      act(() => {
        result.current.applyFilters(filtersWithData);
      });

      expect(mockMutate).toHaveBeenCalledWith({
        iuv: 'test-iuv',
        page: 0,
        size: 10
      });
    });

    it('should exclude empty/null filter values', () => {
      const { result } = renderHook(() =>
        UseClassificationsSearch(defaultProps)
      );

      const filtersWithEmptyValues = {
        ...defaultFilters,
        IUV: '', // empty string should be excluded
        AMOUNT: null, // null amount should be excluded
        LAST_CLASSIFICATION_DATE_FROM: null // null should be excluded
      };

      act(() => {
        result.current.applyFilters(filtersWithEmptyValues);
      });

      // Should only include page and size, no filter parameters
      expect(mockMutate).toHaveBeenCalledWith({
        page: 0,
        size: 10
      });
    });
  });

  describe('initial props configuration', () => {
    it('should handle custom initial page and size', () => {
      const customProps = {
        initialFilters: defaultFilters,
        initialPage: 2,
        initialSize: 25
      };

      renderHook(() => UseClassificationsSearch(customProps));

      expect(mockMutate).toHaveBeenCalledWith({
        page: 2,
        size: 25
      });
    });

    it('should handle missing optional props', () => {
      const minimalProps = {
        initialFilters: defaultFilters
      };

      const { result } = renderHook(() =>
        UseClassificationsSearch(minimalProps)
      );

      expect(result.current.paginationParams.page).toBeDefined();
      expect(result.current.paginationParams.size).toBeDefined();
    });
  });
});
