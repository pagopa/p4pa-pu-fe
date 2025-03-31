import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { getPaymentsReporting } from './getPaymentsReporting';
import { renderHook, waitFor } from '../__tests__/renderers';

vi.mock('../utils', () => {
  return {
    default: {
      apiClient: {
        bff: {
          getPaymentsReporting: vi.fn()
        }
      }
    }
  };
});

describe('getPaymentsReporting', () => {
  it('returns data correctly', async () => {
    const dataMock = {
      content: [
        {
          ingestionFlowFileId: 1,
          organizationId: 3,
          iuf: 'iuf1',
          regulationUniqueIdentifier: '1',
          regulationDate: '2025-03-01',
          flowDateTime: '2025-04-01T00:00:00.000000',
          totalPayments: 1,
          totalAmountCents: 5000,
          _links: {
            self: {
              href: 'http://p4pa-classification-microservice-chart:8080/crud/payments-reporting-view/1'
            },
            paymentsReportingView: {
              href: 'http://p4pa-classification-microservice-chart:8080/crud/payments-reporting-view/1'
            }
          }
        }
      ],
      number: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1
    };

    const organizationId = 3;
    const query = {
      regulationDateFrom: '',
      regulationDateTo: '',
      page: 0,
      size: 10,
      sort: undefined
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPaymentsReporting')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() => getPaymentsReporting(organizationId));

    await result.current.mutateAsync(query);

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(result.current.data).toEqual(dataMock);
    expect(apiMock).toHaveBeenCalledWith(organizationId, query, {
      paramsSerializer: {
        indexes: null
      }
    });
  });
});
