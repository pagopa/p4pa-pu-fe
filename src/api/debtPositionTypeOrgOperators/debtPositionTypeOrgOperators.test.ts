import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook } from '../../__tests__/renderers';
import utils from '../../utils';
import { getDebtPositionTypeOrgOperators } from '.';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { PagedDebtPositionTypeOrgOperatorDTO } from '../../../generated/data-contracts';
import { AxiosResponse } from 'axios';

type OperatorQueryKey = [string, number, Record<string, unknown>];

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>(
    '@tanstack/react-query'
  );

  return {
    ...actual,
    useQuery: vi.fn(
      (
        options: UseQueryOptions<
          PagedDebtPositionTypeOrgOperatorDTO,
          Error,
          PagedDebtPositionTypeOrgOperatorDTO,
          OperatorQueryKey
        >
      ) => {
        useQueryMock.lastOptions = options;
        return actual.useQuery(options);
      }
    )
  };
});

type QueryMock = {
  lastOptions: UseQueryOptions<
    PagedDebtPositionTypeOrgOperatorDTO,
    Error,
    PagedDebtPositionTypeOrgOperatorDTO,
    OperatorQueryKey
  > | null;
};

const useQueryMock: QueryMock = {
  lastOptions: null
};

describe('getDebtPositionTypeOrgOperators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.lastOptions = null;
  });

  it('should fetch and return operators with default parameters', async () => {
    const mockData: PagedDebtPositionTypeOrgOperatorDTO = {
      content: [
        {
          operatorId: 'op1',
          firstName: 'John',
          lastName: 'Doe',
          mappedExternalUserId: 'ext1',
          enabled: true
        }
      ],
      totalPages: 1,
      number: 0,
      size: 10,
      totalElements: 1
    };

    vi.spyOn(
      utils.apiClient.bff,
      'getDebtPositionTypeOrgOperators'
    ).mockResolvedValue({ data: mockData } as AxiosResponse);

    const { result } = renderHook(() => getDebtPositionTypeOrgOperators(3));

    const data = await result.current.mutateAsync({
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: []
    });

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(3, { page: 0, size: 10, sort: [] });
  });

  it('should handle sort parameters correctly', async () => {
    const mockData: PagedDebtPositionTypeOrgOperatorDTO = {
      content: [],
      totalPages: 0,
      number: 0,
      size: 10,
      totalElements: 0
    };

    (
      utils.apiClient.bff.getDebtPositionTypeOrgOperators as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const { result } = renderHook(() => getDebtPositionTypeOrgOperators(3));

    const data = await result.current.mutateAsync({
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: ['operator,asc', 'firstName,desc']
    });

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(3, {
      page: 0,
      size: 10,
      sort: ['operator,asc', 'firstName,desc']
    });
  });

  it('should handle debtPositionTypeOrgId parameter', async () => {
    const mockData: PagedDebtPositionTypeOrgOperatorDTO = {
      content: [],
      totalPages: 0,
      number: 0,
      size: 10,
      totalElements: 0
    };

    (
      utils.apiClient.bff.getDebtPositionTypeOrgOperators as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const { result } = renderHook(() => getDebtPositionTypeOrgOperators(3));

    const data = await result.current.mutateAsync({
      filters: { debtPositionTypeOrgId: 123 },
      pagination: { page: 0, size: 10 },
      sort: []
    });

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(3, {
      debtPositionTypeOrgId: 123,
      page: 0,
      size: 10,
      sort: []
    });
  });

  it('should handle errors correctly', async () => {
    const error = new Error('API error');
    (
      utils.apiClient.bff.getDebtPositionTypeOrgOperators as Mock
    ).mockRejectedValue(error);

    const { result } = renderHook(() => getDebtPositionTypeOrgOperators(3));

    expect(
      result.current.mutateAsync({
        filters: {},
        pagination: { page: 0, size: 10 },
        sort: []
      })
    ).rejects.toThrow('API error');
  });

  it.skip('should use correct query key structure', async () => {
    const mockData: PagedDebtPositionTypeOrgOperatorDTO = {
      content: [],
      totalPages: 0,
      number: 0,
      size: 10,
      totalElements: 0
    };

    (
      utils.apiClient.bff.getDebtPositionTypeOrgOperators as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const queryParams = {
      debtPositionTypeOrgId: 123,
      page: 0,
      size: 10,
      sort: ['operator,asc']
    };

    const { result } = renderHook(() => getDebtPositionTypeOrgOperators(3));

    result.current.mutateAsync({
      filters: { debtPositionTypeOrgId: 123 },
      pagination: { page: 0, size: 10 },
      sort: []
    });

    expect(useQueryMock.lastOptions).toBeTruthy();
    if (useQueryMock.lastOptions) {
      expect(useQueryMock.lastOptions.queryKey).toEqual([
        'getDebtPositionTypeOrgOperators',
        3,
        queryParams
      ]);
    }
  });
});
