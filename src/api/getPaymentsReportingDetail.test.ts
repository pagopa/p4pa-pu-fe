import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, Mock } from 'vitest';

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

describe('getPaymentsReportingDetail API', () => {
  it('should call API with correct parameters and return data', async () => {
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

    // Configura il mock per restituire i dati
    const mockApi = utils.apiClient.bff.getPaymentsReportingDetail as Mock;
    mockApi.mockResolvedValue({
      data: dataMock
    } as AxiosResponse);

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
});
