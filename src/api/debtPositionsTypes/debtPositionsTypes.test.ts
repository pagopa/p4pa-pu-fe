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
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        },
        {
          debtPositionTypeId: 2,
          code: 'TYPE_B',
          description: 'Type B',
          updateDate: '2023-01-02T10:00:00Z',
          activeOrganizations: 10
        }
      ],
      size: 10,
      totalElements: 2,
      totalPages: 1,
      number: 0
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
    ).toHaveBeenCalledWith(organizationId, { page: 0, size: 10 });
    expect(parseAndLog).toHaveBeenCalledWith(expect.any(Object), mockData);
  });

  it('should handle query with sort parameters and description filter', async () => {
    const mockData = {
      content: [
        {
          debtPositionTypeId: 2,
          code: 'TYPE_B',
          description: 'Type B',
          updateDate: '2023-01-02T10:00:00Z',
          activeOrganizations: 10
        },
        {
          debtPositionTypeId: 1,
          code: 'TYPE_A',
          description: 'Type A',
          updateDate: '2023-01-01T10:00:00Z',
          activeOrganizations: 5
        }
      ],
      size: 10,
      totalElements: 2,
      totalPages: 1,
      number: 0
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
      sort: ['activeOrganizations,desc']
    };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledWith(organizationId, {
      page: 0,
      size: 10,
      description: 'Type A',
      sort: ['activeOrganizations,desc']
    });
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

  it('should handle empty filters correctly', async () => {
    const mockData = {
      content: [],
      size: 10,
      totalElements: 0,
      totalPages: 0,
      number: 0
    };

    (
      utils.apiClient.bff.getDebtPositionTypeWithCount as Mock
    ).mockResolvedValue({
      data: mockData
    });

    const organizationId = 123;
    const query: DebtPositionTypeWithCountFilteredRequest = {
      filters: {},
      pagination: { page: 1, size: 25 },
      sort: ['description,asc']
    };

    const { result } = renderHook(() =>
      getDebtPositionTypeWithCount({ organizationId })
    );

    const data = await result.current.mutateAsync(query);

    expect(data).toEqual(mockData);
    expect(
      utils.apiClient.bff.getDebtPositionTypeWithCount
    ).toHaveBeenCalledWith(organizationId, {
      page: 1,
      size: 25,
      sort: ['description,asc']
    });
  });
});
