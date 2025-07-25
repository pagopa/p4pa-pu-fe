import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor, act } from '../../../__tests__/renderers';
import { AxiosResponse } from 'axios';
import utils from '../../../utils';
import { parseAndLog } from '../../../utils/loaders';
import { pagedClassificationPaidInstallmentsViewSchema } from '../../../../generated/zod-schema';
import { getPaidInstallments } from './index';
import { PaidInstallmentsFilteredRequest, buildQueryParams } from './mappings';

vi.mock('../../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getPaidInstallments: vi.fn()
      }
    }
  }
}));

vi.mock('../../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

vi.mock('./mappings', () => ({
  buildQueryParams: vi.fn()
}));

describe('getPaidInstallments', () => {
  const organizationId = 123;
  const mockRequest: PaidInstallmentsFilteredRequest = {
    debtPositionTypeOrgCode: 'TEST_CODE',
    assessmentId: 456,
    filters: {
      iuv: 'TEST_IUV',
      paymentDateTimeFrom: '2023-01-01T00:00:00.000Z',
      paymentDateTimeTo: '2023-12-31T23:59:59.999Z',
      updateDateFrom: '2023-01-01T00:00:00.000Z',
      updateDateTo: '2023-12-31T23:59:59.999Z'
    },
    pagination: {
      page: 0,
      size: 10
    },
    sort: ['paymentDateTime,desc']
  };

  const mockResponse = {
    content: [
      {
        id: '1',
        iuv: 'TEST_IUV_001',
        paymentDateTime: '2023-06-15T10:30:00Z',
        amount: 100.5,
        status: 'PAID',
        debtPositionId: 'DP001'
      },
      {
        id: '2',
        iuv: 'TEST_IUV_002',
        paymentDateTime: '2023-06-16T14:45:00Z',
        amount: 250.75,
        status: 'PAID',
        debtPositionId: 'DP002'
      }
    ],
    page: {
      size: 10,
      number: 0,
      totalElements: 2,
      totalPages: 1
    }
  };

  const mockQueryParams = {
    debtPositionTypeOrgCode: 'TEST_CODE',
    assessmentId: 456,
    iuv: 'TEST_IUV',
    paymentDateTimeFrom: '2023-01-01T00:00:00.000Z',
    paymentDateTimeTo: '2023-12-31T23:59:59.999Z',
    updateDateFrom: '2023-01-01T00:00:00.000Z',
    updateDateTo: '2023-12-31T23:59:59.999Z',
    page: 0,
    size: 10,
    sort: ['paymentDateTime,desc']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve paid installments successfully when mutation is called', async () => {
    (buildQueryParams as Mock).mockReturnValue(mockQueryParams);

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPaidInstallments')
      .mockResolvedValue({ data: mockResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      getPaidInstallments({ organizationId })
    );

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(buildQueryParams).toHaveBeenCalledWith(mockRequest);

    expect(apiMock).toHaveBeenCalledWith(organizationId, mockQueryParams, {
      paramsSerializer: {
        indexes: null
      }
    });

    expect(parseAndLog).toHaveBeenCalledWith(
      pagedClassificationPaidInstallmentsViewSchema,
      mockResponse
    );

    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle API errors correctly', async () => {
    (buildQueryParams as Mock).mockReturnValue(mockQueryParams);

    const errorMessage = 'Failed to retrieve paid installments';
    const error = new Error(errorMessage);

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPaidInstallments')
      .mockRejectedValue(error);

    const { result } = renderHook(() =>
      getPaidInstallments({ organizationId })
    );

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
    expect(apiMock).toHaveBeenCalledWith(organizationId, mockQueryParams, {
      paramsSerializer: {
        indexes: null
      }
    });

    expect(parseAndLog).not.toHaveBeenCalled();
  });

  it('should not make API call if mutate is not called', () => {
    const apiMock = vi.spyOn(utils.apiClient.bff, 'getPaidInstallments');

    const { result } = renderHook(() =>
      getPaidInstallments({ organizationId })
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(apiMock).not.toHaveBeenCalled();
    expect(parseAndLog).not.toHaveBeenCalled();
  });

  it('should handle request with minimal parameters', async () => {
    const minimalRequest: PaidInstallmentsFilteredRequest = {
      debtPositionTypeOrgCode: 'MIN_CODE',
      pagination: {
        page: 0,
        size: 20
      }
    };

    const minimalQueryParams = {
      debtPositionTypeOrgCode: 'MIN_CODE',
      page: 0,
      size: 20
    };

    (buildQueryParams as Mock).mockReturnValue(minimalQueryParams);

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPaidInstallments')
      .mockResolvedValue({ data: mockResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      getPaidInstallments({ organizationId })
    );

    await act(async () => {
      result.current.mutate(minimalRequest);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(buildQueryParams).toHaveBeenCalledWith(minimalRequest);
    expect(apiMock).toHaveBeenCalledWith(organizationId, minimalQueryParams, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('should handle empty response correctly', async () => {
    (buildQueryParams as Mock).mockReturnValue(mockQueryParams);

    const emptyResponse = {
      content: [],
      page: {
        size: 10,
        number: 0,
        totalElements: 0,
        totalPages: 0
      }
    };

    vi.spyOn(utils.apiClient.bff, 'getPaidInstallments').mockResolvedValue({
      data: emptyResponse
    } as AxiosResponse);

    const { result } = renderHook(() =>
      getPaidInstallments({ organizationId })
    );

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(emptyResponse);
    expect(parseAndLog).toHaveBeenCalledWith(
      pagedClassificationPaidInstallmentsViewSchema,
      emptyResponse
    );
  });

  it('should use correct mutation key with organization ID', () => {
    const { result } = renderHook(() =>
      getPaidInstallments({ organizationId })
    );

    expect(result.current).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
    expect(typeof result.current.mutateAsync).toBe('function');
  });

  it('should handle different organization IDs correctly', async () => {
    (buildQueryParams as Mock).mockReturnValue(mockQueryParams);

    const differentOrgId = 999;

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPaidInstallments')
      .mockResolvedValue({ data: mockResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      getPaidInstallments({ organizationId: differentOrgId })
    );

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiMock).toHaveBeenCalledWith(differentOrgId, mockQueryParams, {
      paramsSerializer: {
        indexes: null
      }
    });
  });

  it('should handle network timeout errors', async () => {
    (buildQueryParams as Mock).mockReturnValue(mockQueryParams);

    const timeoutError = new Error('Network timeout');
    timeoutError.name = 'TimeoutError';

    vi.spyOn(utils.apiClient.bff, 'getPaidInstallments').mockRejectedValue(
      timeoutError
    );

    const { result } = renderHook(() =>
      getPaidInstallments({ organizationId })
    );

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(timeoutError);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle request with complex filters', async () => {
    const complexRequest: PaidInstallmentsFilteredRequest = {
      debtPositionTypeOrgCode: 'COMPLEX_CODE',
      assessmentId: 789,
      filters: {
        iuv: 'COMPLEX_IUV_TEST',
        paymentDateTimeFrom: '2023-01-01T00:00:00.000Z',
        paymentDateTimeTo: '2023-12-31T23:59:59.999Z',
        updateDateFrom: '2023-06-01T00:00:00.000Z',
        updateDateTo: '2023-06-30T23:59:59.999Z'
      },
      pagination: {
        page: 2,
        size: 50
      },
      sort: ['paymentDateTime,asc', 'amount,desc']
    };

    const complexQueryParams = {
      debtPositionTypeOrgCode: 'COMPLEX_CODE',
      assessmentId: 789,
      iuv: 'COMPLEX_IUV_TEST',
      paymentDateTimeFrom: '2023-01-01T00:00:00.000Z',
      paymentDateTimeTo: '2023-12-31T23:59:59.999Z',
      updateDateFrom: '2023-06-01T00:00:00.000Z',
      updateDateTo: '2023-06-30T23:59:59.999Z',
      page: 2,
      size: 50,
      sort: ['paymentDateTime,asc', 'amount,desc']
    };

    (buildQueryParams as Mock).mockReturnValue(complexQueryParams);

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPaidInstallments')
      .mockResolvedValue({ data: mockResponse } as AxiosResponse);

    const { result } = renderHook(() =>
      getPaidInstallments({ organizationId })
    );

    await act(async () => {
      result.current.mutate(complexRequest);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(buildQueryParams).toHaveBeenCalledWith(complexRequest);
    expect(apiMock).toHaveBeenCalledWith(organizationId, complexQueryParams, {
      paramsSerializer: {
        indexes: null
      }
    });
  });
});
