import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, Mock, beforeEach } from 'vitest';
import * as reactQuery from '@tanstack/react-query';
import { getPaymentsReportingDetail } from './getPaymentsReportingDetail';

vi.mock('../utils', () => {
  return {
    default: {
      apiClient: {
        bff: {
          getPaymentsReportingDetail: vi.fn()
        }
      }
    }
  };
});

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn()
}));

describe('getPaymentsReportingDetail API', () => {
  const dataMock = {
    ingestionFlowFileId: 1,
    organizationId: 3,
    iuf: 'iuf1',
    regulationUniqueIdentifier: '1',
    regulationDate: '2025-03-01',
    flowDateTime: '2025-04-01T00:00:00.000000',
    payments: [
      {
        paymentId: '123',
        debtor: 'Mario Rossi',
        amount: 5000,
        status: 'PAID'
      }
    ],
    totalAmountCents: 5000
  };

  const organizationId = 3;
  const iuf = 'iuf1';
  const paymentsReportingId = '1';
  const mockUseQueryResult = {
    data: dataMock,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: true
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const mockApi = utils.apiClient.bff.getPaymentsReportingDetail as Mock;
    mockApi.mockResolvedValue({
      data: dataMock
    } as AxiosResponse);

    (reactQuery.useQuery as Mock).mockReturnValue(mockUseQueryResult);
  });

  it('should call API with correct parameters and return data', async () => {
    const response = await utils.apiClient.bff.getPaymentsReportingDetail(
      organizationId,
      iuf,
      paymentsReportingId,
      {
        paramsSerializer: {
          indexes: null
        }
      }
    );

    expect(utils.apiClient.bff.getPaymentsReportingDetail).toHaveBeenCalledWith(
      organizationId,
      iuf,
      paymentsReportingId,
      {
        paramsSerializer: {
          indexes: null
        }
      }
    );

    expect(response.data).toEqual(dataMock);
  });

  it('should call useQuery with correct parameters', () => {
    const result = getPaymentsReportingDetail(
      organizationId,
      iuf,
      paymentsReportingId
    );

    expect(reactQuery.useQuery).toHaveBeenCalled();

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];

    expect(useQueryArgs.queryKey).toEqual([
      'getPaymentsReportingDetail',
      organizationId,
      iuf,
      paymentsReportingId
    ]);

    expect(result).toEqual(mockUseQueryResult);
  });

  it('should handle API error correctly', async () => {
    getPaymentsReportingDetail(organizationId, iuf, paymentsReportingId);

    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];
    const queryFn = useQueryArgs.queryFn;

    const error = new Error('API Error');
    (utils.apiClient.bff.getPaymentsReportingDetail as Mock).mockRejectedValue(
      error
    );

    await expect(queryFn()).rejects.toThrow('API Error');
  });
});
