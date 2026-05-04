import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '../../__tests__/renderers';
import {
  useOrganizationOperatorsSearch,
  useBrokerOrganizationsSearch
} from '.';
import utils from '../../utils';
import {
  pagedOrganizationOperatorSchema,
  pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema
} from '../../../generated/zod-schema';
import { AxiosResponse } from 'axios';
import { createMock } from 'zodock';
import { FilteredRequest } from '../../models/Filters';
import * as loaders from '../../utils/loaders';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getOrganizationOperators: vi.fn(),
        getOrganizationsByBrokerIdAndFilters: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

const mockGetOrganizationOperators = vi.mocked(
  utils.apiClient.bff.getOrganizationOperators
);
const mockGetOrganizationsByBrokerIdAndFilters = vi.mocked(
  utils.apiClient.bff.getOrganizationsByBrokerIdAndFilters
);
const mockParseAndLog = vi.mocked(loaders.parseAndLog);

const expectMutationToThrow = async <T>(
  mutateAsync: (params: FilteredRequest<T>) => Promise<unknown>,
  expectedError: string
) => {
  const mutateOperation = async () => {
    await act(async () => {
      await mutateAsync({
        filters: {} as T,
        pagination: { page: 0, size: 10 },
        sort: []
      });
    });
  };

  await expect(mutateOperation()).rejects.toThrow(expectedError);
};

describe('OrganizationOperators API hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useOrganizationOperatorsSearch', () => {
    it('calls API correctly with filters, pagination, and sort', async () => {
      const dataMock = createMock(pagedOrganizationOperatorSchema);
      mockGetOrganizationOperators.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const organizationId = 123;
      const filters = { firstName: 'Mario', fiscalCode: 'RSSMRA80A01H501X' };
      const pagination = { page: 0, size: 10 };
      const sort: Array<string> = [];

      const { result } = renderHook(() =>
        useOrganizationOperatorsSearch(organizationId)
      );

      await act(async () => {
        await result.current.mutateAsync({
          filters,
          pagination,
          sort
        });
      });

      expect(mockGetOrganizationOperators).toHaveBeenCalledWith(
        organizationId,
        {
          ...filters,
          ...pagination,
          sort
        }
      );
    });

    it('returns data from API response', async () => {
      const dataMock = createMock(pagedOrganizationOperatorSchema);
      mockGetOrganizationOperators.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const organizationId = 123;

      const { result } = renderHook(() =>
        useOrganizationOperatorsSearch(organizationId)
      );

      let mutationResult: unknown;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          filters: {},
          pagination: { page: 0, size: 10 },
          sort: []
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mutationResult).toEqual(dataMock);
    });

    it('calls parseAndLog with correct schema and data', async () => {
      const dataMock = createMock(pagedOrganizationOperatorSchema);
      mockGetOrganizationOperators.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const organizationId = 123;

      const { result } = renderHook(() =>
        useOrganizationOperatorsSearch(organizationId)
      );

      await act(async () => {
        await result.current.mutateAsync({
          filters: {},
          pagination: { page: 0, size: 10 },
          sort: []
        });
      });

      expect(mockParseAndLog).toHaveBeenCalledWith(
        pagedOrganizationOperatorSchema,
        dataMock
      );
    });

    it('handles null/undefined response correctly', async () => {
      mockGetOrganizationOperators.mockResolvedValue({
        data: null
      } as AxiosResponse);

      const organizationId = 123;

      const { result } = renderHook(() =>
        useOrganizationOperatorsSearch(organizationId)
      );

      let mutationResult: unknown;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          filters: {},
          pagination: { page: 0, size: 10 },
          sort: []
        });
      });

      expect(mutationResult).toBeNull();
      expect(mockParseAndLog).toHaveBeenCalledWith(
        pagedOrganizationOperatorSchema,
        null
      );
    });

    it('handles API errors correctly', async () => {
      const error = new Error('API Error');
      mockGetOrganizationOperators.mockRejectedValue(error);

      const organizationId = 123;

      const { result } = renderHook(() =>
        useOrganizationOperatorsSearch(organizationId)
      );

      await expectMutationToThrow(result.current.mutateAsync, 'API Error');

      expect(mockParseAndLog).not.toHaveBeenCalled();
    });
  });

  describe('useBrokerOrganizationsSearch', () => {
    it('calls API correctly with filters, pagination, and sort', async () => {
      const dataMock = createMock(
        pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema
      );
      mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const filters = { ipaCode: 'IPA001', orgName: 'Test Organization' };
      const pagination = { page: 0, size: 10 };
      const sort: Array<string> = [];

      const { result } = renderHook(() => useBrokerOrganizationsSearch());

      await act(async () => {
        await result.current.mutateAsync({
          filters,
          pagination,
          sort
        });
      });

      expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
        ...filters,
        ...pagination,
        sort
      });
    });

    it('returns data from API response', async () => {
      const dataMock = createMock(
        pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema
      );
      mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const { result } = renderHook(() => useBrokerOrganizationsSearch());

      let mutationResult: unknown;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          filters: {},
          pagination: { page: 0, size: 10 },
          sort: []
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mutationResult).toEqual(dataMock);
    });

    it('calls parseAndLog with correct schema and data', async () => {
      const dataMock = createMock(
        pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema
      );
      mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const { result } = renderHook(() => useBrokerOrganizationsSearch());

      await act(async () => {
        await result.current.mutateAsync({
          filters: {},
          pagination: { page: 0, size: 10 },
          sort: []
        });
      });

      expect(mockParseAndLog).toHaveBeenCalledWith(
        pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema,
        dataMock
      );
    });

    it('handles null/undefined response correctly', async () => {
      mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
        data: null
      } as AxiosResponse);

      const { result } = renderHook(() => useBrokerOrganizationsSearch());

      let mutationResult: unknown;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          filters: {},
          pagination: { page: 0, size: 10 },
          sort: []
        });
      });

      expect(mutationResult).toBeNull();
      expect(mockParseAndLog).toHaveBeenCalledWith(
        pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema,
        null
      );
    });

    it('handles API errors correctly', async () => {
      const error = new Error('Broker API Error');
      mockGetOrganizationsByBrokerIdAndFilters.mockRejectedValue(error);

      const { result } = renderHook(() => useBrokerOrganizationsSearch());

      await expectMutationToThrow(
        result.current.mutateAsync,
        'Broker API Error'
      );

      expect(mockParseAndLog).not.toHaveBeenCalled();
    });

    it('handles empty filters correctly', async () => {
      const dataMock = createMock(
        pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema
      );
      mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const { result } = renderHook(() => useBrokerOrganizationsSearch());

      await act(async () => {
        await result.current.mutateAsync({
          filters: {},
          pagination: { page: 0, size: 20 },
          sort: ['ipaCode']
        });
      });

      expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
        page: 0,
        size: 20,
        sort: ['ipaCode']
      });
    });

    it('handles partial filters correctly', async () => {
      const dataMock = createMock(
        pagedOrganizationWithDebtPositionTypeOrgAndOperatorsCountSchema
      );
      mockGetOrganizationsByBrokerIdAndFilters.mockResolvedValue({
        data: dataMock
      } as AxiosResponse);

      const { result } = renderHook(() => useBrokerOrganizationsSearch());

      await act(async () => {
        await result.current.mutateAsync({
          filters: { ipaCode: 'IPA123' },
          pagination: { page: 0, size: 10 },
          sort: []
        });
      });

      expect(mockGetOrganizationsByBrokerIdAndFilters).toHaveBeenCalledWith({
        ipaCode: 'IPA123',
        page: 0,
        size: 10,
        sort: []
      });
    });
  });
});
