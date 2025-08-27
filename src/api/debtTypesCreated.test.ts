import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import {
  useDebtPositionTypeOrgSearch,
  useManagedOrgsSearch
} from '../api/debtTypesCreated';
import utils from '../utils';
import {
  pagedDebtPositionTypeOrgWithCountSchema,
  pagedOrganizationWithDebtPositionTypeOrgCountSchema
} from '../../generated/zod-schema';
import { AxiosResponse } from 'axios';
import { createMock } from 'zodock';

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionTypeOrgWithCount: vi.fn(),
        getOrganizationsWithDebtPositionTypeOrgCount: vi.fn()
      }
    }
  }
}));

const mockGetDebtPositionTypeOrgWithCount = vi.mocked(
  utils.apiClient.bff.getDebtPositionTypeOrgWithCount
);

const mockGetOrganizationsWithDebtPositionTypeOrgCount = vi.mocked(
  utils.apiClient.bff.getOrganizationsWithDebtPositionTypeOrgCount
);

describe('DebtTypesCreated API hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useDebtPositionTypeOrgSearch', () => {
    it('should call the correct API endpoint with parameters', async () => {
      const dataMock = createMock(pagedDebtPositionTypeOrgWithCountSchema);

      mockGetDebtPositionTypeOrgWithCount.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const { result } = renderHook(() => useDebtPositionTypeOrgSearch());

      const params = {
        organizationId: 123,
        filters: {
          code: 'TEST',
          page: 0,
          size: 10
        }
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.data).toEqual(dataMock);
      });

      expect(mockGetDebtPositionTypeOrgWithCount).toHaveBeenCalledWith(
        params.organizationId,
        params.filters
      );
    });
  });

  describe('useManagedOrgsSearch', () => {
    it('should call the correct API endpoint with parameters', async () => {
      const dataMock = createMock(
        pagedOrganizationWithDebtPositionTypeOrgCountSchema
      );

      mockGetOrganizationsWithDebtPositionTypeOrgCount.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const { result } = renderHook(() => useManagedOrgsSearch());

      const params = {
        organizationId: 123,
        filters: {
          organizationName: 'Test Org',
          page: 0,
          size: 10
        }
      };

      result.current.mutate(params);

      await waitFor(() => {
        expect(result.current.data).toEqual(dataMock);
      });

      expect(
        mockGetOrganizationsWithDebtPositionTypeOrgCount
      ).toHaveBeenCalledWith(params.organizationId, params.filters, {
        paramsSerializer: {
          indexes: null
        }
      });
    });
  });
});
