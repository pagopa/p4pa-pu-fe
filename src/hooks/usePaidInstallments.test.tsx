import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../__tests__/renderers';
import { usePaidInstallments } from './usePaidInstallments';
import { AxiosError } from 'axios';
import { PagedPaidInstallmentsDTO } from '../api/classifications/paidInstallments/mappings';
import utils from '../utils';

const mockMutateAsync = vi.fn();
const mockQuery = {
  data: undefined as PagedPaidInstallmentsDTO | undefined,
  error: null as Error | null,
  isError: false,
  isSuccess: false,
  isPending: false,
  mutateAsync: mockMutateAsync
};

vi.mock('../api/classifications/paidInstallments', () => ({
  getPaidInstallments: vi.fn(() => mockQuery)
}));

vi.mock('../store/GlobalStore', () => ({
  useStore: () => ({
    state: { organizationId: 123 }
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

vi.mock('../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    }
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'errors.fetchPaidInstallments': 'Errore nel recupero delle rate pagate'
      };
      return translations[key] || key;
    })
  })
}));

describe('usePaidInstallments', () => {
  const defaultParams = {
    debtPositionTypeOrgCode: 'TEST_ORG_CODE',
    enabled: true,
    pageSize: 10
  };

  const mockPaidInstallmentsData = {
    content: [],
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0
  } as PagedPaidInstallmentsDTO;

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.data = undefined;
    mockQuery.error = null;
    mockQuery.isError = false;
    mockQuery.isSuccess = false;
    mockQuery.isPending = false;
  });

  describe('Initialization', () => {
    it('should initialize correctly with default values', () => {
      const { result } = renderHook(() => usePaidInstallments(defaultParams));

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isPending).toBe(false);
      expect(typeof result.current.fetchPaidInstallments).toBe('function');
    });

    it('should throw error when debtPositionTypeOrgCode is missing and enabled is true', () => {
      expect(() => {
        renderHook(() =>
          usePaidInstallments({
            ...defaultParams,
            debtPositionTypeOrgCode: ''
          })
        );
      }).toThrow('debtPositionTypeOrgCode is required');
    });

    it('should not throw error when enabled is false even if debtPositionTypeOrgCode is missing', () => {
      expect(() => {
        renderHook(() =>
          usePaidInstallments({
            ...defaultParams,
            debtPositionTypeOrgCode: '',
            enabled: false
          })
        );
      }).not.toThrow();
    });
  });

  describe('fetchPaidInstallments', () => {
    it('should fetch paid installments with basic parameters', async () => {
      mockMutateAsync.mockResolvedValueOnce(mockPaidInstallmentsData);

      const { result } = renderHook(() => usePaidInstallments(defaultParams));

      let fetchResult;
      await act(async () => {
        fetchResult = await result.current.fetchPaidInstallments();
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        debtPositionTypeOrgCode: 'TEST_ORG_CODE',
        filters: undefined,
        pagination: {
          page: 0,
          size: 10
        },
        sort: undefined
      });
      expect(fetchResult).toEqual(mockPaidInstallmentsData);
    });

    it('should include assessmentId when provided', async () => {
      mockMutateAsync.mockResolvedValueOnce(mockPaidInstallmentsData);

      const paramsWithAssessment = {
        ...defaultParams,
        assessmentId: 456
      };

      const { result } = renderHook(() =>
        usePaidInstallments(paramsWithAssessment)
      );

      await act(async () => {
        await result.current.fetchPaidInstallments();
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        debtPositionTypeOrgCode: 'TEST_ORG_CODE',
        assessmentId: 456,
        filters: undefined,
        pagination: {
          page: 0,
          size: 10
        },
        sort: undefined
      });
    });

    it('should use custom pagination parameters', async () => {
      mockMutateAsync.mockResolvedValueOnce(mockPaidInstallmentsData);

      const { result } = renderHook(() => usePaidInstallments(defaultParams));

      await act(async () => {
        await result.current.fetchPaidInstallments({
          pagination: { page: 2, size: 25 }
        });
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        debtPositionTypeOrgCode: 'TEST_ORG_CODE',
        filters: undefined,
        pagination: {
          page: 2,
          size: 25
        },
        sort: undefined
      });
    });

    it('should include filters and sort parameters', async () => {
      mockMutateAsync.mockResolvedValueOnce(mockPaidInstallmentsData);

      const { result } = renderHook(() => usePaidInstallments(defaultParams));

      const testFilters = {
        iuv: 'IUV_FILTER',
        paymentDateTimeFrom: '2023-01-01T00:00:00Z',
        paymentDateTimeTo: '2023-12-31T23:59:59Z'
      };

      const testSort = ['paymentDate,desc', 'amount,asc'];

      await act(async () => {
        await result.current.fetchPaidInstallments({
          filters: testFilters,
          sort: testSort
        });
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        debtPositionTypeOrgCode: 'TEST_ORG_CODE',
        filters: testFilters,
        pagination: {
          page: 0,
          size: 10
        },
        sort: testSort
      });
    });

    it('should throw error when hook is disabled', async () => {
      const { result } = renderHook(() =>
        usePaidInstallments({ ...defaultParams, enabled: false })
      );

      await expect(
        act(async () => {
          await result.current.fetchPaidInstallments();
        })
      ).rejects.toThrow('Hook is disabled');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors correctly', async () => {
      const mockError = new AxiosError('Network Error');
      mockError.response = { status: 404 } as AxiosError['response'];

      mockMutateAsync.mockRejectedValueOnce(mockError);
      const mockOnError = vi.fn();

      const { result } = renderHook(() =>
        usePaidInstallments({ ...defaultParams, onError: mockOnError })
      );

      await expect(
        act(async () => {
          await result.current.fetchPaidInstallments();
        })
      ).rejects.toThrow('Network Error');

      expect(utils.notify.emit).toHaveBeenCalledWith(
        'Errore nel recupero delle rate pagate',
        'error'
      );
      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });

    it('should not show notification for server errors (5xx)', async () => {
      const mockError = new AxiosError('Internal Server Error');
      mockError.response = { status: 500 } as AxiosError['response'];

      mockMutateAsync.mockRejectedValueOnce(mockError);
      const mockOnError = vi.fn();

      const { result } = renderHook(() =>
        usePaidInstallments({ ...defaultParams, onError: mockOnError })
      );

      await expect(
        act(async () => {
          await result.current.fetchPaidInstallments();
        })
      ).rejects.toThrow('Internal Server Error');

      expect(utils.notify.emit).not.toHaveBeenCalled();
      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });

    it('should log errors to console', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const mockError = new Error('Test Error');

      mockMutateAsync.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => usePaidInstallments(defaultParams));

      await expect(
        act(async () => {
          await result.current.fetchPaidInstallments();
        })
      ).rejects.toThrow('Test Error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching paid installments:',
        mockError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Query State Properties', () => {
    it('should reflect loading state', () => {
      mockQuery.isPending = true;

      const { result } = renderHook(() => usePaidInstallments(defaultParams));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isPending).toBe(true);
    });

    it('should reflect success state', () => {
      mockQuery.isSuccess = true;
      mockQuery.data = mockPaidInstallmentsData;

      const { result } = renderHook(() => usePaidInstallments(defaultParams));

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockPaidInstallmentsData);
    });

    it('should reflect error state', () => {
      const mockError = new Error('Test Error');
      mockQuery.isError = true;
      mockQuery.error = mockError;

      const { result } = renderHook(() => usePaidInstallments(defaultParams));

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('Custom pageSize', () => {
    it('should use custom pageSize in default pagination', async () => {
      mockMutateAsync.mockResolvedValueOnce(mockPaidInstallmentsData);

      const { result } = renderHook(() =>
        usePaidInstallments({ ...defaultParams, pageSize: 50 })
      );

      await act(async () => {
        await result.current.fetchPaidInstallments();
      });

      expect(mockMutateAsync).toHaveBeenCalledWith({
        debtPositionTypeOrgCode: 'TEST_ORG_CODE',
        filters: undefined,
        pagination: {
          page: 0,
          size: 50
        },
        sort: undefined
      });
    });
  });

  describe('Hook dependencies', () => {
    it('should recreate fetchPaidInstallments when dependencies change', () => {
      const { result, rerender } = renderHook(
        ({ assessmentId }: { assessmentId?: number }) =>
          usePaidInstallments({ ...defaultParams, assessmentId }),
        {
          initialProps: { assessmentId: undefined as number | undefined }
        }
      );

      const initialFetch = result.current.fetchPaidInstallments;

      rerender({ assessmentId: 123 });

      expect(result.current.fetchPaidInstallments).not.toBe(initialFetch);
    });
  });
});
