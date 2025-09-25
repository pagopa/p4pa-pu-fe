import utils from '../../utils';
import debtPositions from '../debtPositions';
import * as mapping from '../debtPositions/mapping';
import { createMock } from 'zodock';
import { AxiosResponse } from 'axios';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor } from '../../__tests__/renderers';
import { DebtPositionStatus } from '../../../generated/data-contracts';
import {
  pagedDebtPositionViewSchema,
  pagedInstallmentViewSchema
} from '../../../generated/zod-schema';
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

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn((_schema, data) => data)
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
        fiscalCode: 'RSSMRA85M01H501Z'
      },
      pagination: { page: 0, size: 10 },
      sort: ['creationDate,desc']
    };

    it('returns data correctly', async () => {
      const dataMock = createMock(pagedDebtPositionViewSchema);
      const mockQueryParams = {
        status: DebtPositionStatus.PAID,
        fiscalCode: 'RSSMRA85M01H501Z',
        page: 0,
        size: 10,
        sort: ['creationDate,desc']
      };

      (mapping.buildDebtPositionsQueryParams as Mock).mockReturnValue(
        mockQueryParams
      );

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getDebtPositionViews')
        .mockResolvedValue({ data: dataMock } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getDebtPositionViews(params)
      );

      const data = await result.current.mutateAsync(query);

      expect(data).toEqual(dataMock);

      expect(mapping.buildDebtPositionsQueryParams).toHaveBeenCalledWith(query);
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        mockQueryParams
      );
    });

    it('handles errors correctly', async () => {
      const error = new Error('API error');
      const mockQueryParams = {
        status: DebtPositionStatus.PAID,
        fiscalCode: 'RSSMRA85M01H501Z',
        page: 0,
        size: 10,
        sort: ['creationDate,desc']
      };

      (mapping.buildDebtPositionsQueryParams as Mock).mockReturnValue(
        mockQueryParams
      );

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
        fiscalCode: 'RSSMRA85M01H501Z',
        iuv: 'IUV123456789',
        dateRange: {
          from: new Date('2023-01-01'),
          to: new Date('2023-12-31')
        }
      },
      pagination: { page: 0, size: 10 },
      sort: ['dueDate,asc']
    };

    it('returns data correctly', async () => {
      const dataMock = createMock(pagedInstallmentViewSchema);
      const mockQueryParams = {
        fiscalCode: 'RSSMRA85M01H501Z',
        iuv: 'IUV123456789',
        dueDateTimeFrom: '2023-01-01T00:00:00.000Z',
        dueDateTimeTo: '2023-12-31T23:59:59.999Z',
        page: 0,
        size: 10,
        sort: ['dueDate,asc']
      };

      (mapping.buildInstallmentsQueryParams as Mock).mockReturnValue(
        mockQueryParams
      );

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getInstallments')
        .mockResolvedValue({ data: dataMock } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getInstallments(params)
      );

      const data = await result.current.mutateAsync(query);

      expect(data).toEqual(dataMock);

      expect(mapping.buildInstallmentsQueryParams).toHaveBeenCalledWith(query);
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        mockQueryParams
      );
    });

    it('handles errors correctly', async () => {
      const error = new Error('API error');
      const mockQueryParams = {
        fiscalCode: 'RSSMRA85M01H501Z',
        page: 0,
        size: 10,
        sort: ['dueDate,asc']
      };

      (mapping.buildInstallmentsQueryParams as Mock).mockReturnValue(
        mockQueryParams
      );

      vi.spyOn(utils.apiClient.bff, 'getInstallments').mockRejectedValue(error);

      const { result } = renderHook(() =>
        debtPositions.getInstallments(params)
      );

      result.current.mutate(query);

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });

    it('handles request with minimal filters', async () => {
      const minimalQuery: DebtPositionFilteredRequest = {
        filters: {},
        pagination: { page: 0, size: 20 },
        sort: []
      };

      const dataMock = createMock(pagedInstallmentViewSchema);
      const mockQueryParams = {
        page: 0,
        size: 20,
        sort: []
      };

      (mapping.buildInstallmentsQueryParams as Mock).mockReturnValue(
        mockQueryParams
      );

      const apiMock = vi
        .spyOn(utils.apiClient.bff, 'getInstallments')
        .mockResolvedValue({ data: dataMock } as AxiosResponse);

      const { result } = renderHook(() =>
        debtPositions.getInstallments(params)
      );

      const data = await result.current.mutateAsync(minimalQuery);

      expect(data).toEqual(dataMock);
      expect(mapping.buildInstallmentsQueryParams).toHaveBeenCalledWith(
        minimalQuery
      );
      expect(apiMock).toHaveBeenCalledWith(
        params.organizationId,
        mockQueryParams
      );
    });
  });
});
