import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '../__tests__/renderers';
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
    it('calls API correctly with filters, pagination, and sort', async () => {
      const dataMock = createMock(pagedDebtPositionTypeOrgWithCountSchema);
      mockGetDebtPositionTypeOrgWithCount.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const organizationId = 123;
      const filters = { code: 'TEST' };
      const pagination = { page: 0, size: 10 };
      const sort: Array<string> = [];

      const { result } = renderHook(() =>
        useDebtPositionTypeOrgSearch(organizationId)
      );

      await act(async () => {
        // mutateAsync to await completion
        await result.current.mutateAsync({ filters, pagination, sort });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Because the hook constructs query by spreading filters + pagination + sort
      const expectedQuery = { ...filters, ...pagination, sort };

      expect(mockGetDebtPositionTypeOrgWithCount).toHaveBeenCalledWith(
        organizationId,
        expectedQuery
      );
      expect(result.current.data).toEqual(dataMock);
    });
  });

  describe('useManagedOrgsSearch', () => {
    it('calls API correctly with filters, pagination, and sort', async () => {
      const dataMock = createMock(
        pagedOrganizationWithDebtPositionTypeOrgCountSchema
      );
      mockGetOrganizationsWithDebtPositionTypeOrgCount.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const organizationId = 123;
      const filters = { organizationName: 'Test Org' };
      const pagination = { page: 0, size: 10 };
      const sort = ['name,asc'];

      const { result } = renderHook(() => useManagedOrgsSearch(organizationId));

      await act(async () => {
        await result.current.mutateAsync({ filters, pagination, sort });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const expectedQuery = { ...filters, ...pagination, sort };

      expect(
        mockGetOrganizationsWithDebtPositionTypeOrgCount
      ).toHaveBeenCalledWith(organizationId, expectedQuery);
      expect(result.current.data).toEqual(dataMock);
    });
  });
});
