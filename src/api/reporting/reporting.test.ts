import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../../__tests__/renderers';
import utils from '../../utils';
import { getPaymentsReportingRows } from '../reporting';
import type { PaymentReportingRowsFilteredRequest } from '../reporting/mappings';
import type { AxiosResponse } from 'axios';

describe('getPaymentsReportingRows', () => {
  const organizationId = 33;
  const iuf = 'test-iuf';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return payments reporting rows data', async () => {
    const mockData = {
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

    const spyGetPaymentsReportingRows = vi
      .spyOn(utils.apiClient.bff, 'getPaymentsReportingRows')
      .mockResolvedValue({
        data: mockData
      } as AxiosResponse);

    const query: PaymentReportingRowsFilteredRequest = {
      filters: {},
      pagination: { page: 0, size: 20 },
      sort: []
    };

    const { result } = renderHook(() =>
      getPaymentsReportingRows(organizationId, iuf)
    );

    // Trigger the mutation with query
    const data = await result.current.mutateAsync(query);

    // Expected params based on buildQueryParams call
    expect(spyGetPaymentsReportingRows).toHaveBeenCalledWith(
      organizationId,
      iuf,
      {
        iuv: undefined,
        page: 0,
        size: 20,
        payDateTimeFrom: undefined,
        payDateTimeTo: undefined,
        sort: []
      }
    );

    expect(data).toEqual(mockData);
  });

  it('should include filters and sort correctly in query params', async () => {
    const mockData = {
      content: [],
      size: 0,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    const spyGetPaymentsReportingRows = vi
      .spyOn(utils.apiClient.bff, 'getPaymentsReportingRows')
      .mockResolvedValue({
        data: mockData
      } as AxiosResponse);

    const filters = {
      daterange: { from: new Date('2023-01-01'), to: new Date('2023-01-31') },
      iuv: 'some-iuv'
    };

    const query: PaymentReportingRowsFilteredRequest = {
      filters,
      pagination: { page: 1, size: 10 },
      sort: ['payDate,desc']
    };

    const { result } = renderHook(() =>
      getPaymentsReportingRows(organizationId, iuf)
    );

    const data = await result.current.mutateAsync(query);

    // Construct expected query parameters manually since buildQueryParams formats dates

    const expectedQuery = {
      payDateTimeFrom: '2023-01-01T01:00:00+01:00',
      payDateTimeTo: '2023-01-31T01:00:00+01:00',
      iuv: 'some-iuv',
      page: 1,
      size: 10,
      sort: ['payDate,desc']
    };

    expect(spyGetPaymentsReportingRows).toHaveBeenCalledWith(
      organizationId,
      iuf,
      expectedQuery
    );

    expect(data).toEqual(mockData);
  });

  it('should not fetch data when organizationId or iuf is missing or disabled', () => {
    // Disabled by missing organizationId
    const { result: result1 } = renderHook(() =>
      getPaymentsReportingRows(0, iuf)
    );
    expect(result1.current.data).toBeUndefined();

    // Disabled by missing iuf
    const { result: result2 } = renderHook(() =>
      getPaymentsReportingRows(organizationId, '')
    );
    expect(result2.current.data).toBeUndefined();

    // Disabled by option
    const { result: result3 } = renderHook(() =>
      getPaymentsReportingRows(organizationId, iuf, { enabled: false })
    );
    expect(result3.current.data).toBeUndefined();
  });
});
