import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor } from '../__tests__/renderers';
import utils from '../utils';
import { getDebtPositionTypeOrgOperators } from './debtPositionTypeOrgOperators';
import { parseAndLog } from '../utils/loaders';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { PagedDebtPositionTypeOrgOperatorDTO } from '../../generated/data-contracts';

type OperatorQueryKey = [string, number, Record<string, unknown>];

vi.mock('../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionTypeOrgOperators: vi.fn()
      }
    }
  }
}));

vi.mock('../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

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

    (
      utils.apiClient.bff.getDebtPositionTypeOrgOperators as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const { result } = renderHook(() =>
      getDebtPositionTypeOrgOperators(3, { page: 0, size: 10 })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(
      3,
      { page: 0, size: 10 }
    );
    expect(parseAndLog).toHaveBeenCalledWith(expect.anything(), mockData);
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

    const { result } = renderHook(() =>
      getDebtPositionTypeOrgOperators(3, {
        page: 0,
        size: 10,
        sort: ['operator,asc', 'firstName,desc']
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(
      3,
      {
        page: 0,
        size: 10,
        sort: ['operator,asc', 'firstName,desc']
      }
    );
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

    const { result } = renderHook(() =>
      getDebtPositionTypeOrgOperators(3, {
        debtPositionTypeOrgId: 123,
        page: 0,
        size: 10
      })
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(
      3,
      {
        debtPositionTypeOrgId: 123,
        page: 0,
        size: 10
      }
    );
  });

  it('should handle errors correctly', async () => {
    const error = new Error('API error');
    (
      utils.apiClient.bff.getDebtPositionTypeOrgOperators as Mock
    ).mockRejectedValue(error);

    renderHook(() => getDebtPositionTypeOrgOperators(3, { page: 0, size: 10 }));

    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalledWith(3, { page: 0, size: 10 });

    expect(
      utils.apiClient.bff.getDebtPositionTypeOrgOperators
    ).toHaveBeenCalled();
  });

  it('should use correct query key structure', async () => {
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

    renderHook(() => getDebtPositionTypeOrgOperators(3, queryParams));

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
