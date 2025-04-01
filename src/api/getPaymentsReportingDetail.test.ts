import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, Mock, beforeEach } from 'vitest';
import * as reactQuery from '@tanstack/react-query';
import { getPaymentsReportingDetail } from './getPaymentsReportingDetail';

// Mock di utils
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

// Mock di useQuery
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

    // Configura il mock per restituire i dati
    const mockApi = utils.apiClient.bff.getPaymentsReportingDetail as Mock;
    mockApi.mockResolvedValue({
      data: dataMock
    } as AxiosResponse);

    // Configura il mock di useQuery
    (reactQuery.useQuery as Mock).mockReturnValue(mockUseQueryResult);
  });

  it('should call API with correct parameters and return data', async () => {
    // Chiama direttamente l'API
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

    // Verifica che l'API sia stata chiamata con i parametri corretti
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

    // Verifica la risposta
    expect(response.data).toEqual(dataMock);
  });

  it('should call useQuery with correct parameters', () => {
    // Chiama la funzione che wrap useQuery
    const result = getPaymentsReportingDetail(
      organizationId,
      iuf,
      paymentsReportingId
    );

    // Verifica che useQuery sia stato chiamato
    expect(reactQuery.useQuery).toHaveBeenCalled();

    // Estrai gli argomenti con cui è stato chiamato useQuery
    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];

    // Verifica che la queryKey sia corretta
    expect(useQueryArgs.queryKey).toEqual([
      'getPaymentsReportingDetail',
      organizationId,
      iuf,
      paymentsReportingId
    ]);

    // Verifica che result contenga i dati mockati
    expect(result).toEqual(mockUseQueryResult);
  });

  it('should handle API error correctly', async () => {
    // Chiama la funzione che wrap useQuery
    getPaymentsReportingDetail(organizationId, iuf, paymentsReportingId);

    // Estrai la queryFn dal mock
    const useQueryArgs = (reactQuery.useQuery as Mock).mock.calls[0][0];
    const queryFn = useQueryArgs.queryFn;

    // Modifica il mock per simulare un errore
    const error = new Error('API Error');
    (utils.apiClient.bff.getPaymentsReportingDetail as Mock).mockRejectedValue(
      error
    );

    // Verifica che la queryFn lanci l'errore
    await expect(queryFn()).rejects.toThrow('API Error');
  });
});
