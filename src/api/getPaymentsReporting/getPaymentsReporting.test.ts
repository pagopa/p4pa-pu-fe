import utils from '../../utils';
import * as mappings from './mappings';
import { AxiosResponse } from 'axios';
import { describe, expect, it, Mock, vi } from 'vitest';
import { getPaymentsReporting } from '../getPaymentsReporting';
import { renderHook, waitFor } from '../../__tests__/renderers';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getPaymentsReporting: vi.fn()
      }
    }
  }
}));

vi.mock('./mappings', () => ({
  buildQueryParams: vi.fn()
}));

describe('getPaymentsReporting', () => {
  it('returns data correctly', async () => {
    const dataMock = {
      content: [
        {
          ingestionFlowFileId: 1,
          organizationId: 3,
          iuf: 'iuf1',
          iuv: '111',
          regulationUniqueIdentifier: '1',
          regulationDate: '2025-03-01',
          flowDateTime: '2025-04-01T00:00:00',
          totalPayments: 1,
          totalAmountCents: 5000,
          _links: {
            self: { href: 'http://example.com/1' },
            paymentsReportingView: { href: 'http://example.com/1' }
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
      filters: {
        dateRange: {
          from: new Date('2025-01-01'),
          to: new Date('2025-12-31')
        },
        regulationUniqueIdentifier: '',
        organizationId,
        iuf: ''
      },
      pagination: {
        page: 0,
        size: 10
      },
      sort: []
    };

    const mockQueryString =
      'page=0&size=10&from=2025-01-01&to=2025-12-31&sort=';

    (mappings.buildQueryParams as Mock).mockReturnValue(mockQueryString);

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPaymentsReporting')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getPaymentsReporting({ organizationId })
    );

    await result.current.mutateAsync(query);

    await waitFor(() => {
      expect(result.current.data).toEqual(dataMock);
    });

    expect(mappings.buildQueryParams).toHaveBeenCalledWith(query);
    expect(apiMock).toHaveBeenCalledWith(organizationId, mockQueryString);
  });
});
