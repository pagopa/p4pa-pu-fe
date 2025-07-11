import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import { useNavigate } from 'react-router';
import { useAssessmentsSearch } from './useAssessmentsSearch';
import { FilterValues } from '../models/Filters';
import { PageRoutes } from '../routes';

type MockQueryData = {
  content: Array<unknown>;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
} | null;

type MockQueryError = Error | null;

type MockQuery = {
  mutate: Mock;
  data: MockQueryData;
  isPending: boolean;
  isError: boolean;
  error: MockQueryError;
};

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as typeof importOriginal),
    useNavigate: vi.fn()
  };
});

const mockMutate = vi.fn();
const mockQuery: MockQuery = {
  mutate: mockMutate,
  data: null,
  isPending: false,
  isError: false,
  error: null
};

vi.mock('../api/assessments', () => ({
  getAssessments: vi.fn(() => mockQuery)
}));

vi.mock('../store/GlobalStore', () => ({
  useStore: () => ({
    state: { organizationId: 123 }
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

const mockHandlePaginationChange = vi.fn();
const mockSetPaginationParams = vi.fn();

vi.mock('./usePaginationState', () => ({
  usePaginationState: vi.fn(() => ({
    paginationParams: { page: 0, size: 20 },
    handlePaginationChange: mockHandlePaginationChange,
    setPaginationParams: mockSetPaginationParams
  }))
}));

const defaultFilters: FilterValues = {
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
  LAST_UPDATE_DATE_TO: null,
  ASSESSMENT_CODE: '',
  ASSESSMENT_DESCRIPTION: '',
  SECTION_CODE: '',
  SECTION_DESCRIPTION: '',
  OFFICE_CODE: '',
  OFFICE_DESCRIPTION: '',
  OPERATING_YEAR: '',
  DEBT_POSITION_TYPE_ORG_CODE: '',
  STATUS: ''
};

describe('useAssessmentsSearch', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    mockQuery.isPending = false;
    mockQuery.isError = false;
    mockQuery.error = null;
    mockQuery.data = null;
  });

  const defaultProps = {
    initialFilters: defaultFilters,
    initialPage: 0,
    initialSize: 20
  };

  it('should expose required functions and properties', () => {
    const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

    expect(typeof result.current.applyFilters).toBe('function');
    expect(typeof result.current.executeSearch).toBe('function');
    expect(typeof result.current.setFilterValues).toBe('function');
    expect(typeof result.current.setSort).toBe('function');
    expect(typeof result.current.handlePaginationChange).toBe('function');
    expect(result.current.query).toBeDefined();
    expect(result.current.filterValues).toEqual(defaultFilters);
    expect(result.current.paginationParams).toEqual({ page: 0, size: 20 });
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

    expect(result.current.filterValues).toEqual(defaultFilters);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBe(null);
  });

  it('should not call mutate on mount when no filters are set', () => {
    renderHook(() => useAssessmentsSearch(defaultProps));

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should call mutate on mount when filters are set', () => {
    const filtersWithData = {
      ...defaultFilters,
      ASSESSMENT_NAME: 'Test Assessment'
    };

    renderHook(() =>
      useAssessmentsSearch({
        ...defaultProps,
        initialFilters: filtersWithData
      })
    );

    expect(mockMutate).toHaveBeenCalledWith(
      {
        assessmentName: 'Test Assessment',
        page: 0,
        size: 20
      },
      { onError: expect.any(Function) }
    );
  });

  describe('applyFilters', () => {
    it('should update filter values and reset pagination', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      const newFilters = {
        ...defaultFilters,
        ASSESSMENT_NAME: 'New Assessment',
        IUV: 'test-iuv'
      };

      act(() => {
        result.current.applyFilters(newFilters);
      });

      expect(result.current.filterValues).toEqual(newFilters);
      expect(mockSetPaginationParams).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockMutate).toHaveBeenCalledWith(
        {
          assessmentName: 'New Assessment',
          iuv: 'test-iuv',
          page: 0,
          size: 20
        },
        { onError: expect.any(Function) }
      );
    });

    it('should handle DEBT_TYPE filter correctly', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      const filtersWithDebtType = {
        ...defaultFilters,
        DEBT_TYPE: 'TYPE1'
      };

      act(() => {
        result.current.applyFilters(filtersWithDebtType);
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          debtPositionTypeOrgCode: 'TYPE1',
          page: 0,
          size: 20
        },
        { onError: expect.any(Function) }
      );
    });

    it('should exclude DEBT_TYPE when value is "ALL"', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      const filtersWithAllDebtType = {
        ...defaultFilters,
        DEBT_TYPE: 'ALL'
      };

      act(() => {
        result.current.applyFilters(filtersWithAllDebtType);
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          page: 0,
          size: 20
        },
        { onError: expect.any(Function) }
      );
    });

    it('should format dates correctly to ISO string', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      const testDate = new Date('2023-12-25T10:30:00.000Z');
      const filtersWithDates = {
        ...defaultFilters,
        LAST_UPDATE_DATE_FROM: testDate,
        LAST_UPDATE_DATE_TO: testDate
      };

      act(() => {
        result.current.applyFilters(filtersWithDates);
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          updateDateFrom: '2023-12-25T10:30:00.000Z',
          updateDateTo: '2023-12-25T10:30:00.000Z',
          page: 0,
          size: 20
        },
        { onError: expect.any(Function) }
      );
    });

    it('should include sort parameters when set', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      act(() => {
        result.current.setSort(['assessmentName,asc', 'updateDate,desc']);
      });

      act(() => {
        result.current.applyFilters({
          ...defaultFilters,
          ASSESSMENT_NAME: 'Test'
        });
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          assessmentName: 'Test',
          page: 0,
          size: 20,
          sort: ['assessmentName,asc', 'updateDate,desc']
        },
        { onError: expect.any(Function) }
      );
    });
  });

  describe('executeSearch', () => {
    it('should call applyFilters with current filters when no filters provided', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      // Set some filters first
      act(() => {
        result.current.setFilterValues({
          ...defaultFilters,
          ASSESSMENT_NAME: 'Current Assessment'
        });
      });

      act(() => {
        result.current.executeSearch();
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          assessmentName: 'Current Assessment',
          page: 0,
          size: 20
        },
        { onError: expect.any(Function) }
      );
    });

    it('should call applyFilters with provided filters', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      const customFilters = {
        ...defaultFilters,
        ASSESSMENT_NAME: 'Custom Assessment'
      };

      act(() => {
        result.current.executeSearch(customFilters);
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          assessmentName: 'Custom Assessment',
          page: 0,
          size: 20
        },
        { onError: expect.any(Function) }
      );
    });
  });

  describe('handleError', () => {
    it('should navigate to error page for 4xx errors', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      const axiosError = {
        response: { status: 404 }
      };

      act(() => {
        result.current.applyFilters({
          ...defaultFilters,
          ASSESSMENT_NAME: 'Test'
        });
      });

      const lastCall = mockMutate.mock.calls[mockMutate.mock.calls.length - 1];
      const errorCallback = lastCall[1].onError;
      errorCallback(axiosError);

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR, {
        state: {
          category: 'assessment-search',
          errorType: '4xx',
          statusCode: 404
        }
      });
    });

    it('should not navigate for 5xx errors', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      const serverError = {
        response: { status: 500 }
      };

      act(() => {
        result.current.applyFilters({
          ...defaultFilters,
          ASSESSMENT_NAME: 'Test'
        });
      });

      const lastCall = mockMutate.mock.calls[mockMutate.mock.calls.length - 1];
      const errorCallback = lastCall[1].onError;
      errorCallback(serverError);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle non-axios errors', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      const genericError = new Error('Generic error');

      act(() => {
        result.current.applyFilters({
          ...defaultFilters,
          ASSESSMENT_NAME: 'Test'
        });
      });

      const lastCall = mockMutate.mock.calls[mockMutate.mock.calls.length - 1];
      const errorCallback = lastCall[1].onError;
      errorCallback(genericError);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('state updates', () => {
    it('should update filter values when setFilterValues is called', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      const newFilters = {
        ...defaultFilters,
        ASSESSMENT_NAME: 'Updated Assessment'
      };

      act(() => {
        result.current.setFilterValues(newFilters);
      });

      expect(result.current.filterValues).toEqual(newFilters);
    });

    it('should update sort when setSort is called', () => {
      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      const sortOptions = ['assessmentName,desc'];

      act(() => {
        result.current.setSort(sortOptions);
      });

      // Verify sort is used in next mutation
      act(() => {
        result.current.applyFilters({
          ...defaultFilters,
          ASSESSMENT_NAME: 'Test'
        });
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          assessmentName: 'Test',
          page: 0,
          size: 20,
          sort: sortOptions
        },
        { onError: expect.any(Function) }
      );
    });
  });

  describe('query state mapping', () => {
    it('should map query state correctly', () => {
      mockQuery.isPending = true;
      mockQuery.isError = true;
      mockQuery.error = new Error('Test error');
      mockQuery.data = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 20,
        number: 0
      };

      const { result } = renderHook(() => useAssessmentsSearch(defaultProps));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(new Error('Test error'));
      expect(result.current.data).toEqual({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 20,
        number: 0
      });
    });
  });
});
