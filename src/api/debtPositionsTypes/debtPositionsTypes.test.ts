import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook } from '../../__tests__/renderers';
import utils from '../../utils';
import { getDebtPositionTypeWithCount } from '../debtPositionsTypes';
import { parseAndLog } from '../../utils/loaders';
import { DebtPositionTypeWithCountFilteredRequest } from './mappings';

vi.mock('../../utils', () => ({
  default: {
    apiClient: {
      bff: {
        getDebtPositionTypeWithCount: vi.fn()
      }
    }
  }
}));

vi.mock('../../utils/loaders', () => ({
  parseAndLog: vi.fn()
}));

describe('getDebtPositionTypeWithCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and return paged debt position types with count', async () => {
    const mockData = {
      content: [
        { id: 1, description: 'Type A', count: 5 },
        { id: 2, description: 'Type B', count: 10 }
      ],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 10
    };

    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 123;
    const query: DebtPositionTypeWithCountFilteredRequest = {
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledWith(
      organizationId,
      {
        page: 0,
        size: 10
      },
      {
        paramsSerializer: { indexes: null }
      }
    );
    expect(parseAndLog).toHaveBeenCalledWith(expect.any(Object), mockData);
  });

  it('should handle query with sort parameters and description filter', async () => {
    const mockData = {
      content: [
        { id: 2, description: 'Type B', count: 10 },
        { id: 1, description: 'Type A', count: 5 }
      ],
      totalElements: 2,
      totalPages: 1,
      number: 0,
      size: 10
    };

    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 123;
    const query: DebtPositionTypeWithCountFilteredRequest = {
      filters: { description: 'Type A' },
      pagination: { page: 0, size: 10 },
      sort: ['count,desc']
    };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledWith(
      organizationId,
      {
        page: 0,
        size: 10,
        description: 'Type A',
        sort: ['count,desc']
      },
      {
        paramsSerializer: { indexes: null }
      }
    );
  });

  it('should handle null response correctly', async () => {
    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: null
    });

    const organizationId = 123;
    const query: DebtPositionTypeWithCountFilteredRequest = {
      filters: {},
      pagination: { page: 0, size: 10 },
      sort: []
    };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toBeNull();
    expect(parseAndLog).not.toHaveBeenCalled();
  });
});
