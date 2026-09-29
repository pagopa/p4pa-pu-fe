import { AxiosResponse } from 'axios';
import { act, renderHook } from '../../__tests__/renderers';
import { describe, expect, beforeEach, it, vi } from 'vitest';
import { createMock } from 'zodock';
import { pagedOrgSubUnitSchema } from '../../../generated/core/zod-schema';
import utils from '../../utils';
import { deleteOrgSubUnitById, getPagedOrgSubUnits } from './index';
import * as loaders from '../../utils/loaders';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getPagedOrgSubUnits: vi.fn(),
        deleteOrgSubUnitById: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

const mockGetPagedOrgSubUnits = vi.mocked(
  utils.apiClient.bff.getPagedOrgSubUnits
);
const mockDeleteOrgSubUnitById = vi.mocked(
  utils.apiClient.bff.deleteOrgSubUnitById
);
const mockParseAndLog = vi.mocked(loaders.parseAndLog);

describe('orgSubUnit API hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('deleteOrgSubUnitById', () => {
    it('calls the API with the organization and sub-unit identifiers', async () => {
      const response = { success: true };
      mockDeleteOrgSubUnitById.mockResolvedValue({
        data: response
      } as AxiosResponse);

      const { result } = renderHook(() => deleteOrgSubUnitById(123, 'SUB-001'));

      await act(async () => {
        await result.current.mutateAsync();
      });

      expect(mockDeleteOrgSubUnitById).toHaveBeenCalledWith(123, 'SUB-001');
    });

    it('returns the delete API response data', async () => {
      const response = { success: true };
      mockDeleteOrgSubUnitById.mockResolvedValue({
        data: response
      } as AxiosResponse);

      const { result } = renderHook(() => deleteOrgSubUnitById(123, 'SUB-001'));

      let mutationResult: unknown;
      await act(async () => {
        mutationResult = await result.current.mutateAsync();
      });

      expect(mutationResult).toEqual(response);
    });

    it('propagates API errors', async () => {
      mockDeleteOrgSubUnitById.mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => deleteOrgSubUnitById(123, 'SUB-001'));

      await expect(
        act(async () => {
          await result.current.mutateAsync();
        })
      ).rejects.toThrow('Delete failed');
    });
  });
});
