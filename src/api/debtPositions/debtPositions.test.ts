import utils from '../../utils';
import debtPositions from '../debtPositions';
import * as mapping from '../debtPositions/mapping';
import { createMock } from 'zodock';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import { debtPositionViewSchema } from '../../../generated/zod-schema';
import { DebtPositionStatus } from '../../../generated/data-contracts';
import { DebtPositionFilteredRequest } from '../debtPositions/mapping';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionViews: vi.fn(),
        getInstallments: vi.fn()
      }
    }
  }
}));

vi.mock('../debtPositions/mapping', () => ({
  buildInstallmentsQueryParams: vi.fn(),
  buildDebtPositionsQueryParams: vi.fn()
}));

describe('debtPositions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDebtPositionViews', () => {
    const params = { organizationId: 10 };
    const query: DebtPositionFilteredRequest = {
      filters: {
        status: DebtPositionStatus.PAID,
        fiscalCode: ''
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    it('returns data correctly', async () => {
      const dataMock = createMock(debtPositionViewSchema);

      (mapping.buildDebtPositionsQueryParams as Mock).mockReturnValue('mock-query-string');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getDebtPositionViews')
        .mockResolvedValue({ data: dataMock } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getDebtPositionViews(params)
      );

      result.current.mutate(query);

      await waitFor(() => {
        expect(result.current.data).toEqual(dataMock);
      });

      expect(mapping.buildDebtPositionsQueryParams).toHaveBeenCalledWith(query);
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        'mock-query-string',
      );
    });

    it('handles errors correctly', async () => {
      const error = new Error('API error');

      (mapping.buildDebtPositionsQueryParams as Mock).mockReturnValue('mock-query-string');

      vi.spyOn(utils.apiClient.bff, 'getDebtPositionViews').mockRejectedValue(
        error
      );

      const { result } = renderHook(() =>
        debtPositions.getDebtPositionViews(params)
      );

      result.current.mutate(query);

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });
  });

  describe('getInstallments', () => {
    const params = { organizationId: 10 };
    const query: DebtPositionFilteredRequest = {
      filters: {
        status: DebtPositionStatus.PAID,
        fiscalCode: ''
      },
      pagination: { page: 0, size: 10 },
      sort: []
    };

    it('returns data correctly', async () => {
      const dataMock = createMock(debtPositionViewSchema);

      (mapping.buildInstallmentsQueryParams as Mock).mockReturnValue('mock-query-string');

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getInstallments')
        .mockResolvedValue({ data: dataMock } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getInstallments(params)
      );

      result.current.mutate(query);

      await waitFor(() => {
        expect(result.current.data).toEqual(dataMock);
      });

      expect(mapping.buildInstallmentsQueryParams).toHaveBeenCalledWith(query);
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        'mock-query-string',
      );
    });

    it('handles errors correctly', async () => {
      const error = new Error('API error');

      (mapping.buildInstallmentsQueryParams as Mock).mockReturnValue('mock-query-string');

      vi.spyOn(utils.apiClient.bff, 'getInstallments').mockRejectedValue(error);

      const { result } = renderHook(() =>
        debtPositions.getInstallments(params)
      );

      result.current.mutate(query);

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });
  });
});
