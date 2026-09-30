import { AxiosResponse } from 'axios';
import { act, renderHook } from '../../__tests__/renderers';
import { describe, expect, beforeEach, it, vi } from 'vitest';
import { createMock } from 'zodock';
import { pagedOrgSubUnitSchema } from '../../../generated/core/zod-schema';
import utils from '../../utils';
import {
  deleteOrgSubUnitFromOperator,
  getOperatorOrgSubUnits,
  getPagedOrgSubUnits
} from './index';
import * as loaders from '../../utils/loaders';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getOperatorOrgSubUnits: vi.fn(),
        getPagedOrgSubUnits: vi.fn(),
        deleteOrgSubUnitFromOperator: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

const mockGetOperatorOrgSubUnits = vi.mocked(
  utils.apiClient.bff.getOperatorOrgSubUnits
);
const mockGetPagedOrgSubUnits = vi.mocked(
  utils.apiClient.bff.getPagedOrgSubUnits
);
const mockDeleteOrgSubUnitFromOperator = vi.mocked(
  utils.apiClient.bff.deleteOrgSubUnitFromOperator
);
const mockParseAndLog = vi.mocked(loaders.parseAndLog);

describe('orgSubUnit API hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOperatorOrgSubUnits', () => {
    it('calls the API with the organization, operator, filters, pagination, and sort', async () => {
      const response = createMock(pagedOrgSubUnitSchema);
      mockGetOperatorOrgSubUnits.mockResolvedValue({
        data: response
      } as AxiosResponse);

      const organizationId = 123;
      const mappedExternalUserId = 'operator-1';
      const request = {
        filters: { subUnitCode: 'SUB-001' },
        pagination: { page: 1, size: 10 },
        sort: ['subUnitCode']
      };

      const { result } = renderHook(() =>
        getOperatorOrgSubUnits(organizationId, mappedExternalUserId)
      );

      await act(async () => {
        await result.current.mutateAsync(request);
      });

      expect(mockGetOperatorOrgSubUnits).toHaveBeenCalledWith(
        organizationId,
        mappedExternalUserId,
        { ...request.filters, ...request.pagination, sort: request.sort }
      );
      expect(mockParseAndLog).toHaveBeenCalledWith(
        pagedOrgSubUnitSchema,
        response
      );
    });

    it('propagates API errors', async () => {
      mockGetOperatorOrgSubUnits.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() =>
        getOperatorOrgSubUnits(123, 'operator-1')
      );

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            filters: {},
            pagination: { page: 0, size: 10 },
            sort: []
          });
        })
      ).rejects.toThrow('API Error');
      expect(mockParseAndLog).not.toHaveBeenCalled();
    });
  });

  describe('getPagedOrgSubUnits', () => {
    it('calls the API with filters, pagination, and sort', async () => {
      const response = createMock(pagedOrgSubUnitSchema);
      mockGetPagedOrgSubUnits.mockResolvedValue({
        data: response
      } as AxiosResponse);

      const organizationId = 123;
      const request = {
        filters: { subUnitCode: 'SUB-001' },
        pagination: { page: 1, size: 10 },
        sort: ['subUnitCode']
      };

      const { result } = renderHook(() => getPagedOrgSubUnits(organizationId));

      await act(async () => {
        await result.current.mutateAsync(request);
      });

      expect(mockGetPagedOrgSubUnits).toHaveBeenCalledWith(organizationId, {
        ...request.filters,
        ...request.pagination,
        sort: request.sort
      });
    });

    it('parses and returns the API response data', async () => {
      const response = createMock(pagedOrgSubUnitSchema);
      mockGetPagedOrgSubUnits.mockResolvedValue({
        data: response
      } as AxiosResponse);

      const { result } = renderHook(() => getPagedOrgSubUnits(123));
      let mutationResult: unknown;

      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          filters: {},
          pagination: { page: 0, size: 10 },
          sort: []
        });
      });

      expect(mockParseAndLog).toHaveBeenCalledWith(
        pagedOrgSubUnitSchema,
        response
      );
      expect(mutationResult).toEqual(response);
    });

    it('propagates API errors', async () => {
      mockGetPagedOrgSubUnits.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => getPagedOrgSubUnits(123));

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            filters: {},
            pagination: { page: 0, size: 10 },
            sort: []
          });
        })
      ).rejects.toThrow('API Error');
      expect(mockParseAndLog).not.toHaveBeenCalled();
    });
  });

  describe('deleteOrgSubUnitFromOperator', () => {
    it('calls the API with the organization, operator, and sub-unit identifiers', async () => {
      const response = { success: true };
      mockDeleteOrgSubUnitFromOperator.mockResolvedValue({
        data: response
      } as AxiosResponse);

      const { result } = renderHook(() =>
        deleteOrgSubUnitFromOperator(123, 'operator-1')
      );

      await act(async () => {
        await result.current.mutateAsync('SUB-001');
      });

      expect(mockDeleteOrgSubUnitFromOperator).toHaveBeenCalledWith(
        123,
        'operator-1',
        'SUB-001'
      );
    });

    it('returns the delete API response data', async () => {
      const response = { success: true };
      mockDeleteOrgSubUnitFromOperator.mockResolvedValue({
        data: response
      } as AxiosResponse);

      const { result } = renderHook(() =>
        deleteOrgSubUnitFromOperator(123, 'operator-1')
      );

      let mutationResult: unknown;
      await act(async () => {
        mutationResult = await result.current.mutateAsync('SUB-001');
      });

      expect(mutationResult).toEqual(response);
    });

    it('propagates API errors', async () => {
      mockDeleteOrgSubUnitFromOperator.mockRejectedValue(
        new Error('Delete failed')
      );

      const { result } = renderHook(() =>
        deleteOrgSubUnitFromOperator(123, 'operator-1')
      );

      await expect(
        act(async () => {
          await result.current.mutateAsync('SUB-001');
        })
      ).rejects.toThrow('Delete failed');
    });
  });
});
