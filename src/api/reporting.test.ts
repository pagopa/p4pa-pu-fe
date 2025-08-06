import utils from '../utils';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import { getPaymentsReportingRows } from './reporting';

vi.mock('./utils', () => {
  const originalModule = vi.importActual('utils');
  return {
    ...originalModule,
    apiClient: {
      bff: {
        getPaymentsReportingRows: vi.fn()
      }
    }
  };
});

describe('get Payments Reporting Rows', () => {
  it('returns data correctly', async () => {
    // Manual mock because dataMock keeps throwing errors on date fields
    const dataMock = {
      content: [
        {
          paymentsReportingId: '1',
          ingestionFlowFileId: 100,
          organizationId: 33,
          iuv: 'test-iuv-1',
          iur: 'test-iur-1',
          transferIndex: 1,
          pspIdentifier: 'psp-1',
          iuf: 'test-iuf-1',
          flowDateTime: new Date().toISOString(),
          regulationUniqueIdentifier: 'reg-1',
          regulationDate: '2023-01-01',
          senderPspType: 'type-1',
          senderPspCode: 'code-1',
          totalPayments: 10,
          totalAmountCents: 1000,
          amountPaidCents: 900,
          paymentOutcomeCode: 'outcome-1',
          payDate: '2023-01-15',
          acquiringDate: '2023-01-10'
        }
      ],
      size: 1,
      totalElements: 1,
      totalPages: 1,
      number: 0
    };

    const params = {
      organizationId: 33,
      iuf: 'test-iuf',
      query: {
        page: 0,
        size: 20
      }
    };

    const apiMock = vi
      .spyOn(utils.apiClient.bff, 'getPaymentsReportingRows')
      .mockResolvedValue({ data: dataMock } as AxiosResponse);

    const { result } = renderHook(() =>
      getPaymentsReportingRows(params.organizationId, params.iuf, params.query)
    );

    await waitFor(() => {
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        params.iuf,
        params.query
      );

      expect(result.current.data).toEqual(dataMock);
    });
  });

  it('does not fetch data when organizationId or iuf is missing', () => {
    const { result } = renderHook(() => getPaymentsReportingRows(0, '', {}));

    expect(result.current.data).toBeUndefined();
  });

  it('allows disabling the query via options', () => {
    const { result } = renderHook(() =>
      getPaymentsReportingRows(33, 'test-iuf', {}, { enabled: false })
    );

    expect(result.current.data).toBeUndefined();
  });
});
