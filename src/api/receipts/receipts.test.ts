/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getReceipts } from './index';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import { buildQueryParams } from './mappings';
import { ReceiptOriginType } from '../../../generated/core/data-contracts';
import { AxiosResponse } from 'axios';
import { renderHook, waitFor } from '../../__tests__/renderers';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getReceipts: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

vi.mock('./mappings', () => ({
  buildQueryParams: vi.fn()
}));

vi.mock('../../../generated/core/zod-schema', () => ({
  pagedReceiptViewSchema: {}
}));

describe('getReceipts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create mutation hook correctly', () => {
    const organizationId = 123;

    const { result } = renderHook(() => getReceipts({ organizationId }));

    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('isError');
    expect(result.current).toHaveProperty('isSuccess');
    expect(typeof result.current.mutate).toBe('function');
  });

  it('should successfully fetch receipts', async () => {
    const organizationId = 123;
    const mockRequest = {
      filters: { iuv: 'test-iuv' },
      pagination: { page: 1, size: 20 },
      sort: []
    };
    const mockQuery = {
      receiptOrigin: ReceiptOriginType.RECEIPT_PAGOPA,
      page: 1,
      size: 20
    };
    const mockApiResponse: AxiosResponse<any> = {
      data: { receipts: [], totalCount: 0 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    };

    vi.mocked(buildQueryParams).mockReturnValue(mockQuery);
    vi.mocked(utils.apiClient.bff.getReceipts).mockResolvedValue(
      mockApiResponse
    );
    vi.mocked(parseAndLog).mockReturnValue(undefined);

    const { result } = renderHook(() => getReceipts({ organizationId }));

    result.current.mutate(mockRequest);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(buildQueryParams).toHaveBeenCalledWith(mockRequest);
    expect(utils.apiClient.bff.getReceipts).toHaveBeenCalledWith(
      organizationId,
      mockQuery
    );
    expect(parseAndLog).toHaveBeenCalledWith({}, mockApiResponse.data);
    expect(result.current.data).toEqual(mockApiResponse.data);
  });

  it('should handle API errors', async () => {
    const organizationId = 123;
    const mockRequest = {
      filters: {},
      pagination: { page: 1, size: 20 },
      sort: []
    };
    const mockError = new Error('API Error');

    vi.mocked(buildQueryParams).mockReturnValue({
      receiptOrigins: [
        ReceiptOriginType.RECEIPT_PAGOPA,
        ReceiptOriginType.PAYMENTS_REPORTING,
        ReceiptOriginType.RECEIPT_FILE
      ],
      page: 1,
      size: 20
    });
    vi.mocked(utils.apiClient.bff.getReceipts).mockRejectedValue(mockError);

    const { result } = renderHook(() => getReceipts({ organizationId }));

    result.current.mutate(mockRequest);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(parseAndLog).not.toHaveBeenCalled();
  });

  it('should not call parseAndLog if API call fails', async () => {
    const organizationId = 456;
    const mockRequest = {
      filters: { typeOrgId: 789 },
      pagination: { page: 2, size: 10 },
      sort: ['date:desc']
    };

    vi.mocked(buildQueryParams).mockReturnValue({
      receiptOrigins: [
        ReceiptOriginType.RECEIPT_PAGOPA,
        ReceiptOriginType.PAYMENTS_REPORTING,
        ReceiptOriginType.RECEIPT_FILE
      ],
      debtPositionTypeOrgId: 789,
      sort: ['date:desc'],
      page: 2,
      size: 10
    });
    vi.mocked(utils.apiClient.bff.getReceipts).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => getReceipts({ organizationId }));

    result.current.mutate(mockRequest);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(parseAndLog).not.toHaveBeenCalled();
  });

  it('should pass different organization ids correctly', () => {
    const orgId1 = 111;
    const orgId2 = 222;

    const { result: result1 } = renderHook(() =>
      getReceipts({ organizationId: orgId1 })
    );
    const { result: result2 } = renderHook(() =>
      getReceipts({ organizationId: orgId2 })
    );

    expect(result1.current.mutate).toBeDefined();
    expect(result2.current.mutate).toBeDefined();
    expect(result1.current.mutate).not.toBe(result2.current.mutate);
  });
});
